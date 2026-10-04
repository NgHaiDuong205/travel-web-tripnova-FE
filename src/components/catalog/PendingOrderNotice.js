import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formatMoney } from "../../utils/formatters";
import { getCurrentLocale } from "../../i18n/currentLocale";
import { useT } from "../../i18n/I18nContext";

/**
 * Đơn chờ thanh toán của user cho đúng đối tượng đang xem (chuyến bay / xe / tour), còn hạn giữ chỗ,
 * gom theo payment (1 lần đặt = 1 order = 1 payment, có thể nhiều booking — VD nhiều ghế).
 * `fetchMine({ status, limit })` → { items }; `matches(booking)` lọc theo đối tượng đang xem (`entityId`).
 * Dùng khi khách bấm Back từ trang thanh toán: chỗ đã được giữ nên cần lối thanh toán tiếp / huỷ.
 */
export function usePendingOrders(fetchMine, matches, entityId) {
    const { isLoggedIn } = useAuth();
    const [orders, setOrders] = useState([]);

    const reload = useCallback(async () => {
        if (!isLoggedIn) {
            setOrders([]);
            return;
        }
        try {
            const { items } = await fetchMine({ status: "pending", limit: 50 });
            const now = Date.now();
            const byPayment = new Map();
            items
                .filter((b) => b.status === "pending" && b.paymentId && matches(b))
                .filter((b) => !b.holdExpiresAt || new Date(b.holdExpiresAt).getTime() > now)
                .forEach((b) => {
                    if (!byPayment.has(b.paymentId)) byPayment.set(b.paymentId, []);
                    byPayment.get(b.paymentId).push(b);
                });
            setOrders([...byPayment.entries()].map(([paymentId, bookings]) => ({ paymentId, bookings })));
        } catch {
            setOrders([]); // không chặn trang nếu lỗi
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- matches/fetchMine chỉ phụ thuộc entityId
    }, [isLoggedIn, entityId]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { orders, reload };
}

const timeOf = (value) =>
    new Date(value).toLocaleTimeString(getCurrentLocale(), { hour: "2-digit", minute: "2-digit" });

/**
 * Thông báo đơn chưa thanh toán: mô tả (describe(bookings)), tổng tiền, hạn giữ chỗ,
 * nút "Tiếp tục thanh toán" (`${paymentPath}/:paymentId` — khách sạn dùng /payment, loại khác /trip-payment)
 * và "Huỷ đơn" (onCancel(bookings), rồi onChanged()). `title` thay tiêu đề mặc định (VD trang giỏ hàng).
 */
function PendingOrderNotice({ orders, describe, onCancel, onChanged, paymentPath = "/trip-payment", title }) {
    const t = useT();
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");

    if (orders.length === 0) return null;

    const handleCancel = async (order) => {
        if (!window.confirm(t("catalog.pending.cancelConfirm"))) return;
        setBusy(order.paymentId);
        setError("");
        try {
            await onCancel(order.bookings);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy("");
            onChanged?.();
        }
    };

    return (
        <div className="space-y-3 mb-8" data-testid="pending-order-notice">
            {orders.map((order) => {
                const total = order.bookings.reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
                const currency = order.bookings[0]?.currencyCode;
                const expires = order.bookings.map((b) => b.holdExpiresAt).filter(Boolean).sort()[0];
                return (
                    <div
                        key={order.paymentId}
                        className="flex flex-col md:flex-row md:items-center gap-4 rounded-xl border border-amber-300 bg-amber-50 px-6 py-4"
                    >
                        <span className="material-symbols-outlined text-amber-700">schedule</span>
                        <div className="flex-1 min-w-0 text-sm">
                            <p className="font-bold text-amber-900">{title || t("catalog.pending.title")}</p>
                            <p className="text-amber-900/80">
                                {describe(order.bookings)} · {formatMoney(total, currency)}
                                {expires && ` · ${t("catalog.pending.heldUntil", { time: timeOf(expires) })}`}
                            </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                type="button"
                                disabled={busy === order.paymentId}
                                onClick={() => handleCancel(order)}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-error border border-error/30 hover:bg-error-container/40 disabled:opacity-50"
                            >
                                {busy === order.paymentId ? t("common.state.processing") : t("catalog.pending.cancel")}
                            </button>
                            <Link
                                to={`${paymentPath}/${order.paymentId}`}
                                className="px-5 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary hover:opacity-90"
                            >
                                {t("catalog.pending.continuePayment")}
                            </Link>
                        </div>
                    </div>
                );
            })}
            {error && <p className="text-sm text-error font-semibold">{error}</p>}
        </div>
    );
}

export default PendingOrderNotice;
