import { useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import { fetchSearchQueries, fetchTopSearchQueries } from "../../../services/adminLogService";
import { formatDateTime } from "../../../utils/formatters";

const PAGE_SIZE = 25;
const EMPTY_FILTERS = { q: "", from: "", to: "" };

function AdminSearchQueries() {
    const [form, setForm] = useState(EMPTY_FILTERS);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [topQueries, setTopQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchSearchQueries({ ...filters, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [filters, page]);

    useEffect(() => {
        let cancelled = false;
        fetchTopSearchQueries({ from: filters.from, to: filters.to, limit: 15 })
            .then((data) => !cancelled && setTopQueries(data))
            .catch((err) => !cancelled && setError(err.message));
        return () => {
            cancelled = true;
        };
    }, [filters.from, filters.to]);

    const set = (name) => (event) => setForm((prev) => ({ ...prev, [name]: event.target.value }));
    const chooseQuery = (q) => {
        const next = { ...filters, q };
        setForm(next);
        setFilters(next);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">Search Queries</h1>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setFilters({ ...form, q: form.q.trim() });
                    setPage(1);
                }}
                className="flex flex-wrap items-end gap-3"
            >
                <label className="text-xs font-semibold text-gray-500">
                    Search text
                    <input
                        value={form.q}
                        onChange={set("q")}
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
            </form>
            <FormAlert>{error}</FormAlert>
            <section>
                <h2 className="text-xl font-extrabold mb-3">Top queries</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm min-w-[680px]">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3 text-left">Query</th>
                                <th className="px-4 py-3 text-right">Searches</th>
                                <th className="px-4 py-3 text-right">Users</th>
                                <th className="px-4 py-3 text-right">Clicks</th>
                                <th className="px-4 py-3 text-right">Click-through</th>
                                <th className="px-4 py-3 text-right">Zero-result count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topQueries.map((item) => (
                                <tr key={item.queryText} className="border-t border-gray-100">
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => chooseQuery(item.queryText)}
                                            className="font-semibold text-primary hover:underline"
                                        >
                                            {item.queryText}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">{item.searches}</td>
                                    <td className="px-4 py-3 text-right">{item.users}</td>
                                    <td className="px-4 py-3 text-right">{item.clicks}</td>
                                    <td className="px-4 py-3 text-right">
                                        {item.searches ? `${Math.round((item.clicks / item.searches) * 100)}%` : "0%"}
                                    </td>
                                    <td
                                        className={`px-4 py-3 text-right ${item.zeroResults > 0 ? "text-red-600 font-bold" : ""}`}
                                    >
                                        {item.zeroResults}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {topQueries.length === 0 && <p className="p-6 text-center text-gray-500">No top queries.</p>}
                </div>
            </section>
            <section>
                <h2 className="text-xl font-extrabold mb-3">Recent searches</h2>
                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : result.items.length === 0 ? (
                    <p className="text-gray-500">No searches found.</p>
                ) : (
                    <RecentTable items={result.items} />
                )}
                <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
            </section>
        </div>
    );
}

function RecentTable({ items }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                        <th className="px-4 py-3 text-left">Time</th>
                        <th className="px-4 py-3 text-left">User</th>
                        <th className="px-4 py-3 text-left">Query</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-right">Results</th>
                        <th className="px-4 py-3 text-left">Clicked</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <SearchRow key={item.id} item={item} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SearchRow({ item }) {
    let type = "—";
    try {
        type = JSON.parse(item.filters || "{}").type || "—";
    } catch (err) {
        // Bộ lọc không hợp lệ.
    }
    return (
        <tr className="border-t border-gray-100">
            <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(item.createdAt)}</td>
            <td className="px-4 py-3">{item.userEmail || "Guest"}</td>
            <td className="px-4 py-3 font-semibold">{item.queryText}</td>
            <td className="px-4 py-3">{type}</td>
            <td className={`px-4 py-3 text-right ${item.resultCount === 0 ? "text-red-600 font-bold" : ""}`}>
                {item.resultCount}
            </td>
            <td className="px-4 py-3">
                {item.clickedEntityType ? (
                    <span className="font-mono text-xs px-2 py-1 rounded bg-gray-100">{item.clickedEntityType}</span>
                ) : (
                    "—"
                )}
            </td>
        </tr>
    );
}

export default AdminSearchQueries;
