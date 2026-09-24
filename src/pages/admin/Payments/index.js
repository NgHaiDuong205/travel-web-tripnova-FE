import { useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../../components/common/StatusBadge";
import { fetchAdminPayments } from "../../../services/adminService";
import { PAYMENT_STATUS_LABELS } from "../../../services/paymentService";
import { formatDateTime, formatMoney } from "../../../utils/formatters";

const PAGE_SIZE = 20;

function AdminPayments() {
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchAdminPayments({ status, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [status, page]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">Payments</h1>

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
                    {Object.entries(PAYMENT_STATUS_LABELS).map(([value, cfg]) => (
                        <option key={value} value={value}>{cfg.label}</option>
                    ))}
                </select>
                <span className="ml-auto text-sm text-gray-500">{result.total.toLocaleString()} transactions</span>
            </div>

            <FormAlert>{error}</FormAlert>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[860px]">
                    <thead className="bg-gray-50">
                        <tr className="text-xs uppercase text-gray-500">
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Method</th>
                            <th className="px-4 py-3">Transaction</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>}
                        {!loading && result.items.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Không có giao dịch nào.</td></tr>
                        )}
                        {!loading &&
                            result.items.map((p) => (
                                <tr key={p.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3 font-mono">{p.orderCode}</td>
                                    <td className="px-4 py-3">{p.userEmail}</td>
                                    <td className="px-4 py-3 uppercase">{p.paymentMethod}</td>
                                    <td className="px-4 py-3 font-mono text-xs max-w-[180px] truncate" title={p.transactionId || ""}>{p.transactionId || "—"}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(p.paidAt || p.createdAt)}</td>
                                    <td className="px-4 py-3"><StatusBadge status={p.status} labels={PAYMENT_STATUS_LABELS} /></td>
                                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">{formatMoney(p.amount, p.currencyCode)}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

export default AdminPayments;
