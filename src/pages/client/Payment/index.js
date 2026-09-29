import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { confirmMockPayment, fetchPayment, PAYMENT_STATUS_LABELS } from "../../../services/paymentService";
import FormAlert from "../../../components/common/FormAlert";
import StatusBadge from "../../../components/common/StatusBadge";
import { formatDateTime, formatMoney } from "../../../utils/formatters";

/** Trang thanh toán — hiện dùng cổng giả lập của backend (mock-confirm). */
function Payment() {
    const { paymentId } = useParams();
    const navigate = useNavigate();
    const [payment, setPayment] = useState(null);
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);

    const load = useCallback(async () => {
        try {
            setPayment(await fetchPayment(paymentId));
        } catch (err) {
            setError(err.message);
        }
    }, [paymentId]);

    useEffect(() => {
        load();
    }, [load]);

    const handlePay = async (success) => {
        setProcessing(true);
        setError("");
        try {
            const result = await confirmMockPayment(paymentId, success);
            setPayment(result);
            if (result.bookingId && result.status !== "pending") {
                // Đơn từ giỏ hàng có nhiều booking -> xem cả danh sách
                navigate(result.bookingCount > 1 ? "/booking-history" : `/bookings/${result.bookingId}`, { replace: true });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (!payment) {
        return (
            <div className="max-w-screen-sm mx-auto px-8 pt-32 pb-24 text-center">
                {error ? <FormAlert>{error}</FormAlert> : <p className="text-gray-500">Đang tải...</p>}
            </div>
        );
    }

    const isPending = payment.status === "pending";

    return (
        <main className="max-w-screen-sm mx-auto px-8 pt-32 pb-24">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-extrabold text-primary">Payment</h1>
                    <StatusBadge status={payment.status} labels={PAYMENT_STATUS_LABELS} />
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Order</span>
                        <span className="font-mono font-bold">{payment.orderCode}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Method</span>
                        <span className="font-semibold uppercase">{payment.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Created</span>
                        <span className="font-semibold">{formatDateTime(payment.createdAt)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-primary pt-4 border-t border-gray-100">
                        <span>Amount</span>
                        <span>{formatMoney(payment.amount, payment.currencyCode)}</span>
                    </div>
                </div>

                <FormAlert>{error}</FormAlert>

                {isPending ? (
                    <>
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                            Môi trường thử nghiệm: cổng thanh toán đang ở chế độ giả lập, không trừ tiền thật.
                        </div>
                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => handlePay(true)}
                            className="w-full bg-[#003580] text-white py-4 rounded-lg font-bold shadow-md hover:bg-blue-800 transition-all disabled:opacity-60"
                        >
                            {processing ? "Processing..." : `Pay ${formatMoney(payment.amount, payment.currencyCode)}`}
                        </button>
                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => handlePay(false)}
                            className="w-full bg-white text-red-600 border border-red-200 py-3 rounded-lg font-bold hover:bg-red-50 transition-all disabled:opacity-60"
                        >
                            Simulate failed payment
                        </button>
                    </>
                ) : (
                    payment.bookingId && (
                        <Link
                            to={payment.bookingCount > 1 ? "/booking-history" : `/bookings/${payment.bookingId}`}
                            className="block text-center w-full bg-[#003580] text-white py-4 rounded-lg font-bold hover:bg-blue-800"
                        >
                            {payment.bookingCount > 1 ? `View ${payment.bookingCount} bookings` : "View booking"}
                        </Link>
                    )
                )}
            </div>
        </main>
    );
}

export default Payment;
