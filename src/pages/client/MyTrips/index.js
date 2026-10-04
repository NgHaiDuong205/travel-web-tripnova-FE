import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../../components/common/StatusBadge";
import BookingListItem from "../../../components/client/BookingListItem";
import { fetchMyBookings } from "../../../services/meService";
import { cancelCarBooking, fetchMyCarBookings } from "../../../services/carService";
import { cancelFlightBooking, fetchMyFlightBookings } from "../../../services/flightService";
import { AirlineLogo, FlightTimeline, flightDateLabel } from "../../../components/catalog/FlightTimeline";
import { cancelTourBooking, fetchMyTourBookings } from "../../../services/tourService";
import { formatDate, formatDateTime, formatMoney } from "../../../utils/formatters";
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 10;
const STATUS_TABS = [
    { value: "all", labelKey: "common.status.all" },
    { value: "upcoming", labelKey: "common.status.upcoming" },
    { value: "pending", labelKey: "trips.myTrips.status.awaitingPayment" },
    { value: "completed", labelKey: "common.status.completed" },
    { value: "cancelled", labelKey: "common.status.cancelled" },
];
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80";

function getBookingStatusLabels(t) {
    return {
        pending: { label: t("trips.myTrips.status.awaitingPayment"), className: "bg-amber-50 text-amber-700 border-amber-200" },
        confirmed: { label: t("common.status.confirmed"), className: "bg-green-50 text-green-700 border-green-200" },
        checked_in: { label: t("trips.myTrips.status.inProgress"), className: "bg-blue-50 text-blue-700 border-blue-200" },
        checked_out: { label: t("trips.myTrips.status.returned"), className: "bg-blue-50 text-blue-700 border-blue-200" },
        completed: { label: t("common.status.completed"), className: "bg-gray-50 text-gray-700 border-gray-200" },
        cancelled: { label: t("common.status.cancelled"), className: "bg-red-50 text-red-600 border-red-200" },
        refunded: { label: t("common.status.refunded"), className: "bg-gray-50 text-gray-600 border-gray-200" },
        no_show: { label: t("common.status.no_show"), className: "bg-red-50 text-red-600 border-red-200" },
    };
}

function getSeatClassLabel(t, seatClass) {
    const keys = {
        economy: "trips.myTrips.seatClasses.economy",
        premium_economy: "trips.myTrips.seatClasses.premiumEconomy",
        business: "trips.myTrips.seatClasses.business",
        first: "trips.myTrips.seatClasses.first",
    };
    return keys[seatClass] ? t(keys[seatClass]) : seatClass;
}

