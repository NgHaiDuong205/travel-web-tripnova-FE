import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BOOKING_STATUS_LABELS, cancelHotelBooking, fetchHotelBooking } from "../../../services/bookingService";
import { PAYMENT_STATUS_LABELS } from "../../../services/paymentService";
import FormAlert from "../../../components/common/FormAlert";
import StatusBadge from "../../../components/common/StatusBadge";
import { formatDate, formatDateTime, formatMoney } from "../../../utils/formatters";

function Row({ label, children }) {
    return (
        <div className="flex justify-between gap-4 text-sm py-2">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-right">{children}</span>
        </div>
    );
}

function BookingDetail() {
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
        const reason = window.prompt("Lý do huỷ đặt phòng (không bắt buộc):", "");
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
                {error ? <FormAlert>{error}</FormAlert> : <p className="text-gray-500">Đang tải...</p>}
            </div>
        );
    }

    const currency = booking.currencyCode;

    return (
        <main className="max-w-screen-md mx-auto px-8 pt-32 pb-24 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Booking</p>
                    <h1 className="text-3xl font-extrabold text-primary font-mono">{booking.orderCode}</h1>
                </div>
                <StatusBadge status={booking.status} labels={BOOKING_STATUS_LABELS} />
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
                        <Row label="Room">
                            {booking.roomTypeName}
                            {booking.roomNumber ? ` · No. ${booking.roomNumber}` : ""}
                        </Row>
                        <Row label="Check-in">{formatDate(booking.checkInDate)}</Row>
                        <Row label="Check-out">{formatDate(booking.checkOutDate)}</Row>
                        <Row label="Nights">{booking.numNights}</Row>
                        <Row label="Guests">
                            {booking.numAdults} adult{booking.numAdults > 1 ? "s" : ""}
                            {booking.numChildren > 0 ? `, ${booking.numChildren} children` : ""}
                        </Row>
                        {booking.specialRequests && <Row label="Special requests">{booking.specialRequests}</Row>}
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
                <h2 className="text-xl font-bold text-primary mb-2">Payment</h2>
                <div className="divide-y divide-gray-100">
                    <Row label="Total">{formatMoney(booking.totalPrice, currency)}</Row>
                    <Row label="Method">{booking.paymentMethod?.toUpperCase()}</Row>
                    <Row label="Status">
                        <StatusBadge status={booking.paymentStatus} labels={PAYMENT_STATUS_LABELS} />
                    </Row>
                    {booking.paidAt && <Row label="Paid at">{formatDateTime(booking.paidAt)}</Row>}
                    {booking.refundAmount != null && (
                        <>
                            <Row label="Refund">{formatMoney(booking.refundAmount, currency)}</Row>
                            <Row label="Refund reason">{booking.refundReason}</Row>
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
                        Pay now
                    </Link>
                )}
                {booking.cancellable && (
                    <button
                        type="button"
                        disabled={cancelling}
                        onClick={handleCancel}
                        className="bg-white text-red-600 border border-red-200 px-6 py-3 rounded-lg font-bold hover:bg-red-50 disabled:opacity-60"
                    >
                        {cancelling ? "Cancelling..." : "Cancel booking"}
                    </button>
                )}
                <Link to="/booking-history" className="px-6 py-3 rounded-lg font-bold text-[#003580] hover:bg-blue-50">
                    All bookings
                </Link>
            </div>
        </main>
    );
}

export default BookingDetail;
