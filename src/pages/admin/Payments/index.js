import { useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../../components/common/StatusBadge";
import {
    PAYMENT_NEXT_STATUSES,
    fetchAdminPayments,
    refundAdminPayment,
    updateAdminPaymentStatus,
} from "../../../services/adminService";
import { PAYMENT_STATUS_LABELS } from "../../../services/paymentService";
import { formatDateTime, formatMoney } from "../../../utils/formatters";
import AdminStatsPanel from "../../../components/admin/AdminStatsPanel";

const PAGE_SIZE = 20;
const ACTIONS = {
    success: { label: "Mark paid", confirm: "Xác nhận đã nhận tiền (chuyển khoản / tiền mặt)? Booking sẽ được giữ phòng.", className: "border-green-200 text-green-700 hover:bg-green-50" },
    failed: { label: "Mark failed", confirm: "Đánh dấu giao dịch thất bại? Đơn và booking sẽ bị huỷ.", className: "border-red-200 text-red-600 hover:bg-red-50" },
    refunded: { label: "Refund", className: "border-purple-200 text-purple-700 hover:bg-purple-50" },
};

function AdminPayments() {
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);

    const handleAction = async (payment, nextStatus) => {
        let reason;
        if (nextStatus === "refunded") {
            reason = window.prompt(
                `Hoàn toàn bộ phần còn lại của đơn ${payment.orderCode} và trả phòng nếu khách chưa ở. Lý do:`,
                ""
            );
            if (reason === null) return;
        } else if (!window.confirm(ACTIONS[nextStatus].confirm)) {
            return;
        }
        setBusyId(payment.id);
        setError("");
        try {
            const updated =
                nextStatus === "refunded"
                    ? await refundAdminPayment(payment.id, reason)
                    : await updateAdminPaymentStatus(payment.id, nextStatus);
            setResult((prev) => ({ ...prev, items: prev.items.map((p) => (p.id === updated.id ? updated : p)) }));
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
            <AdminStatsPanel section="payments" />

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
                <table className="w-full text-left text-sm min-w-[980px]">
                    <thead className="bg-gray-50">
                        <tr className="text-xs uppercase text-gray-500">
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Method</th>
                            <th className="px-4 py-3">Transaction</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>}
                        {!loading && result.items.length === 0 && (
                            <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Không có giao dịch nào.</td></tr>
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
                                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                                        {formatMoney(p.amount, p.currencyCode)}
                                        {p.orderStatus === "partially_refunded" && (
                                            <p className="text-xs font-normal text-purple-700">Partially refunded</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            {(PAYMENT_NEXT_STATUSES[p.status] || []).map((next) => (
                                                <button
                                                    key={next}
                                                    type="button"
                                                    disabled={busyId === p.id}
                                                    onClick={() => handleAction(p, next)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold border disabled:opacity-50 ${ACTIONS[next].className}`}
                                                >
                                                    {ACTIONS[next].label}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
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
