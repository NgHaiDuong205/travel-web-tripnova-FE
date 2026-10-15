import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import {
    backfillAiSummaries,
    cancelAiJob,
    fetchAiJobStats,
    fetchAiJobs,
    fetchAiSummaries,
    regenerateAiSummary,
    retryAiJob,
} from "../../../services/adminAiService";
import { formatDateTime } from "../../../utils/formatters";
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 20;
const STATUSES = ["pending", "running", "done", "failed", "cancelled"];
const JOB_TYPES = ["summarize_reviews"];
const ENTITY_TYPES = ["hotel", "tour", "car", "flight", "destination", "landmark"];
const STATUS_CLASSES = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    running: "bg-blue-50 text-blue-700 border-blue-200",
    done: "bg-green-50 text-green-700 border-green-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};
const SELECT_CLASS = "block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm";

const tabClass = (active) =>
    `px-4 py-2 text-sm font-bold border-b-2 ${active ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800"}`;

/** Hàng đợi job AI chạy nền (tóm tắt review...) và các bản tóm tắt review do AI sinh. */
function AdminAiJobs() {
    const t = useT();
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get("tab") === "summaries" ? "summaries" : "jobs";
    const [stats, setStats] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const reload = () => setReloadKey((k) => k + 1);

    useEffect(() => {
        let cancelled = false;
        fetchAiJobStats()
            .then((data) => !cancelled && setStats(data))
            .catch(() => !cancelled && setStats(null));
        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-extrabold text-primary">{t("admin.aiJobs.title")}</h1>
                <button type="button" onClick={reload} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold border border-gray-300 bg-white">
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    {t("admin.aiJobs.refresh")}
                </button>
            </div>
            <WorkerStatus stats={stats} t={t} />
            <div className="flex gap-2 border-b border-gray-200">
                <button type="button" onClick={() => setSearchParams({})} className={tabClass(tab === "jobs")}>
                    {t("admin.aiJobs.tabs.jobs")}
                </button>
                <button type="button" onClick={() => setSearchParams({ tab: "summaries" })} className={tabClass(tab === "summaries")}>
                    {t("admin.aiJobs.tabs.summaries")}
                </button>
            </div>
            {tab === "jobs" ? (
                <JobsTab t={t} reloadKey={reloadKey} onChanged={reload} />
            ) : (
                <SummariesTab t={t} reloadKey={reloadKey} onChanged={reload} />
            )}
        </div>
    );
}

function WorkerStatus({ stats, t }) {
    if (!stats) return null;
    return (
        <div className="space-y-3" data-testid="ai-job-stats">
            <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => (
                    <span key={status} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${STATUS_CLASSES[status]}`}>
                        {t(`admin.aiJobs.status.${status}`)}: {stats.counts?.[status] ?? 0}
                    </span>
                ))}
            </div>
            {!stats.workerEnabled && <FormAlert>{t("admin.aiJobs.worker.disabled")}</FormAlert>}
            {stats.workerEnabled && !stats.aiConfigured && <FormAlert>{t("admin.aiJobs.worker.notConfigured")}</FormAlert>}
            {stats.pausedUntil && (
                <FormAlert>
                    {t("admin.aiJobs.worker.paused", { time: formatDateTime(stats.pausedUntil), reason: stats.pauseReason || "—" })}
                </FormAlert>
            )}
        </div>
    );
}

function TargetCell({ item, t }) {
    if (!item.entityId) return "—";
    return (
        <>
            <p className="font-semibold truncate max-w-[220px]" title={item.entityName || item.entityId}>
                {item.entityName || item.entityId}
            </p>
            <p className="text-xs text-gray-400">{t(`admin.aiJobs.entityTypes.${item.entityType}`)}</p>
        </>
    );
}

function JobsTab({ t, reloadKey, onChanged }) {
    const [filters, setFilters] = useState({ status: "", type: "" });
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchAiJobs({ ...filters, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [filters, page, reloadKey]);

    const setFilter = (name) => (event) => {
        setFilters((prev) => ({ ...prev, [name]: event.target.value }));
        setPage(1);
    };

    const act = async (job, action) => {
        setBusyId(job.id);
        setError("");
        try {
            await (action === "retry" ? retryAiJob(job.id) : cancelAiJob(job.id));
            onChanged();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
                <label className="text-xs font-semibold text-gray-500">
                    {t("admin.aiJobs.filters.status")}
                    <select value={filters.status} onChange={setFilter("status")} className={SELECT_CLASS}>
                        <option value="">{t("admin.aiJobs.filters.all")}</option>
                        {STATUSES.map((status) => (
                            <option key={status} value={status}>{t(`admin.aiJobs.status.${status}`)}</option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    {t("admin.aiJobs.filters.type")}
                    <select value={filters.type} onChange={setFilter("type")} className={SELECT_CLASS}>
                        <option value="">{t("admin.aiJobs.filters.all")}</option>
                        {JOB_TYPES.map((type) => (
                            <option key={type} value={type}>{t(`admin.aiJobs.types.${type}`)}</option>
                        ))}
                    </select>
                </label>
            </div>
            <FormAlert>{error}</FormAlert>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm min-w-[860px]" data-testid="ai-jobs-table">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-4 py-3 text-left">{t("admin.aiJobs.columns.created")}</th>
                            <th className="px-4 py-3 text-left">{t("admin.aiJobs.columns.type")}</th>
                            <th className="px-4 py-3 text-left">{t("admin.aiJobs.columns.target")}</th>
                            <th className="px-4 py-3 text-left">{t("admin.aiJobs.columns.status")}</th>
                            <th className="px-4 py-3 text-right">{t("admin.aiJobs.columns.attempts")}</th>
                            <th className="px-4 py-3 text-left">{t("admin.aiJobs.columns.error")}</th>
                            <th className="px-4 py-3 text-left">{t("admin.aiJobs.columns.finished")}</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">{t("common.state.loading")}</td>
                            </tr>
                        ) : result.items.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">{t("admin.aiJobs.emptyJobs")}</td>
                            </tr>
                        ) : (
                            result.items.map((job) => (
                                <tr key={job.id} className="border-t border-gray-100 align-top">
                                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(job.createdAt)}</td>
                                    <td className="px-4 py-3">{t(`admin.aiJobs.types.${job.jobType}`, { defaultValue: job.jobType })}</td>
                                    <td className="px-4 py-3"><TargetCell item={job} t={t} /></td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_CLASSES[job.status] || STATUS_CLASSES.cancelled}`}>
                                            {t(`admin.aiJobs.status.${job.status}`)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">{job.attempts}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-xs text-red-700 truncate max-w-[220px]" title={job.errorMessage || ""}>
                                            {job.errorMessage || "—"}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">{job.finishedAt ? formatDateTime(job.finishedAt) : "—"}</td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        {(job.status === "failed" || job.status === "cancelled") && (
                                            <button type="button" disabled={busyId === job.id} onClick={() => act(job, "retry")} className="text-xs font-bold text-primary hover:underline disabled:opacity-50">
                                                {t("admin.aiJobs.actions.retry")}
                                            </button>
                                        )}
                                        {job.status === "pending" && (
                                            <button type="button" disabled={busyId === job.id} onClick={() => act(job, "cancel")} className="text-xs font-bold text-red-600 hover:underline disabled:opacity-50">
                                                {t("admin.aiJobs.actions.cancel")}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

function SummaryItems({ title, items }) {
    if (!items?.length) return null;
    return (
        <div>
            <p className="text-[11px] font-bold uppercase text-gray-500 mb-1">{title}</p>
            <ul className="list-disc pl-5 text-xs space-y-0.5">
                {items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

function SummariesTab({ t, reloadKey, onChanged }) {
    const [filters, setFilters] = useState({ entityType: "", lang: "" });
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchAiSummaries({ ...filters, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [filters, page, reloadKey]);

    const setFilter = (name) => (event) => {
        setFilters((prev) => ({ ...prev, [name]: event.target.value }));
        setPage(1);
    };

    const run = async (action) => {
        setBusy(true);
        setError("");
        setNotice("");
        try {
            setNotice(await action());
            onChanged();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const backfill = () =>
        run(async () => t("admin.aiJobs.backfillDone", { count: (await backfillAiSummaries()).queued }));
    const regenerate = (summary) =>
        run(async () => {
            await regenerateAiSummary(summary.entityType, summary.entityId);
            return t("admin.aiJobs.regenerateQueued");
        });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-wrap items-end gap-3">
                    <label className="text-xs font-semibold text-gray-500">
                        {t("admin.aiJobs.filters.entityType")}
                        <select value={filters.entityType} onChange={setFilter("entityType")} className={SELECT_CLASS}>
                            <option value="">{t("admin.aiJobs.filters.all")}</option>
                            {ENTITY_TYPES.map((type) => (
                                <option key={type} value={type}>{t(`admin.aiJobs.entityTypes.${type}`)}</option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs font-semibold text-gray-500">
                        {t("admin.aiJobs.filters.language")}
                        <select value={filters.lang} onChange={setFilter("lang")} className={SELECT_CLASS}>
                            <option value="">{t("admin.aiJobs.filters.all")}</option>
                            <option value="vi">{t("admin.aiJobs.languages.vi")}</option>
                            <option value="en">{t("admin.aiJobs.languages.en")}</option>
                        </select>
                    </label>
                </div>
                <button type="button" disabled={busy} onClick={backfill} className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white disabled:opacity-50">
                    {t("admin.aiJobs.actions.backfill")}
                </button>
            </div>
            <FormAlert type="success">{notice}</FormAlert>
            <FormAlert>{error}</FormAlert>
            {loading ? (
                <p className="text-sm text-gray-400">{t("common.state.loading")}</p>
            ) : result.items.length === 0 ? (
                <p className="text-sm text-gray-400 bg-white rounded-xl border border-gray-100 p-6 text-center">{t("admin.aiJobs.emptySummaries")}</p>
            ) : (
                <div className="grid gap-4 lg:grid-cols-2" data-testid="ai-summaries">
                    {result.items.map((summary) => (
                        <article key={`${summary.entityType}-${summary.entityId}-${summary.language}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <TargetCell item={summary} t={t} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100">{summary.language}</span>
                                    {summary.stale && (
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700">{t("admin.aiJobs.stale")}</span>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm">{summary.overview}</p>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <SummaryItems title={t("admin.aiJobs.summary.pros")} items={summary.pros} />
                                <SummaryItems title={t("admin.aiJobs.summary.cons")} items={summary.cons} />
                                <SummaryItems title={t("admin.aiJobs.summary.bestFor")} items={summary.bestFor} />
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-400">
                                    {t("admin.aiJobs.summary.meta", {
                                        based: summary.basedOnCount ?? 0,
                                        current: summary.currentReviewCount ?? 0,
                                        model: summary.modelVersion || "—",
                                        date: formatDateTime(summary.generatedAt),
                                    })}
                                </p>
                                <button type="button" disabled={busy} onClick={() => regenerate(summary)} className="text-xs font-bold text-primary hover:underline disabled:opacity-50">
                                    {t("admin.aiJobs.actions.regenerate")}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

export default AdminAiJobs;
