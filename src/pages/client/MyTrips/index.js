import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../../components/common/StatusBadge";
import { BOOKING_STATUS_LABELS, cancelCarBooking, fetchMyCarBookings } from "../../../services/carService";
import { SEAT_CLASS_LABELS, cancelFlightBooking, fetchMyFlightBookings } from "../../../services/flightService";
import { AirlineLogo, FlightTimeline, flightDateLabel } from "../../../components/catalog/FlightTimeline";
import { cancelTourBooking, fetchMyTourBookings } from "../../../services/tourService";
import { formatDate, formatDateTime, formatMoney } from "../../../utils/formatters";

const PAGE_SIZE = 10;
const STATUS_TABS = [
    { value: "all", label: "All" },
    { value: "upcoming", label: "Upcoming" },
    { value: "pending", label: "Awaiting payment" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80";

/** Một đơn thuê xe trong danh sách My Trips. */
function CarTripCard({ booking, highlighted, onChanged }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleCancel = async () => {
        const paid = booking.status === "confirmed";
        const question = paid
            ? "Cancel this rental? You will receive a full refund."
            : "Cancel this reservation? It has not been paid yet.";
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
                            Car rental · {booking.orderCode}
                        </p>
                        <h3 className="font-headline text-xl font-bold text-primary">{booking.carName}</h3>
                        <p className="text-xs text-on-surface-variant">
                            {[booking.carBrand, booking.carModel].filter(Boolean).join(" ")}
                            {booking.withDriver ? " · with driver" : " · self-drive"}
                        </p>
                    </div>
                    <StatusBadge status={booking.status} labels={BOOKING_STATUS_LABELS} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Pick-up</p>
                        <p className="font-semibold">{formatDateTime(booking.pickupDate)}</p>
                        {booking.pickupLocation && <p className="text-xs text-on-surface-variant">{booking.pickupLocation}</p>}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Drop-off</p>
                        <p className="font-semibold">{formatDateTime(booking.returnDate)}</p>
                        {booking.returnLocation && <p className="text-xs text-on-surface-variant">{booking.returnLocation}</p>}
                    </div>
                    <div className="sm:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            {booking.rentalDays} day{booking.rentalDays === 1 ? "" : "s"}
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
                            Free cancellation until {formatDateTime(booking.freeCancellationUntil)}
                        </span>
                    )}
                    {booking.status === "pending" && booking.paymentId && (
                        <Link
                            to={`/trip-payment/${booking.paymentId}`}
                            className="editorial-gradient text-white px-4 py-2 rounded-lg text-xs font-bold"
                        >
                            Pay now
                        </Link>
                    )}
                    {booking.cancellable && (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-lg text-xs font-bold text-error border border-error/30 hover:bg-error-container/40 disabled:opacity-50"
                        >
                            {busy ? "Cancelling..." : "Cancel"}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

/** Một vé máy bay (một hành khách) trong My Trips. */
function FlightTripCard({ booking, highlighted, onChanged }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleCancel = async () => {
        const question =
            booking.status === "confirmed"
                ? `Cancel the ticket of ${booking.passengerName}? You will receive a full refund.`
                : "Cancel this reservation? All passengers of this order will be cancelled.";
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
                            Flight · {booking.orderCode}
                        </p>
                        <h3 className="font-headline text-xl font-bold text-primary">
                            {booking.airline} {booking.flightNumber}
                        </h3>
                        <p className="text-xs text-on-surface-variant">{flightDateLabel(booking.departureTime)}</p>
                    </div>
                </div>
                <StatusBadge status={booking.status} labels={BOOKING_STATUS_LABELS} />
            </div>
            <FlightTimeline flight={flight} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Passenger</p>
                    <p className="font-semibold">{booking.passengerName}</p>
                    {booking.passportNo && <p className="text-xs text-on-surface-variant">Passport {booking.passportNo}</p>}
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Seat</p>
                    <p className="font-semibold">
                        {booking.seatNumber || "—"}{" "}
                        {booking.seatClass ? `· ${SEAT_CLASS_LABELS[booking.seatClass] || booking.seatClass}` : ""}
                    </p>
                </div>
                <div className="sm:text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Fare</p>
                    <p className="font-headline text-xl font-black text-primary">
                        {formatMoney(booking.totalPrice, booking.currencyCode)}
                    </p>
                </div>
            </div>
            {error && <p className="text-xs text-error">{error}</p>}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/20">
                {booking.status === "confirmed" && booking.cancellable && (
                    <span className="text-xs text-on-surface-variant mr-auto">
                        Free cancellation until {formatDateTime(booking.freeCancellationUntil)}
                    </span>
                )}
                {booking.status === "pending" && booking.paymentId && (
                    <Link
                        to={`/trip-payment/${booking.paymentId}`}
                        className="editorial-gradient text-white px-4 py-2 rounded-lg text-xs font-bold"
                    >
                        Pay now
                    </Link>
                )}
                {booking.cancellable && (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-lg text-xs font-bold text-error border border-error/30 hover:bg-error-container/40 disabled:opacity-50"
                    >
                        {busy ? "Cancelling..." : "Cancel"}
                    </button>
                )}
            </div>
        </article>
    );
}

/** Một đơn tour trong My Trips. */
function TourTripCard({ booking, highlighted, onChanged }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleCancel = async () => {
        const question =
            booking.status === "confirmed"
                ? "Cancel this tour? You will receive a full refund."
                : "Cancel this reservation? It has not been paid yet.";
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

    const guests = `${booking.numAdults} adult${booking.numAdults === 1 ? "" : "s"}${
        booking.numChildren ? `, ${booking.numChildren} child${booking.numChildren === 1 ? "" : "ren"}` : ""
    }`;
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
                            Tour · {booking.orderCode}
                        </p>
                        <h3 className="font-headline text-xl font-bold text-primary">{booking.tourName}</h3>
                        {booking.destinationName && <p className="text-xs text-on-surface-variant">{booking.destinationName}</p>}
                    </div>
                    <StatusBadge status={booking.status} labels={BOOKING_STATUS_LABELS} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Dates</p>
                        <p className="font-semibold">
                            {formatDate(booking.departureDate)} → {formatDate(booking.returnDate)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Travellers</p>
                        <p className="font-semibold">{guests}</p>
                    </div>
                    <div className="sm:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            {booking.durationDays} day{booking.durationDays === 1 ? "" : "s"}
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
                            Free cancellation until {formatDate(booking.freeCancellationUntil)}
                        </span>
                    )}
                    {booking.status === "pending" && booking.paymentId && (
                        <Link
                            to={`/trip-payment/${booking.paymentId}`}
                            className="editorial-gradient text-white px-4 py-2 rounded-lg text-xs font-bold"
                        >
                            Pay now
                        </Link>
                    )}
                    {booking.cancellable && (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-lg text-xs font-bold text-error border border-error/30 hover:bg-error-container/40 disabled:opacity-50"
                        >
                            {busy ? "Cancelling..." : "Cancel"}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

/** Loại chuyến trong My Trips: nguồn dữ liệu + thẻ hiển thị. */
const TRIP_TYPES = {
    cars: {
        label: "Cars",
        icon: "directions_car",
        fetch: fetchMyCarBookings,
        Card: CarTripCard,
        browse: "/cars",
        browseLabel: "Browse cars",
    },
    flights: {
        label: "Flights",
        icon: "flight",
        fetch: fetchMyFlightBookings,
        Card: FlightTripCard,
        browse: "/flights",
        browseLabel: "Search flights",
    },
    tours: {
        label: "Tours",
        icon: "tour",
        fetch: fetchMyTourBookings,
        Card: TourTripCard,
        browse: "/tours",
        browseLabel: "Explore tours",
    },
};

/** Các chuyến đã đặt ngoài khách sạn (xe, vé máy bay, tour; tab theo ?tab=). Khách sạn vẫn ở Booking History. */
function MyTrips() {
    const [params, setParams] = useSearchParams();
    const tab = TRIP_TYPES[params.get("tab")] ? params.get("tab") : "cars";
    const type = TRIP_TYPES[tab];
    const status = params.get("status") || "all";
    const page = Number(params.get("page") || 1);
    const paidId = params.get("paid");
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        type.fetch({ status, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [type, status, page]);

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
                    Journeys
                </span>
                <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-2">My Trips</h1>
                <p className="text-on-surface-variant text-lg">
                    Car rentals, flights and tours. Hotel stays are in Booking History.
                </p>
            </section>

            {paidId && <FormAlert type="success">Payment received — your reservation is confirmed.</FormAlert>}

            <div className="flex gap-2 border-b border-outline-variant/30 mt-6">
                {Object.entries(TRIP_TYPES).map(([key, t]) => (
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
                        <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
                        {t.label}
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
                        {tab.label}
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
                    <p className="text-on-surface-variant mb-4">No trips here yet.</p>
                    <Link to={type.browse} className="text-sm font-bold text-primary hover:underline">
                        {type.browseLabel}
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
