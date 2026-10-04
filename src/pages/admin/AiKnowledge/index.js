import { useCallback, useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import {
    deleteKnowledgeDocument,
    fetchKnowledgeDocuments,
    reindexKnowledge,
    setKnowledgeDocumentActive,
    uploadKnowledgeDocument,
} from "../../../services/adminAiService";
import { formatDateTime } from "../../../utils/formatters";
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 20;
const SOURCE_TYPES = ["policy", "faq", "guide", "hotel", "tour", "car", "flight", "destination", "other"];
const EMPTY_FILTERS = { q: "", sourceType: "", language: "", active: "" };
const EMPTY_UPLOAD = { title: "", sourceType: "policy", sourceId: "", language: "vi", url: "" };
const inputClass = "block mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm";

/** Kho tài liệu cho trợ lý AI (RAG): tải lên, bật/tắt, xoá, lập chỉ mục lại. */
function AdminAiKnowledge() {
    const t = useT();
    const [form, setForm] = useState(EMPTY_FILTERS);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [upload, setUpload] = useState(EMPTY_UPLOAD);
    const [file, setFile] = useState(null);
    const [fileKey, setFileKey] = useState(0);
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        setError("");
        return fetchKnowledgeDocuments({ ...filters, page, limit: PAGE_SIZE })
            .then(setResult)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [filters, page]);

    useEffect(() => {
        load();
    }, [load]);

    const setUp = (name) => (event) => setUpload((prev) => ({ ...prev, [name]: event.target.value }));
    const setF = (name) => (event) => setForm((prev) => ({ ...prev, [name]: event.target.value }));

    const submitUpload = async (event) => {
        event.preventDefault();
        if (!file) return;
        setBusy(true);
        setError("");
        setNotice("");
        try {
            const doc = await uploadKnowledgeDocument({ ...upload, file });
            setNotice(t("admin.aiKnowledge.uploaded", { title: doc.title, chunks: doc.chunkCount, version: doc.version }));
            setUpload(EMPTY_UPLOAD);
            setFile(null);
            setFileKey((k) => k + 1);
            setPage(1);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const toggle = async (doc) => {
        setError("");
        try {
            const updated = await setKnowledgeDocumentActive(doc.id, !doc.isActive);
            setResult((prev) => ({ ...prev, items: prev.items.map((d) => (d.id === doc.id ? updated : d)) }));
        } catch (err) {
            setError(err.message);
        }
    };

    const remove = async (doc) => {
        if (!window.confirm(t("admin.aiKnowledge.deleteConfirm", { title: doc.title }))) return;
        setError("");
        try {
            await deleteKnowledgeDocument(doc.id);
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    const reindex = async (full) => {
        if (full && !window.confirm(t("admin.aiKnowledge.reindexAllConfirm"))) return;
        setBusy(true);
        setError("");
        setNotice("");
        try {
            const data = await reindexKnowledge(full);
            setNotice(t("admin.aiKnowledge.reindexed", { documents: data.documents, chunks: data.chunks }));
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-extrabold text-primary">{t("admin.aiKnowledge.title")}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t("admin.aiKnowledge.subtitle")}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => reindex(false)}
                        className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 disabled:opacity-50"
                    >
                        {t("admin.aiKnowledge.reindexStale")}
                    </button>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => reindex(true)}
                        className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 disabled:opacity-50"
                    >
                        {t("admin.aiKnowledge.reindexAll")}
                    </button>
                </div>
            </div>

            <form onSubmit={submitUpload} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                <h2 className="text-lg font-extrabold">{t("admin.aiKnowledge.uploadTitle")}</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <label className="text-xs font-semibold text-gray-500 md:col-span-3">
                        {t("admin.aiKnowledge.file")}
                        <input
                            key={fileKey}
                            type="file"
                            accept=".txt,.md,.pdf"
                            required
                            onChange={(event) => setFile(event.target.files?.[0] || null)}
                            className={inputClass}
                        />
                        <span className="block mt-1 font-normal">{t("admin.aiKnowledge.fileHint")}</span>
                    </label>
                    <label className="text-xs font-semibold text-gray-500">
                        {t("admin.aiKnowledge.docTitle")}
                        <input value={upload.title} onChange={setUp("title")} maxLength={255} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-gray-500">
                        {t("admin.aiKnowledge.sourceType")}
                        <select value={upload.sourceType} onChange={setUp("sourceType")} className={inputClass}>
                            {SOURCE_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {t(`admin.aiKnowledge.sourceTypes.${type}`)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs font-semibold text-gray-500">
                        {t("admin.aiKnowledge.language")}
                        <select value={upload.language} onChange={setUp("language")} className={inputClass}>
                            <option value="vi">{t("admin.aiKnowledge.languages.vi")}</option>
                            <option value="en">{t("admin.aiKnowledge.languages.en")}</option>
                        </select>
                    </label>
                    <label className="text-xs font-semibold text-gray-500">
                        {t("admin.aiKnowledge.sourceId")}
                        <input
                            value={upload.sourceId}
                            onChange={setUp("sourceId")}
                            placeholder="00000000-0000-0000-0000-000000000000"
                            className={inputClass}
                        />
                        <span className="block mt-1 font-normal">{t("admin.aiKnowledge.sourceIdHint")}</span>
                    </label>
                    <label className="text-xs font-semibold text-gray-500 md:col-span-2">
                        {t("admin.aiKnowledge.url")}
                        <input value={upload.url} onChange={setUp("url")} className={inputClass} />
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={busy || !file}
                    className="px-5 py-2 rounded-lg text-sm font-bold bg-primary text-white disabled:opacity-50"
                >
                    {busy ? t("admin.aiKnowledge.processing") : t("admin.aiKnowledge.upload")}
                </button>
            </form>

            <FormAlert type="success">{notice}</FormAlert>
            <FormAlert>{error}</FormAlert>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setFilters({ ...form, q: form.q.trim() });
                    setPage(1);
                }}
                className="flex flex-wrap items-end gap-3"
            >
                <label className="text-xs font-semibold text-gray-500">
                    {t("admin.aiKnowledge.searchTitle")}
                    <input value={form.q} onChange={setF("q")} className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    {t("admin.aiKnowledge.sourceType")}
                    <select value={form.sourceType} onChange={setF("sourceType")} className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option value="">{t("admin.aiKnowledge.all")}</option>
                        {SOURCE_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {t(`admin.aiKnowledge.sourceTypes.${type}`)}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    {t("admin.aiKnowledge.language")}
                    <select value={form.language} onChange={setF("language")} className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option value="">{t("admin.aiKnowledge.all")}</option>
                        <option value="vi">{t("admin.aiKnowledge.languages.vi")}</option>
                        <option value="en">{t("admin.aiKnowledge.languages.en")}</option>
                    </select>
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    {t("admin.aiKnowledge.status")}
                    <select value={form.active} onChange={setF("active")} className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option value="">{t("admin.aiKnowledge.all")}</option>
                        <option value="true">{t("admin.aiKnowledge.active")}</option>
                        <option value="false">{t("admin.aiKnowledge.inactive")}</option>
                    </select>
                </label>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white">
                    {t("admin.aiKnowledge.filter")}
                </button>
            </form>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm min-w-[860px]" data-testid="knowledge-table">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-4 py-3 text-left">{t("admin.aiKnowledge.docTitle")}</th>
                            <th className="px-4 py-3 text-left">{t("admin.aiKnowledge.sourceType")}</th>
                            <th className="px-4 py-3 text-center">{t("admin.aiKnowledge.language")}</th>
                            <th className="px-4 py-3 text-right">{t("admin.aiKnowledge.version")}</th>
                            <th className="px-4 py-3 text-right">{t("admin.aiKnowledge.chunks")}</th>
                            <th className="px-4 py-3 text-left">{t("admin.aiKnowledge.indexedAt")}</th>
                            <th className="px-4 py-3 text-center">{t("admin.aiKnowledge.status")}</th>
                            <th className="px-4 py-3 text-right">{t("admin.aiKnowledge.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                                    {t("common.state.loading")}
                                </td>
                            </tr>
                        ) : result.items.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                                    {t("admin.aiKnowledge.empty")}
                                </td>
                            </tr>
                        ) : (
                            result.items.map((doc) => (
                                <tr key={doc.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3">
                                        <p className="font-semibold">{doc.title}</p>
                                        <p className="text-xs text-gray-400">
                                            {t("admin.aiKnowledge.chars", { count: doc.contentLength })} · {doc.embeddingModel}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">{t(`admin.aiKnowledge.sourceTypes.${doc.sourceType}`, { defaultValue: doc.sourceType })}</td>
                                    <td className="px-4 py-3 text-center uppercase">{doc.language}</td>
                                    <td className="px-4 py-3 text-right">v{doc.version}</td>
                                    <td className="px-4 py-3 text-right">{doc.chunkCount}</td>
                                    <td className="px-4 py-3 text-xs">{formatDateTime(doc.indexedAt)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                doc.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                            }`}
                                        >
                                            {doc.isActive ? t("admin.aiKnowledge.active") : t("admin.aiKnowledge.inactive")}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <button type="button" onClick={() => toggle(doc)} className="text-primary font-semibold text-xs mr-3">
                                            {doc.isActive ? t("admin.aiKnowledge.deactivate") : t("admin.aiKnowledge.activate")}
                                        </button>
                                        <button type="button" onClick={() => remove(doc)} className="text-red-600 font-semibold text-xs">
                                            {t("common.actions.delete")}
                                        </button>
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

export default AdminAiKnowledge;
