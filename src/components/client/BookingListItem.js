import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import { formatDate, formatMoney } from "../../utils/formatters";
import { useT } from "../../i18n/I18nContext";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70";

/** 1 dòng booking khách sạn trong lịch sử đặt phòng. */
function BookingListItem({ booking }) {
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
                        {t("booking.listItem.stay")} · <span className="font-mono">{booking.orderCode}</span> · {booking.roomTypeName}
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
                            {booking.numChildren > 0 ? t("booking.listItem.guestsWithChildren", { adults: t("common.units.adult", { count: booking.numAdults }), children: t("common.units.child", { count: booking.numChildren }) }) : t("booking.listItem.guestsSummary", { adults: t("common.units.adult", { count: booking.numAdults }) })}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-10">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t("common.fields.status")}</p>
                    <StatusBadge status={booking.status} labels={bookingStatusLabels} />
                </div>
                <div className="text-right w-28">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                        {booking.refundAmount != null ? t("common.status.refunded") : t("common.fields.total")}
                    </p>
                    <p className="text-lg font-extrabold text-on-surface">
                        {formatMoney(booking.refundAmount ?? booking.totalPrice, booking.currencyCode)}
                    </p>
                </div>
                <Link
                    to={`/bookings/${booking.id}`}
                    className="px-4 py-2 bg-surface-container-low text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all text-center whitespace-nowrap"
                >
                    {booking.status === "pending" ? t("booking.listItem.payView") : t("common.actions.viewDetails")}
                </Link>
            </div>
        </div>
    );
}

export default BookingListItem;
