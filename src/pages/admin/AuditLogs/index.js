import { useEffect, useMemo, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import { fetchAuditActions, fetchAuditLogs } from "../../../services/adminLogService";
import { formatDateTime } from "../../../utils/formatters";

const PAGE_SIZE = 25;
const EMPTY_FILTERS = { userId: "", action: "", from: "", to: "" };

function AdminAuditLogs() {
    const [form, setForm] = useState(EMPTY_FILTERS);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openId, setOpenId] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetchAuditActions()
            .then((items) => !cancelled && setActions(items))
            .catch((err) => !cancelled && setError(err.message));
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchAuditLogs({ ...filters, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [filters, page]);

    const actionOptions = useMemo(() => {
        const prefixes = [...new Set(actions.map((action) => action.split(".")[0]).filter(Boolean))];
        return { prefixes, full: actions };
    }, [actions]);
    const set = (name) => (event) => setForm((prev) => ({ ...prev, [name]: event.target.value }));
    const filterUser = (userId) => {
        const next = { ...filters, userId };
        setForm(next);
        setFilters(next);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">Audit Logs</h1>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setFilters({ ...form, userId: form.userId.trim() });
                    setPage(1);
                }}
                className="flex flex-wrap items-end gap-3"
            >
                <label className="text-xs font-semibold text-gray-500">
                    Action
                    <select
                        value={form.action}
                        onChange={set("action")}
                        className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">All actions</option>
                        {actionOptions.prefixes.map((prefix) => (
                            <option key={prefix} value={prefix}>
                                {prefix}.*
                            </option>
                        ))}
                        {actionOptions.full.map((action) => (
                            <option key={action} value={action}>
                                {action}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    User ID
                    <input
                        value={form.userId}
                        onChange={set("userId")}
                        placeholder="UUID"
                        className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    From
                    <input
                        type="date"
                        value={form.from}
                        onChange={set("from")}
                        className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    To
                    <input
                        type="date"
                        value={form.to}
                        min={form.from || undefined}
                        onChange={set("to")}
                        className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </label>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white">
                    Filter
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setForm(EMPTY_FILTERS);
                        setFilters(EMPTY_FILTERS);
                        setPage(1);
                    }}
                    className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600"
                >
                    Reset
                </button>
                <span className="ml-auto text-sm text-gray-500">{result.total.toLocaleString()} entries</span>
            </form>
            <FormAlert>{error}</FormAlert>
            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : result.items.length === 0 ? (
                <p className="text-gray-500">No audit entries.</p>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3 text-left">Time</th>
                                <th className="px-4 py-3 text-left">User</th>
                                <th className="px-4 py-3 text-left">Action</th>
                                <th className="px-4 py-3 text-left">Request</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {result.items.map((item) => (
                                <AuditRow
                                    key={item.id}
                                    item={item}
                                    open={openId === item.id}
                                    onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                                    onUser={() => filterUser(item.userId)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

function AuditRow({ item, open, onToggle, onUser }) {
    const statusClass =
        item.status >= 500
            ? "bg-red-100 text-red-700"
            : item.status >= 400
              ? "bg-amber-100 text-amber-700"
              : "bg-green-100 text-green-700";
    let details = item.details || "—";
    try {
        details = JSON.stringify(JSON.parse(item.details), null, 2);
    } catch (err) {
        // Giữ dữ liệu gốc.
    }
    return (
        <>
            <tr className="border-t border-gray-100 align-top">
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(item.createdAt)}</td>
                <td className="px-4 py-3">
                    {item.userEmail ? (
                        <button type="button" onClick={onUser} className="text-primary hover:underline">
                            {item.userEmail}
                        </button>
                    ) : (
                        "—"
                    )}
                </td>
                <td className="px-4 py-3">
                    <span className="font-mono text-xs px-2 py-1 rounded bg-gray-100">{item.action}</span>
                </td>
                <td className="px-4 py-3 max-w-xs truncate font-mono text-xs" title={`${item.httpMethod} ${item.path}`}>
                    {item.httpMethod} {item.path}
                </td>
                <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${statusClass}`}>{item.status}</span>
                </td>
                <td className="px-4 py-3">
                    <button type="button" onClick={onToggle} className="text-xs font-bold text-primary">
                        {open ? "Hide" : "Details"}
                    </button>
                </td>
            </tr>
            {open && (
                <tr className="bg-gray-50">
                    <td colSpan={6} className="px-6 py-4">
                        <div className="grid sm:grid-cols-3 gap-3 text-sm mb-3">
                            <p>
                                <b>Entity type:</b> {item.entityType || "—"}
                            </p>
                            <p>
                                <b>Entity ID:</b> {item.entityId || "—"}
                            </p>
                            <p>
                                <b>IP address:</b> {item.ipAddress || "—"}
                            </p>
                        </div>
                        <pre className="p-3 rounded bg-white border border-gray-200 overflow-auto text-xs">{details}</pre>
                    </td>
                </tr>
            )}
        </>
    );
}

export default AdminAuditLogs;