/** Một đơn thuê xe trong danh sách My Trips. */
function CarTripCard({ booking, highlighted, onChanged }) {
    const t = useT();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleCancel = async () => {
        const paid = booking.status === "confirmed";
        const question = paid
            ? t("trips.myTrips.confirm.cancelRentalPaid")
            : t("trips.myTrips.confirm.cancelReservationUnpaid");
        if (!window.confirm(question)) return;
        setBusy(true);
        setError("");
        try {
            onChanged(await cancelCarBooking(booking.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <article
            id={`trip-${booking.id}`}
            className={`scroll-mt-28 bg-surface-container-lowest rounded-xl border overflow-hidden flex flex-col md:flex-row ${
                highlighted ? "border-primary shadow-lg" : "border-outline-variant/20"
            }`}
        >
            <Link to={`/cars/${booking.carId}`} className="md:w-56 h-40 md:h-auto shrink-0 bg-surface-container-high">
                <img
                    src={booking.carImageUrl || PLACEHOLDER_IMAGE}
                    alt={booking.carName}
                    className="w-full h-full object-cover"
                />
            </Link>
            <div className="flex-1 p-6 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                            {t("trips.myTrips.carRentalOrder", { orderCode: booking.orderCode })}
                        </p>
                        <h3 className="font-headline text-xl font-bold text-primary">{booking.carName}</h3>
                        <p className="text-xs text-on-surface-variant">
                            {t(booking.withDriver ? "trips.myTrips.carDetailsWithDriver" : "trips.myTrips.carDetailsSelfDrive", {
                                model: [booking.carBrand, booking.carModel].filter(Boolean).join(" "),
                            })}
                        </p>
                    </div>
                    <StatusBadge status={booking.status} labels={getBookingStatusLabels(t)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("trips.myTrips.pickup")}</p>
                        <p className="font-semibold">{formatDateTime(booking.pickupDate)}</p>
                        {booking.pickupLocation && <p className="text-xs text-on-surface-variant">{booking.pickupLocation}</p>}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("trips.myTrips.dropoff")}</p>
                        <p className="font-semibold">{formatDateTime(booking.returnDate)}</p>
                        {booking.returnLocation && <p className="text-xs text-on-surface-variant">{booking.returnLocation}</p>}
                    </div>
                    <div className="sm:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            {t("common.units.day", { count: booking.rentalDays })}
                        </p>
                        <p className="font-headline text-xl font-black text-primary">
                            {formatMoney(booking.totalPrice, booking.currencyCode)}
                        </p>
                    </div>
                </div>
                {error && <p className="text-xs text-error">{error}</p>}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/20">
                    {booking.status === "confirmed" && booking.cancellable && (
                        <span className="text-xs text-on-surface-variant mr-auto">
                            {t("trips.myTrips.freeCancellationUntil", { date: formatDateTime(booking.freeCancellationUntil) })}
                        </span>
                    )}
                    {booking.status === "pending" && booking.paymentId && (
                        <Link
                            to={`/trip-payment/${booking.paymentId}`}
                            className="editorial-gradient text-white px-4 py-2 rounded-lg text-xs font-bold"
                        >
                            {t("trips.myTrips.payNow")}
                        </Link>
                    )}
                    {booking.cancellable && (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-lg text-xs font-bold text-error border border-error/30 hover:bg-error-container/40 disabled:opacity-50"
                        >
                            {busy ? t("trips.myTrips.cancelling") : t("common.actions.cancel")}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

/** Một vé máy bay (một hành khách) trong My Trips. */
function FlightTripCard({ booking, highlighted, onChanged }) {
    const t = useT();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleCancel = async () => {
        const question =
            booking.status === "confirmed"
                ? t("trips.myTrips.confirm.cancelTicketPaid", { passengerName: booking.passengerName })
                : t("trips.myTrips.confirm.cancelFlightReservation");
        if (!window.confirm(question)) return;
        setBusy(true);
        setError("");
        try {
            onChanged(await cancelFlightBooking(booking.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const flight = {
        airline: booking.airline,
        airlineLogoUrl: booking.airlineLogoUrl,
        departureTime: booking.departureTime,
        arrivalTime: booking.arrivalTime,
        departureAirportCode: booking.departureAirportCode,
        arrivalAirportCode: booking.arrivalAirportCode,
        departureCity: booking.departureCity,
        arrivalCity: booking.arrivalCity,
        durationMinutes: Math.round((new Date(booking.arrivalTime) - new Date(booking.departureTime)) / 60000),
    };

    return (
        <article
            id={`trip-${booking.id}`}
            className={`scroll-mt-28 bg-surface-container-lowest rounded-xl border p-6 space-y-4 ${
                highlighted ? "border-primary shadow-lg" : "border-outline-variant/20"
            }`}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <AirlineLogo flight={flight} size="w-12 h-12" />
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                            {t("trips.myTrips.flightOrder", { orderCode: booking.orderCode })}
                        </p>
                        <h3 className="font-headline text-xl font-bold text-primary">
                            {booking.airline} {booking.flightNumber}
                        </h3>
                        <p className="text-xs text-on-surface-variant">{flightDateLabel(booking.departureTime)}</p>
                    </div>
                </div>
                <StatusBadge status={booking.status} labels={getBookingStatusLabels(t)} />
            </div>
            <FlightTimeline flight={flight} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("trips.myTrips.passenger")}</p>
                    <p className="font-semibold">{booking.passengerName}</p>
                    {booking.passportNo && <p className="text-xs text-on-surface-variant">{t("trips.myTrips.passport", { passportNo: booking.passportNo })}</p>}
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("trips.myTrips.seat")}</p>
                    <p className="font-semibold">
                        {booking.seatClass
                            ? t("trips.myTrips.seatDetails", { seatNumber: booking.seatNumber || "—", seatClass: getSeatClassLabel(t, booking.seatClass) })
                            : booking.seatNumber || "—"}
                    </p>
                </div>
                <div className="sm:text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("trips.myTrips.fare")}</p>
                    <p className="font-headline text-xl font-black text-primary">
                        {formatMoney(booking.totalPrice, booking.currencyCode)}
                    </p>
                </div>
            </div>
            {error && <p className="text-xs text-error">{error}</p>}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/20">
                {booking.status === "confirmed" && booking.cancellable && (
                    <span className="text-xs text-on-surface-variant mr-auto">
                        {t("trips.myTrips.freeCancellationUntil", { date: formatDateTime(booking.freeCancellationUntil) })}
                    </span>
                )}
                {booking.status === "pending" && booking.paymentId && (
                    <Link
                        to={`/trip-payment/${booking.paymentId}`}
                        className="editorial-gradient text-white px-4 py-2 rounded-lg text-xs font-bold"
                    >
                        {t("trips.myTrips.payNow")}
                    </Link>
                )}
                {booking.cancellable && (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-lg text-xs font-bold text-error border border-error/30 hover:bg-error-container/40 disabled:opacity-50"
                    >
                        {busy ? t("trips.myTrips.cancelling") : t("common.actions.cancel")}
                    </button>
                )}
            </div>
        </article>
    );
}

/** Một đơn tour trong My Trips. */
function TourTripCard({ booking, highlighted, onChanged }) {
    const t = useT();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleCancel = async () => {
        const question =
            booking.status === "confirmed"
                ? t("trips.myTrips.confirm.cancelTourPaid")
                : t("trips.myTrips.confirm.cancelReservationUnpaid");
        if (!window.confirm(question)) return;
        setBusy(true);
        setError("");
        try {
            onChanged(await cancelTourBooking(booking.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const adults = t("common.units.adult", { count: booking.numAdults });
    const guests = booking.numChildren
        ? t("trips.myTrips.travellersWithChildren", { adults, children: t("common.units.child", { count: booking.numChildren }) })
        : adults;
    return (
        <article
            id={`trip-${booking.id}`}
            className={`scroll-mt-28 bg-surface-container-lowest rounded-xl border overflow-hidden flex flex-col md:flex-row ${
                highlighted ? "border-primary shadow-lg" : "border-outline-variant/20"
            }`}
        >
            <Link to={`/tours/${booking.tourId}`} className="md:w-56 h-40 md:h-auto shrink-0 bg-surface-container-high">
                {booking.tourImageUrl && (
                    <img src={booking.tourImageUrl} alt={booking.tourName} className="w-full h-full object-cover" />
                )}
            </Link>
            <div className="flex-1 p-6 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                            {t("trips.myTrips.tourOrder", { orderCode: booking.orderCode })}
                        </p>
                        <h3 className="font-headline text-xl font-bold text-primary">{booking.tourName}</h3>
                        {booking.destinationName && <p className="text-xs text-on-surface-variant">{booking.destinationName}</p>}
                    </div>
                    <StatusBadge status={booking.status} labels={getBookingStatusLabels(t)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("trips.myTrips.dates")}</p>
                        <p className="font-semibold">
                            {formatDate(booking.departureDate)} → {formatDate(booking.returnDate)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("trips.myTrips.travellers")}</p>
                        <p className="font-semibold">{guests}</p>
                    </div>
                    <div className="sm:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            {t("common.units.day", { count: booking.durationDays })}
                        </p>
                        <p className="font-headline text-xl font-black text-primary">
                            {formatMoney(booking.totalPrice, booking.currencyCode)}
                        </p>
                    </div>
                </div>
                {error && <p className="text-xs text-error">{error}</p>}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/20">
                    {booking.status === "confirmed" && booking.cancellable && (
                        <span className="text-xs text-on-surface-variant mr-auto">
                            {t("trips.myTrips.freeCancellationUntil", { date: formatDate(booking.freeCancellationUntil) })}
                        </span>
                    )}
                    {booking.status === "pending" && booking.paymentId && (
                        <Link
                            to={`/trip-payment/${booking.paymentId}`}
                            className="editorial-gradient text-white px-4 py-2 rounded-lg text-xs font-bold"
                        >
                            {t("trips.myTrips.payNow")}
                        </Link>
                    )}
                    {booking.cancellable && (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-lg text-xs font-bold text-error border border-error/30 hover:bg-error-container/40 disabled:opacity-50"
                        >
                            {busy ? t("trips.myTrips.cancelling") : t("common.actions.cancel")}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

/** Đặt phòng khách sạn: dùng lại thẻ của Booking History cũ (huỷ / xem chi tiết ở /bookings/:id). */
function HotelTripCard({ booking, highlighted }) {
    return (
        <div id={`trip-${booking.id}`} className={highlighted ? "rounded-xl ring-2 ring-primary" : ""}>
            <BookingListItem booking={booking} />
        </div>
    );
}

/** Loại chuyến trong My Trips: nguồn dữ liệu + thẻ hiển thị. */
const TRIP_TYPES = {
    hotels: {
        labelKey: "nav.hotels",
        icon: "hotel",
        fetch: fetchMyBookings,
        Card: HotelTripCard,
        browse: "/hotels",
        browseLabelKey: "trips.myTrips.browse.findHotel",
    },
    cars: {
        labelKey: "nav.cars",
        icon: "directions_car",
        fetch: fetchMyCarBookings,
        Card: CarTripCard,
        browse: "/cars",
        browseLabelKey: "trips.myTrips.browse.cars",
    },
    flights: {
        labelKey: "nav.flights",
        icon: "flight",
        fetch: fetchMyFlightBookings,
        Card: FlightTripCard,
        browse: "/flights",
        browseLabelKey: "trips.myTrips.browse.flights",
    },
    tours: {
        labelKey: "nav.tours",
        icon: "tour",
        fetch: fetchMyTourBookings,
        Card: TourTripCard,
        browse: "/tours",
        browseLabelKey: "trips.myTrips.browse.tours",
    },
};

/** Mọi chuyến đã đặt: khách sạn, xe, vé máy bay, tour (tab theo ?tab=; /booking-history chuyển về tab hotels). */
function MyTrips() {
    const t = useT();
    const [params, setParams] = useSearchParams();
    const tab = TRIP_TYPES[params.get("tab")] ? params.get("tab") : "hotels";
    const type = TRIP_TYPES[tab];
    const status = params.get("status") || "all";
    const page = Number(params.get("page") || 1);
    const paidId = params.get("paid");
    // `tab` đi kèm dữ liệu: lúc vừa đổi tab, danh sách cũ (vd. booking xe) không được vẽ bằng thẻ của tab mới.
    const [result, setResult] = useState({ tab: null, items: [], total: 0 });
    const [fetching, setFetching] = useState(true);
    const loading = fetching || result.tab !== tab;
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setFetching(true);
        setError("");
        type.fetch({ status, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult({ ...data, tab }))
            .catch((err) => !cancelled && (setError(err.message), setResult({ tab, items: [], total: 0 })))
            .finally(() => !cancelled && setFetching(false));
        return () => {
            cancelled = true;
        };
    }, [tab, type, status, page]);

    // Vừa thanh toán xong: cuộn tới đơn đó (danh sách xếp theo ngày nhận xe nên có thể không nằm đầu trang).
    useEffect(() => {
        if (paidId && !loading) {
            document.getElementById(`trip-${paidId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [paidId, loading]);

    // Vé máy bay: cả order (nhiều hành khách) được đánh dấu cùng lúc.
    const paidOrderId = result.items.find((b) => b.id === paidId)?.orderId ?? null;

    const setFilter = (changes) => {
        const next = new URLSearchParams(params);
        Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
        next.delete("paid");
        setParams(next);
    };

    return (
        <DashboardLayout>
            <section className="mb-10">
                <span className="text-[0.75rem] uppercase tracking-[0.2em] text-on-tertiary-fixed-variant mb-2 block">
                    {t("trips.myTrips.eyebrow")}
                </span>
                <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-2">{t("nav.sidebar.myTrips")}</h1>
                <p className="text-on-surface-variant text-lg">
                    {t("trips.myTrips.subtitle")}
                </p>
            </section>

            {paidId && <FormAlert type="success">{t("trips.myTrips.paymentReceived")}</FormAlert>}

            <div className="flex gap-2 border-b border-outline-variant/30 mt-6">
                {Object.entries(TRIP_TYPES).map(([key, tripType]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setParams(new URLSearchParams({ tab: key }))}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-colors ${
                            tab === key
                                ? "border-primary text-primary"
                                : "border-transparent text-on-surface-variant hover:text-on-surface"
                        }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">{tripType.icon}</span>
                        {t(tripType.labelKey)}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap gap-2 my-6">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => setFilter({ status: tab.value === "all" ? "" : tab.value, page: "" })}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                            status === tab.value
                                ? "bg-primary text-on-primary"
                                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                    >
                        {t(tab.labelKey)}
                    </button>
                ))}
            </div>

            <FormAlert>{error}</FormAlert>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-44 rounded-xl bg-surface-container-high animate-pulse" />
                    ))}
                </div>
            ) : result.items.length === 0 ? (
                <div className="text-center py-16 bg-surface-container-low rounded-xl">
                    <span className="material-symbols-outlined text-5xl text-outline mb-3">{type.icon}</span>
                    <p className="text-on-surface-variant mb-4">{t("trips.myTrips.empty")}</p>
                    <Link to={type.browse} className="text-sm font-bold text-primary hover:underline">
                        {t(type.browseLabelKey)}
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {result.items.map((booking) => (
                        <type.Card
                            key={booking.id}
                            booking={booking}
                            highlighted={booking.id === paidId || (paidOrderId != null && booking.orderId === paidOrderId)}
                            onChanged={(updated) =>
                                setResult((prev) => ({
                                    ...prev,
                                    items: prev.items.map((b) => (b.id === updated.id ? updated : b)),
                                }))
                            }
                        />
                    ))}
                </div>
            )}

            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={(p) => setFilter({ page: String(p) })} />
        </DashboardLayout>
    );
}

export default MyTrips;
