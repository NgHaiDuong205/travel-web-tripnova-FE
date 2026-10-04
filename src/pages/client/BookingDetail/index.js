import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cancelHotelBooking, fetchHotelBooking } from "../../../services/bookingService";
import FormAlert from "../../../components/common/FormAlert";
import StatusBadge from "../../../components/common/StatusBadge";
import { formatDate, formatDateTime, formatMoney } from "../../../utils/formatters";
import { useT } from "../../../i18n/I18nContext";

function Row({ label, children }) {
    return (
        <div className="flex justify-between gap-4 text-sm py-2">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-right">{children}</span>
        </div>
    );
}

function BookingDetail() {
    const t = useT();
    const bookingStatusLabels = {
        pending: { label: t("booking.statuses.awaitingPayment"), className: "bg-amber-50 text-amber-700 border-amber-200" },
        confirmed: { label: t("common.status.confirmed"), className: "bg-green-50 text-green-700 border-green-200" },
        checked_in: { label: t("common.status.checked_in"), className: "bg-blue-50 text-blue-700 border-blue-200" },
        checked_out: { label: t("common.status.checked_out"), className: "bg-gray-50 text-gray-700 border-gray-200" },
        completed: { label: t("common.status.completed"), className: "bg-gray-50 text-gray-700 border-gray-200" },
        cancelled: { label: t("common.status.cancelled"), className: "bg-red-50 text-red-700 border-red-200" },
        refunded: { label: t("common.status.refunded"), className: "bg-purple-50 text-purple-700 border-purple-200" },
        no_show: { label: t("booking.statuses.noShow"), className: "bg-red-50 text-red-700 border-red-200" },
    };
    const paymentStatusLabels = {
        pending: { label: t("common.status.pending"), className: "bg-amber-50 text-amber-700 border-amber-200" },
        success: { label: t("common.status.paid"), className: "bg-green-50 text-green-700 border-green-200" },
        failed: { label: t("common.status.failed"), className: "bg-red-50 text-red-700 border-red-200" },
        refunded: { label: t("common.status.refunded"), className: "bg-purple-50 text-purple-700 border-purple-200" },
    };
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);

    const load = useCallback(async () => {
        try {
            setBooking(await fetchHotelBooking(bookingId));
        } catch (err) {
            setError(err.message);
        }
    }, [bookingId]);

    useEffect(() => {
        load();
    }, [load]);

    const handleCancel = async () => {
        const reason = window.prompt(t("booking.detail.cancelReasonPrompt"), "");
        if (reason === null) return;
        setCancelling(true);
        setError("");
        try {
            setBooking(await cancelHotelBooking(bookingId, reason));
        } catch (err) {
            setError(err.message);
        } finally {
            setCancelling(false);
        }
    };

    if (!booking) {
        return (
            <div className="max-w-screen-md mx-auto px-8 pt-32 pb-24 text-center">
                {error ? <FormAlert>{error}</FormAlert> : <p className="text-gray-500">{t("common.state.loading")}</p>}
            </div>
        );
    }

    const currency = booking.currencyCode;

    return (
        <main className="max-w-screen-md mx-auto px-8 pt-32 pb-24 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">{t("booking.detail.booking")}</p>
                    <h1 className="text-3xl font-extrabold text-primary font-mono">{booking.orderCode}</h1>
                </div>
                <StatusBadge status={booking.status} labels={bookingStatusLabels} />
            </div>

            <FormAlert>{error}</FormAlert>

            <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {booking.hotelCoverImageUrl && (
                    <img src={booking.hotelCoverImageUrl} alt={booking.hotelName} className="w-full h-48 object-cover" />
                )}
                <div className="p-8">
                    <Link to={`/hotel/${booking.hotelId}`} className="text-2xl font-bold text-primary hover:underline">
                        {booking.hotelName}
                    </Link>
                    <p className="text-sm text-gray-500 mb-4">{booking.hotelAddress}</p>
                    <div className="divide-y divide-gray-100">
                        <Row label={t("booking.detail.room")}>
                            {booking.roomTypeName}
                            {booking.roomNumber ? ` · ${t("booking.detail.roomNumber", { number: booking.roomNumber })}` : ""}
                        </Row>
                        <Row label={t("common.fields.checkIn")}>{formatDate(booking.checkInDate)}</Row>
                        <Row label={t("common.fields.checkOut")}>{formatDate(booking.checkOutDate)}</Row>
                        <Row label={t("booking.detail.nights")}>{t("common.units.night", { count: booking.numNights })}</Row>
                        <Row label={t("common.fields.guests")}>
                            {booking.numChildren > 0 ? t("booking.detail.guestsWithChildren", { adults: t("common.units.adult", { count: booking.numAdults }), children: t("common.units.child", { count: booking.numChildren }) }) : t("booking.detail.guestsSummary", { adults: t("common.units.adult", { count: booking.numAdults }) })}
                        </Row>
                        {booking.specialRequests && <Row label={t("booking.detail.specialRequests")}>{booking.specialRequests}</Row>}
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
                <h2 className="text-xl font-bold text-primary mb-2">{t("booking.payment.title")}</h2>
                <div className="divide-y divide-gray-100">
                    <Row label={t("common.fields.total")}>{formatMoney(booking.totalPrice, currency)}</Row>
                    <Row label={t("booking.payment.method")}>{booking.paymentMethod?.toUpperCase()}</Row>
                    <Row label={t("common.fields.status")}>
                        <StatusBadge status={booking.paymentStatus} labels={paymentStatusLabels} />
                    </Row>
                    {booking.paidAt && <Row label={t("booking.detail.paidAt")}>{formatDateTime(booking.paidAt)}</Row>}
                    {booking.refundAmount != null && (
                        <>
                            <Row label={t("booking.detail.refund")}>{formatMoney(booking.refundAmount, currency)}</Row>
                            <Row label={t("booking.detail.refundReason")}>{booking.refundReason}</Row>
                        </>
                    )}
                </div>
            </section>

            <div className="flex flex-wrap gap-3">
                {booking.status === "pending" && booking.paymentId && (
                    <Link
                        to={`/payment/${booking.paymentId}`}
                        className="bg-[#003580] text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-800"
                    >
                        {t("booking.detail.payNow")}
                    </Link>
                )}
                {booking.cancellable && (
                    <button
                        type="button"
                        disabled={cancelling}
                        onClick={handleCancel}
                        className="bg-white text-red-600 border border-red-200 px-6 py-3 rounded-lg font-bold hover:bg-red-50 disabled:opacity-60"
                    >
                        {cancelling ? t("booking.detail.cancelling") : t("booking.detail.cancelBooking")}
                    </button>
                )}
                <Link to="/booking-history" className="px-6 py-3 rounded-lg font-bold text-[#003580] hover:bg-blue-50">
                    {t("booking.detail.allBookings")}
                </Link>
            </div>
        </main>
    );
}

export default BookingDetail;
