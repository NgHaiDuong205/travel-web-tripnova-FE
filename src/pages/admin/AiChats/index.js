import { useEffect, useState } from "react";
import ChatMarkdown from "../../../components/ai/ChatMarkdown";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import { fetchAdminChatMessages, fetchAdminChatSessions } from "../../../services/adminAiService";
import { formatDateTime } from "../../../utils/formatters";
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 20;
const EMPTY_FILTERS = { q: "", from: "", to: "" };

/** Xem lại các phiên chat với trợ lý AI: câu hỏi, câu trả lời, SQL đã sinh, nguồn tài liệu, đánh giá. */
function AdminAiChats() {
    const t = useT();
    const [form, setForm] = useState(EMPTY_FILTERS);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchAdminChatSessions({ ...filters, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [filters, page]);

    useEffect(() => {
        if (!selected) return undefined;
        let cancelled = false;
        setLoadingMessages(true);
        fetchAdminChatMessages(selected.id)
            .then((data) => !cancelled && setMessages(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoadingMessages(false));
        return () => {
            cancelled = true;
        };
    }, [selected]);

    const set = (name) => (event) => setForm((prev) => ({ ...prev, [name]: event.target.value }));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">{t("admin.aiChats.title")}</h1>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setFilters({ ...form, q: form.q.trim() });
                    setPage(1);
                }}
                className="flex flex-wrap items-end gap-3"
            >
                <label className="text-xs font-semibold text-gray-500">
                    {t("admin.aiChats.search")}
                    <input value={form.q} onChange={set("q")} className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm w-64" />
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    {t("common.fields.from")}
                    <input type="date" value={form.from} onChange={set("from")} className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    {t("common.fields.to")}
                    <input
                        type="date"
                        value={form.to}
                        min={form.from || undefined}
                        onChange={set("to")}
                        className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </label>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white">
                    {t("admin.aiChats.filter")}
                </button>
            </form>
            <FormAlert>{error}</FormAlert>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="w-full text-sm min-w-[520px]" data-testid="chat-sessions-table">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-left">{t("admin.aiChats.session")}</th>
                                    <th className="px-4 py-3 text-left">{t("admin.aiChats.user")}</th>
                                    <th className="px-4 py-3 text-right">{t("admin.aiChats.messages")}</th>
                                    <th className="px-4 py-3 text-right">{t("admin.aiChats.tokens")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                                            {t("common.state.loading")}
                                        </td>
                                    </tr>
                                ) : result.items.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                                            {t("admin.aiChats.empty")}
                                        </td>
                                    </tr>
                                ) : (
                                    result.items.map((s) => (
                                        <tr
                                            key={s.id}
                                            onClick={() => setSelected(s)}
                                            className={`border-t border-gray-100 cursor-pointer ${
                                                selected?.id === s.id ? "bg-primary/5" : "hover:bg-gray-50"
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-semibold truncate max-w-[240px]">{s.title || t("admin.aiChats.untitled")}</p>
                                                <p className="text-xs text-gray-400">
                                                    {formatDateTime(s.updatedAt)}
                                                    {!s.isActive && ` · ${t("admin.aiChats.closed")}`}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="truncate max-w-[200px]">{s.userFullName || "—"}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-[200px]">{s.userEmail}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right">{s.messageCount}</td>
                                            <td className="px-4 py-3 text-right">{(s.totalTokens || 0).toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4">
                        <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4 h-fit" data-testid="chat-detail">
                    {!selected ? (
                        <p className="text-sm text-gray-400">{t("admin.aiChats.pick")}</p>
                    ) : loadingMessages ? (
                        <p className="text-sm text-gray-400">{t("common.state.loading")}</p>
                    ) : (
                        <>
                            <div>
                                <h2 className="text-lg font-extrabold">{selected.title || t("admin.aiChats.untitled")}</h2>
                                <p className="text-xs text-gray-400">
                                    {selected.userEmail}
                                    {selected.contextType && ` · ${t("admin.aiChats.context")}: ${selected.contextType} ${selected.contextId}`}
                                </p>
                            </div>
                            {messages.map((m) => (
                                <AdminMessage key={m.id} message={m} t={t} />
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function AdminMessage({ message, t }) {
    if (message.role === "user") {
        return (
            <div className="rounded-lg bg-primary/5 px-4 py-3">
                <p className="text-[11px] font-bold uppercase text-primary">{t("admin.aiChats.question")}</p>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
        );
    }
    return (
        <div className={`rounded-lg border px-4 py-3 ${message.isError ? "border-red-200 bg-red-50" : "border-gray-200"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 mb-2">
                <span className="font-bold uppercase">{t("admin.aiChats.answer")}</span>
                <span>
                    {message.modelName || "—"} · {t("admin.aiChats.tokenCount", {
                        prompt: message.promptTokens ?? 0,
                        completion: message.completionTokens ?? 0,
                    })}{" "}
                    · {message.latencyMs ?? 0} ms
                    {message.feedbackHelpful === true && " · 👍"}
                    {message.feedbackHelpful === false && " · 👎"}
                </span>
            </div>
            {message.isError ? (
                <p className="text-sm text-red-700">
                    {message.content} <code className="text-xs">({message.errorMessage})</code>
                </p>
            ) : (
                <ChatMarkdown text={message.content} />
            )}
            {message.sql && (
                <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-semibold text-gray-600">
                        SQL · {t("admin.aiChats.rows", { count: message.rowCount ?? 0 })}
                        {message.sqlFailed && <span className="ml-2 text-red-600">{t("admin.aiChats.sqlFailed")}</span>}
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap break-all rounded bg-gray-900 text-gray-100 p-3 text-xs">{message.sql}</pre>
                </details>
            )}
            {message.sources?.length > 0 && (
                <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-semibold text-gray-600">
                        {t("admin.aiChats.sources", { count: message.sources.length })}
                    </summary>
                    <ul className="mt-2 space-y-2">
                        {message.sources.map((s) => (
                            <li key={s.citation} className="text-xs rounded bg-amber-50 p-2">
                                <strong>{s.citation}</strong> {s.title} · {s.score}
                                <p className="mt-1 whitespace-pre-wrap text-gray-600">{s.text}</p>
                            </li>
                        ))}
                    </ul>
                </details>
            )}
        </div>
    );
}

export default AdminAiChats;
