import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DetailBackLink from "../../../components/catalog/DetailBackLink";
import FormAlert from "../../../components/common/FormAlert";
import StatusBadge from "../../../components/common/StatusBadge";
import { PAYMENT_METHODS } from "../../../services/bookingService";
import { confirmMockPayment, fetchPayment } from "../../../services/paymentService";
import { formatDateTime, formatMoney } from "../../../utils/formatters";
import { useT } from "../../../i18n/I18nContext";

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
    const t = useT();
    const paymentStatusLabels = {
        pending: { label: t("common.status.pending"), className: "bg-amber-50 text-amber-700 border-amber-200" },
        success: { label: t("common.status.paid"), className: "bg-green-50 text-green-700 border-green-200" },
        failed: { label: t("common.status.failed"), className: "bg-red-50 text-red-700 border-red-200" },
        refunded: { label: t("common.status.refunded"), className: "bg-purple-50 text-purple-700 border-purple-200" },
    };
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
                {error ? <FormAlert>{error}</FormAlert> : <p className="text-on-surface-variant">{t("booking.tripPayment.loading")}</p>}
            </main>
        );
    }

    const isPending = payment.status === "pending";
    const method = PAYMENT_METHODS.find((m) => m.value === payment.paymentMethod);

    return (
        <main className="max-w-2xl mx-auto px-8 py-8">
            <DetailBackLink to={tripsLink(payment.bookingType)} label={t("booking.tripPayment.myTrips")} />
            <div className="bg-surface-container-lowest rounded-xl p-10 shadow-[0_32px_48px_-12px_rgba(27,28,28,0.06)] border border-outline-variant/15 space-y-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <span className="block text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-1">{t("booking.tripPayment.secureCheckout")}</span>
                        <h1 className="font-headline text-3xl font-extrabold text-primary">{t("booking.tripPayment.title")}</h1>
                    </div>
                    <StatusBadge status={payment.status} labels={paymentStatusLabels} />
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-on-surface-variant">{t("booking.payment.order")}</span>
                        <span className="font-bold">{payment.orderCode}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-on-surface-variant">{t("booking.payment.method")}</span>
                        <span className="font-bold">{method ? t(`common.paymentMethods.${method.value}`) : payment.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-on-surface-variant">{t("booking.payment.created")}</span>
                        <span className="font-bold">{formatDateTime(payment.createdAt)}</span>
                    </div>
                    <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-baseline">
                        <span className="font-bold text-on-surface">{t("common.fields.total")}</span>
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
                            {processing ? t("common.state.processing") : t("booking.payment.payAmount", { amount: formatMoney(payment.amount, payment.currencyCode) })}
                        </button>
                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => handlePay(false)}
                            className="w-full py-3 rounded-lg font-bold text-sm text-error border border-error/30 hover:bg-error-container/40 disabled:opacity-50"
                        >
                            {t("booking.payment.simulateFailed")}
                        </button>
                        <p className="text-center text-[10px] text-on-surface-variant font-medium uppercase tracking-tighter">
                            <span className="material-symbols-outlined text-[14px] align-text-top mr-1">verified_user</span>
                            {t("booking.tripPayment.holdPolicy")}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 text-center">
                        {payment.status === "failed" && (
                            <p className="text-sm text-on-surface-variant">{t("booking.tripPayment.paymentFailed")}</p>
                        )}
                        <Link
                            to={tripsLink(payment.bookingType)}
                            className="block w-full editorial-gradient text-on-primary py-4 rounded-lg font-bold hover:opacity-90"
                        >
                            {t("booking.tripPayment.viewMyTrips")}
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}

export default TripPayment;
