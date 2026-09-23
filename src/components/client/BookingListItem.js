import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import { BOOKING_STATUS_LABELS } from "../../services/bookingService";
import { formatDate, formatMoney } from "../../utils/formatters";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70";

/** 1 dòng booking khách sạn trong lịch sử đặt phòng. */
function BookingListItem({ booking }) {
    const inactive = ["cancelled", "refunded", "no_show"].includes(booking.status);
    return (
        <div
            className={`group bg-surface-container-lowest p-6 rounded-xl flex flex-col md:flex-row md:items-center gap-6 transition-all hover:shadow-[0_8px_32px_rgba(27,28,28,0.06)] ${
                inactive ? "opacity-70" : ""
            }`}
        >
            <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className={`w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-surface-container-high ${inactive ? "grayscale" : ""}`}>
                    <img className="w-full h-full object-cover" alt={booking.hotelName} src={booking.hotelCoverImageUrl || PLACEHOLDER_IMAGE} />
                </div>
                <div className="min-w-0">
                    <p className="uppercase tracking-wider text-[9px] font-black text-on-surface-variant mb-1">
                        Stay · <span className="font-mono">{booking.orderCode}</span> · {booking.roomTypeName}
                    </p>
                    <h4 className="text-xl font-bold text-on-surface font-headline group-hover:text-primary transition-colors truncate">
                        {booking.hotelName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-on-surface-variant text-sm font-medium">
                        <span className={`flex items-center gap-1.5 ${inactive ? "line-through" : ""}`}>
                            <span className="material-symbols-outlined text-base">calendar_today</span>
                            {formatDate(booking.checkInDate)} – {formatDate(booking.checkOutDate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">person</span>
                            {booking.numAdults} adult{booking.numAdults > 1 ? "s" : ""}
                            {booking.numChildren > 0 ? `, ${booking.numChildren} children` : ""}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-10">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                    <StatusBadge status={booking.status} labels={BOOKING_STATUS_LABELS} />
                </div>
                <div className="text-right w-28">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                        {booking.refundAmount != null ? "Refunded" : "Total"}
                    </p>
                    <p className="text-lg font-extrabold text-on-surface">
                        {formatMoney(booking.refundAmount ?? booking.totalPrice, booking.currencyCode)}
                    </p>
                </div>
                <Link
                    to={`/bookings/${booking.id}`}
                    className="px-4 py-2 bg-surface-container-low text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all text-center whitespace-nowrap"
                >
                    {booking.status === "pending" ? "Pay / View" : "View Details"}
                </Link>
            </div>
        </div>
    );
}

export default BookingListItem;
