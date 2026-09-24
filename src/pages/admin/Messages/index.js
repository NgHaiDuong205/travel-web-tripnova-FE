import { useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../../components/common/StatusBadge";
import { CONTACT_STATUS_LABELS, fetchAdminContactMessages, updateAdminContactStatus } from "../../../services/adminService";
import { formatDateTime } from "../../../utils/formatters";

const PAGE_SIZE = 20;

function AdminMessages() {
    const [status, setStatus] = useState("new");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);

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
    }, [status, page]);

    const handleStatusChange = async (message, nextStatus) => {
        setBusyId(message.id);
        setError("");
        try {
            const updated = await updateAdminContactStatus(message.id, nextStatus);
            setResult((prev) => ({ ...prev, items: prev.items.map((m) => (m.id === updated.id ? updated : m)) }));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">Contact messages</h1>

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
                        </article>
                    ))}
            </div>

            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

export default AdminMessages;
