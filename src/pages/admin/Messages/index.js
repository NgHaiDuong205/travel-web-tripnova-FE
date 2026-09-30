import { useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../../components/common/StatusBadge";
import {
    CONTACT_STATUS_LABELS,
    deleteAdminContactMessage,
    fetchAdminContactMessages,
    replyAdminContactMessage,
    updateAdminContactStatus,
} from "../../../services/adminService";
import { formatDateTime } from "../../../utils/formatters";
import AdminStatsPanel from "../../../components/admin/AdminStatsPanel";

const PAGE_SIZE = 20;

function AdminMessages() {
    const [status, setStatus] = useState("new");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    const replaceItem = (updated) =>
        setResult((prev) => ({ ...prev, items: prev.items.map((m) => (m.id === updated.id ? updated : m)) }));

    const handleReply = async (e, message) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setBusyId(message.id);
        setError("");
        try {
            replaceItem(await replyAdminContactMessage(message.id, replyText.trim()));
            setReplyingId(null);
            setReplyText("");
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (message) => {
        if (!window.confirm(`Xoá tin nhắn của ${message.fullName}?`)) return;
        setBusyId(message.id);
        setError("");
        try {
            await deleteAdminContactMessage(message.id);
            setReloadKey((k) => k + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchAdminContactMessages({ status, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [status, page, reloadKey]);

    const handleStatusChange = async (message, nextStatus) => {
        setBusyId(message.id);
        setError("");
        try {
            replaceItem(await updateAdminContactStatus(message.id, nextStatus));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">Contact messages</h1>
            <AdminStatsPanel section="messages" />

            <div className="flex items-center gap-3">
                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-lg border-gray-200 text-sm"
                >
                    <option value="all">All statuses</option>
                    {Object.entries(CONTACT_STATUS_LABELS).map(([value, cfg]) => (
                        <option key={value} value={value}>{cfg.label}</option>
                    ))}
                </select>
                <span className="ml-auto text-sm text-gray-500">{result.total.toLocaleString()} messages</span>
            </div>

            <FormAlert>{error}</FormAlert>

            {loading && <p className="text-gray-500">Đang tải...</p>}
            {!loading && result.items.length === 0 && <p className="text-gray-500">Không có tin nhắn nào.</p>}

            <div className="space-y-4">
                {!loading &&
                    result.items.map((m) => (
                        <article key={m.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                                <div>
                                    <p className="font-bold text-gray-900">{m.subject || "(No subject)"}</p>
                                    <p className="text-sm text-gray-500">
                                        {m.fullName} · <a href={`mailto:${m.email}`} className="text-primary hover:underline">{m.email}</a>
                                        {m.phone ? ` · ${m.phone}` : ""} · {formatDateTime(m.createdAt)}
                                        {m.userId ? " · registered user" : ""}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={m.status} labels={CONTACT_STATUS_LABELS} />
                                    <select
                                        value={m.status}
                                        disabled={busyId === m.id}
                                        onChange={(e) => handleStatusChange(m, e.target.value)}
                                        className="rounded-lg border-gray-200 text-xs"
                                        aria-label="Change status"
                                    >
                                        {Object.entries(CONTACT_STATUS_LABELS).map(([value, cfg]) => (
                                            <option key={value} value={value}>{cfg.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{m.message}</p>

                            {m.replyContent && (
                                <div className="mt-4 border-l-4 border-green-300 bg-green-50 rounded-r-lg px-4 py-3">
                                    <p className="text-xs font-semibold text-green-800 mb-1">Replied {formatDateTime(m.repliedAt)}</p>
                                    <p className="text-sm text-gray-700 whitespace-pre-line">{m.replyContent}</p>
                                </div>
                            )}

                            {replyingId === m.id ? (
                                <form onSubmit={(e) => handleReply(e, m)} className="mt-4 space-y-2">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        rows={4}
                                        maxLength={5000}
                                        placeholder={`Reply to ${m.email}...`}
                                        className="w-full rounded-lg border-gray-200 text-sm"
                                        autoFocus
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setReplyingId(null)}
                                            className="px-4 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={busyId === m.id || !replyText.trim()}
                                            className="px-4 py-1.5 rounded-lg text-sm font-bold bg-primary text-white disabled:opacity-50"
                                        >
                                            Send reply
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="mt-4 flex gap-2 justify-end">
                                    {m.status !== "spam" && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReplyingId(m.id);
                                                setReplyText("");
                                            }}
                                            className="px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 text-primary hover:bg-blue-50"
                                        >
                                            {m.replyContent ? "Reply again" : "Reply"}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        disabled={busyId === m.id}
                                        onClick={() => handleDelete(m)}
                                        className="px-3 py-1 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </article>
                    ))}
            </div>

            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

export default AdminMessages;
