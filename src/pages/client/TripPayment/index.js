import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DetailBackLink from "../../../components/catalog/DetailBackLink";
import FormAlert from "../../../components/common/FormAlert";
import StatusBadge from "../../../components/common/StatusBadge";
import { PAYMENT_METHODS } from "../../../services/bookingService";
import { confirmMockPayment, fetchPayment, PAYMENT_STATUS_LABELS } from "../../../services/paymentService";
import { formatDateTime, formatMoney } from "../../../utils/formatters";

const TRIP_TABS = { car: "cars", flight: "flights", tour: "tours" };

/** Đường dẫn "My Trips" đúng tab theo loại booking của giao dịch. */
export function tripsLink(bookingType) {
    return `/my-trips?tab=${TRIP_TABS[bookingType] || "cars"}`;
}

/**
 * Thanh toán cho đơn thuê xe / vé máy bay / tour (trang Payment cũ chỉ điều hướng về booking khách sạn).
 * Dùng cổng giả lập của BE (app.payment.mock-enabled) giống trang cũ.
 */
function TripPayment() {
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
            if (result.status === "success") {
                navigate(`${tripsLink(result.bookingType)}&paid=${result.primaryBookingId || ""}`, { replace: true });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (!payment) {
        return (
            <main className="max-w-2xl mx-auto px-8 py-16 text-center">
                {error ? <FormAlert>{error}</FormAlert> : <p className="text-on-surface-variant">Loading payment...</p>}
            </main>
        );
    }

    const isPending = payment.status === "pending";
    const method = PAYMENT_METHODS.find((m) => m.value === payment.paymentMethod);

    return (
        <main className="max-w-2xl mx-auto px-8 py-8">
            <DetailBackLink to={tripsLink(payment.bookingType)} label="My Trips" />
            <div className="bg-surface-container-lowest rounded-xl p-10 shadow-[0_32px_48px_-12px_rgba(27,28,28,0.06)] border border-outline-variant/15 space-y-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <span className="block text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-1">Secure checkout</span>
                        <h1 className="font-headline text-3xl font-extrabold text-primary">Complete your payment</h1>
                    </div>
                    <StatusBadge status={payment.status} labels={PAYMENT_STATUS_LABELS} />
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-on-surface-variant">Order</span>
                        <span className="font-bold">{payment.orderCode}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-on-surface-variant">Method</span>
                        <span className="font-bold">{method?.label || payment.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-on-surface-variant">Created</span>
                        <span className="font-bold">{formatDateTime(payment.createdAt)}</span>
                    </div>
                    <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-baseline">
                        <span className="font-bold text-on-surface">Total</span>
                        <span className="text-3xl font-black text-primary font-headline">{formatMoney(payment.amount, payment.currencyCode)}</span>
                    </div>
                </div>

                <FormAlert>{error}</FormAlert>

                {isPending ? (
                    <div className="space-y-3">
                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => handlePay(true)}
                            className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-lg font-bold font-headline shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {processing ? "Processing..." : `Pay ${formatMoney(payment.amount, payment.currencyCode)}`}
                        </button>
                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => handlePay(false)}
                            className="w-full py-3 rounded-lg font-bold text-sm text-error border border-error/30 hover:bg-error-container/40 disabled:opacity-50"
                        >
                            Simulate failed payment
                        </button>
                        <p className="text-center text-[10px] text-on-surface-variant font-medium uppercase tracking-tighter">
                            <span className="material-symbols-outlined text-[14px] align-text-top mr-1">verified_user</span>
                            Your reservation is held for 15 minutes
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 text-center">
                        {payment.status === "failed" && (
                            <p className="text-sm text-on-surface-variant">The payment failed or the reservation expired. Please book again.</p>
                        )}
                        <Link
                            to={tripsLink(payment.bookingType)}
                            className="block w-full editorial-gradient text-on-primary py-4 rounded-lg font-bold hover:opacity-90"
                        >
                            View my trips
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}

export default TripPayment;
