import { useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import { backfillFraudScores, fetchFraudScores, fetchFraudStats, updateFraudAction } from "../../../services/adminAiService";
import { formatDateTime, formatMoney } from "../../../utils/formatters";
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 20;
const LEVELS = ["high", "medium", "low"];
const ACTIONS = ["review", "allow", "cleared", "confirmed_fraud"];
const LEVEL_CLASSES = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-green-50 text-green-700 border-green-200",
};
const BAR_CLASSES = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-green-500" };
const ACTION_CLASSES = {
    review: "text-amber-700",
    allow: "text-gray-500",
    cleared: "text-green-700",
    confirmed_fraud: "text-red-700",
};
const SELECT_CLASS = "block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm";

/** Giao dịch được chấm điểm rủi ro gian lận (quy tắc giải thích được) để admin xem xét, đánh dấu hợp lệ / gian lận. */
function AdminFraud() {
    const t = useT();
    const [form, setForm] = useState({ level: "", action: "", q: "" });
    const [filters, setFilters] = useState({ level: "", action: "review", q: "" });
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        setForm(filters);
    }, [filters]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        Promise.all([fetchFraudScores({ ...filters, page, limit: PAGE_SIZE }), fetchFraudStats()])
            .then(([list, counts]) => {
                if (cancelled) return;
                setResult(list);
                setStats(counts);
            })
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [filters, page, reloadKey]);

    const set = (name) => (event) => setForm((prev) => ({ ...prev, [name]: event.target.value }));

    const run = async (action) => {
        setBusy(true);
        setError("");
        setNotice("");
        try {
            const message = await action();
            if (message) setNotice(message);
            setReloadKey((k) => k + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const mark = (item, actionTaken) => run(async () => {
        await updateFraudAction(item.id, actionTaken);
        return null;
    });
    const backfill = () => run(async () => t("admin.fraud.backfillDone", { count: (await backfillFraudScores()).scored }));

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-extrabold text-primary">{t("admin.fraud.title")}</h1>
                    <p className="text-sm text-gray-500 mt-1 max-w-3xl">{t("admin.fraud.subtitle")}</p>
                </div>
                <button type="button" disabled={busy} onClick={backfill} className="px-4 py-2 rounded-lg text-sm font-bold border border-gray-300 bg-white disabled:opacity-50">
                    {t("admin.fraud.backfill")}
                </button>
            </div>

            {stats && (
                <div className="flex flex-wrap gap-2" data-testid="fraud-stats">
                    {LEVELS.map((level) => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => {
                                setFilters({ level, action: "", q: "" });
                                setPage(1);
                            }}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full border ${LEVEL_CLASSES[level]}`}
                        >
                            {t(`admin.fraud.levels.${level}`)}: {stats[level] ?? 0}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            setFilters({ level: "", action: "review", q: "" });
                            setPage(1);
                        }}
                        className="text-xs font-bold px-3 py-1.5 rounded-full border border-gray-300 bg-white"
                    >
                        {t("admin.fraud.toReview")}: {stats.toReview ?? 0}
                    </button>
                </div>
            )}

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setFilters({ ...form, q: form.q.trim() });
                    setPage(1);
                }}
                className="flex flex-wrap items-end gap-3"
            >
                <label className="text-xs font-semibold text-gray-500">
                    {t("admin.fraud.filters.level")}
                    <select value={form.level} onChange={set("level")} className={SELECT_CLASS}>
                        <option value="">{t("admin.fraud.filters.all")}</option>
                        {LEVELS.map((level) => (
                            <option key={level} value={level}>{t(`admin.fraud.levels.${level}`)}</option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    {t("admin.fraud.filters.action")}
                    <select value={form.action} onChange={set("action")} className={SELECT_CLASS}>
                        <option value="">{t("admin.fraud.filters.all")}</option>
                        {ACTIONS.map((action) => (
                            <option key={action} value={action}>{t(`admin.fraud.actions.${action}`)}</option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    {t("admin.fraud.filters.search")}
                    <input value={form.q} onChange={set("q")} className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm w-64" />
                </label>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white">
                    {t("admin.fraud.filters.apply")}
                </button>
            </form>
            <FormAlert type="success">{notice}</FormAlert>
            <FormAlert>{error}</FormAlert>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm min-w-[980px]" data-testid="fraud-table">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-4 py-3 text-left">{t("admin.fraud.columns.created")}</th>
                            <th className="px-4 py-3 text-left">{t("admin.fraud.columns.order")}</th>
                            <th className="px-4 py-3 text-left">{t("admin.fraud.columns.customer")}</th>
                            <th className="px-4 py-3 text-right">{t("admin.fraud.columns.amount")}</th>
                            <th className="px-4 py-3 text-left">{t("admin.fraud.columns.risk")}</th>
                            <th className="px-4 py-3 text-left">{t("admin.fraud.columns.reasons")}</th>
                            <th className="px-4 py-3 text-left">{t("admin.fraud.columns.action")}</th>
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
                                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">{t("admin.fraud.empty")}</td>
                            </tr>
                        ) : (
                            result.items.map((item) => (
                                <tr key={item.id} className="border-t border-gray-100 align-top">
                                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(item.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-mono text-xs font-bold">{item.orderCode}</p>
                                        <p className="text-xs text-gray-400">
                                            {t(`admin.fraud.paymentStatus.${item.paymentStatus}`, { defaultValue: item.paymentStatus })}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="truncate max-w-[200px]">{item.userName || "—"}</p>
                                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{item.userEmail}</p>
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">{formatMoney(item.amount, item.currencyCode)}</td>
                                    <td className="px-4 py-3 min-w-[140px]">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${LEVEL_CLASSES[item.riskLevel]}`}>
                                                {t(`admin.fraud.levels.${item.riskLevel}`)}
                                            </span>
                                            <span className="text-xs font-bold">{Math.round(item.riskScore * 100)}</span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                            <div className={`h-full ${BAR_CLASSES[item.riskLevel]}`} style={{ width: `${Math.round(item.riskScore * 100)}%` }} />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1 max-w-[320px]">
                                            {item.reasons.length === 0 && <span className="text-xs text-gray-400">—</span>}
                                            {item.reasons.map((reason) => (
                                                <span
                                                    key={reason.code}
                                                    title={`+${Math.round(reason.weight * 100)}`}
                                                    className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700"
                                                >
                                                    {t(`admin.fraud.reasons.${reason.code}`, { defaultValue: reason.code })}
                                                    {reason.value ? ` (${reason.value})` : ""}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className={`px-4 py-3 text-xs font-bold whitespace-nowrap ${ACTION_CLASSES[item.actionTaken] || ""}`}>
                                        {t(`admin.fraud.actions.${item.actionTaken}`, { defaultValue: item.actionTaken })}
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                                        {item.actionTaken !== "cleared" && (
                                            <button type="button" disabled={busy} onClick={() => mark(item, "cleared")} className="text-xs font-bold text-green-700 hover:underline disabled:opacity-50">
                                                {t("admin.fraud.markCleared")}
                                            </button>
                                        )}
                                        {item.actionTaken !== "confirmed_fraud" && (
                                            <button type="button" disabled={busy} onClick={() => mark(item, "confirmed_fraud")} className="text-xs font-bold text-red-600 hover:underline disabled:opacity-50">
                                                {t("admin.fraud.markFraud")}
                                            </button>
                                        )}
                                        {(item.actionTaken === "cleared" || item.actionTaken === "confirmed_fraud") && (
                                            <button type="button" disabled={busy} onClick={() => mark(item, "review")} className="text-xs font-bold text-gray-600 hover:underline disabled:opacity-50">
                                                {t("admin.fraud.markReview")}
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

export default AdminFraud;
