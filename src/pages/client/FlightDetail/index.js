import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import DetailBackLink from "../../../components/catalog/DetailBackLink";
import FormAlert from "../../../components/common/FormAlert";
import FavoriteButton from "../../../components/common/FavoriteButton";
import AddToTripCartButton from "../../../components/catalog/AddToTripCartButton";
import ReviewSection from "../../../components/client/ReviewSection";
import { PAYMENT_METHODS } from "../../../services/bookingService";
import {
    SEAT_CLASS_LABELS,
    createFlightBooking,
    fetchFlight,
    fetchFlightSeats,
    fetchFlights,
    formatDuration,
} from "../../../services/flightService";
import { formatMoney } from "../../../utils/formatters";
import { AirlineLogo, FlightTimeline } from "../../../components/catalog/FlightTimeline";

const MAX_PASSENGERS = 9;
const inputClass =
    "w-full bg-surface-container-low border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-fixed-dim";
const rowOf = (seatNumber) => Number(String(seatNumber).replace(/\D/g, "")) || 0;
const letterOf = (seatNumber) => String(seatNumber).replace(/\d/g, "");

/** Sơ đồ ghế: nhóm theo hàng, chữ cái chia hai nửa với lối đi ở giữa (theo FLIGHT_DETAIL.HTML). */
function SeatMap({ seats, selected, onToggle, maxReached }) {
    const letters = useMemo(() => [...new Set(seats.map((s) => letterOf(s.seatNumber)))].sort(), [seats]);
    const rows = useMemo(() => {
        const byRow = new Map();
        seats.forEach((seat) => {
            const row = rowOf(seat.seatNumber);
            if (!byRow.has(row)) byRow.set(row, {});
            byRow.get(row)[letterOf(seat.seatNumber)] = seat;
        });
        return [...byRow.entries()].sort((a, b) => a[0] - b[0]);
    }, [seats]);
    const half = Math.ceil(letters.length / 2);
    const columns = [...letters.slice(0, half), "aisle", ...letters.slice(half)];

    if (seats.length === 0) {
        return <p className="text-sm text-on-surface-variant text-center py-10">No seats in this cabin.</p>;
    }
    return (
        <div className="overflow-x-auto">
            <div className="inline-grid gap-2 mx-auto" style={{ gridTemplateColumns: `repeat(${columns.length}, 2.5rem)` }}>
                {columns.map((col) => (
                    <div key={`h-${col}`} className="text-center text-xs font-bold text-on-surface-variant">
                        {col === "aisle" ? "" : col}
                    </div>
                ))}
                {rows.map(([row, byLetter]) =>
                    columns.map((col) => {
                        if (col === "aisle") {
                            return (
                                <div
                                    key={`${row}-aisle`}
                                    className="flex items-center justify-center text-[10px] font-bold text-outline"
                                >
                                    {row}
                                </div>
                            );
                        }
                        const seat = byLetter[col];
                        if (!seat) return <div key={`${row}-${col}`} />;
                        const isSelected = selected.some((s) => s.id === seat.id);
                        const free = seat.status === "available";
                        const disabled = !free || (!isSelected && maxReached);
                        return (
                            <button
                                key={seat.id}
                                type="button"
                                disabled={disabled && !isSelected}
                                onClick={() => onToggle(seat)}
                                title={`${seat.seatNumber} · ${formatMoney(seat.price)}`}
                                className={`w-10 h-10 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${
                                    isSelected
                                        ? "editorial-gradient text-white shadow-lg scale-105"
                                        : free
                                          ? "bg-surface-container-lowest border border-outline-variant hover:border-primary hover:text-primary disabled:opacity-40"
                                          : "bg-surface-container-high text-outline cursor-not-allowed"
                                }`}
                            >
                                {isSelected ? (
                                    seat.seatNumber
                                ) : free ? (
                                    ""
                                ) : (
                                    <span className="material-symbols-outlined text-sm">close</span>
                                )}
                            </button>
                        );
                    }),
                )}
            </div>
        </div>
    );
}

/** Chi tiết chuyến bay: chuyến khác cùng chặng / ngày, chọn ghế, thông tin hành khách, đặt vé. */
function FlightDetail() {
    const { id } = useParams();
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoggedIn } = useAuth();
    const [flight, setFlight] = useState(null);
    const [alternatives, setAlternatives] = useState([]);
    const [seats, setSeats] = useState([]);
    const [cabin, setCabin] = useState(params.get("class") || "");
    const [pax, setPax] = useState(Math.min(Math.max(Number(params.get("pax") || 1), 1), MAX_PASSENGERS));
    const [selected, setSelected] = useState([]);
    const [passengers, setPassengers] = useState({});
    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]?.value || "credit_card");
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setFlight(null);
        setSelected([]);
        fetchFlight(id)
            .then((data) => {
                setFlight(data);
                setCabin((current) =>
                    current && data.cabinClasses.includes(current) ? current : data.cabinClasses[0] || "economy",
                );
                return fetchFlights({
                    from: data.departureAirportCode,
                    to: data.arrivalAirportCode,
                    departDate: data.departureTime.slice(0, 10),
                    limit: 6,
                });
            })
            .then((list) => setAlternatives(list.items))
            .catch((err) => setError(err.status === 404 ? "This flight is no longer on sale." : err.message));
    }, [id]);

    const loadSeats = () =>
        fetchFlightSeats(id)
            .then(setSeats)
            .catch((err) => setError(err.message));
    useEffect(() => {
        loadSeats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const cabinSeats = seats.filter((s) => s.seatClass === cabin);
    const total = selected.reduce((sum, s) => sum + Number(s.price), 0);

    const toggleSeat = (seat) => {
        setFormError("");
        setSelected((prev) =>
            prev.some((s) => s.id === seat.id)
                ? prev.filter((s) => s.id !== seat.id)
                : prev.length < pax
                  ? [...prev, seat]
                  : prev,
        );
    };
    const changePax = (delta) => {
        const next = Math.min(Math.max(pax + delta, 1), MAX_PASSENGERS);
        setPax(next);
        setSelected((prev) => prev.slice(0, next));
        const nextParams = new URLSearchParams(params);
        nextParams.set("pax", String(next));
        setParams(nextParams, { replace: true });
    };
    /** Hành khách đầu tiên mặc định là chủ tài khoản cho tới khi người dùng sửa. */
    const nameOf = (seat, index) => passengers[seat.id]?.passengerName ?? (index === 0 ? user?.fullName || "" : "");
    const setPassenger = (seatId, field, value) =>
        setPassengers((prev) => ({ ...prev, [seatId]: { ...prev[seatId], [field]: value } }));

    /** Body đặt vé (chưa có paymentMethod); ném Error nếu chưa chọn đủ ghế hoặc thiếu tên hành khách. */
    const buildBooking = () => {
        if (selected.length !== pax) {
            throw new Error(`Please choose ${pax} seat${pax > 1 ? "s" : ""} on the map.`);
        }
        const missing = selected.find((s, index) => !nameOf(s, index).trim());
        if (missing) {
            throw new Error(`Enter the passenger name for seat ${missing.seatNumber}.`);
        }
        return {
            flightId: id,
            passengers: selected.map((seat, index) => ({
                seatId: seat.id,
                passengerName: nameOf(seat, index).trim(),
                passengerEmail: passengers[seat.id]?.passengerEmail?.trim() || null,
                passportNo: passengers[seat.id]?.passportNo?.trim() || null,
            })),
        };
    };

    const handleBook = async () => {
        if (!isLoggedIn) {
            navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
            return;
        }
        let booking;
        try {
            booking = buildBooking();
        } catch (err) {
            setFormError(err.message);
            return;
        }
        setSubmitting(true);
        setFormError("");
        try {
            const order = await createFlightBooking({ ...booking, paymentMethod });
            navigate(`/trip-payment/${order.paymentId}`);
        } catch (err) {
            setFormError(err.details?.length ? err.details.join(" · ") : err.message);
            setSubmitting(false);
            if (err.status === 409) {
                setSelected([]);
                loadSeats();
            }
        }
    };

    if (error) {
        return (
            <main className="max-w-screen-2xl mx-auto px-8 py-12">
                <DetailBackLink to="/flights" label="Back to Flights" />
                <FormAlert>{error}</FormAlert>
            </main>
        );
    }
    if (!flight) {
        return (
            <main className="max-w-screen-2xl mx-auto px-8 py-8 animate-pulse">
                <div className="h-20 bg-surface-container-high rounded-xl mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3 h-96 bg-surface-container-high rounded-xl" />
                    <div className="lg:col-span-6 h-96 bg-surface-container-high rounded-xl" />
                    <div className="lg:col-span-3 h-96 bg-surface-container-high rounded-xl" />
                </div>
            </main>
        );
    }

    const dateLabel = new Date(flight.departureTime).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const keepQuery = (flightId) => `/flights/${flightId}?${new URLSearchParams({ class: cabin, pax: String(pax) })}`;

    return (
        <main className="max-w-screen-2xl mx-auto px-8 py-8">
            {/* Action bar */}
            <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
                <DetailBackLink to="/flights" label="Back to Flights" />
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-6 bg-surface-container-low rounded-xl px-6 py-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Route</p>
                            <p className="font-headline font-bold text-on-surface">
                                {flight.departureCity || flight.departureAirportCode} ({flight.departureAirportCode}) →{" "}
                                {flight.arrivalCity || flight.arrivalAirportCode} ({flight.arrivalAirportCode})
                            </p>
                        </div>
                        <div className="w-px h-8 bg-outline-variant/40" />
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</p>
                            <p className="font-headline font-bold text-on-surface">{dateLabel}</p>
                        </div>
                    </div>
                    <FavoriteButton itemType="flight" itemId={flight.id} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: flight selection */}
                <div className="lg:col-span-3 space-y-4">
                    <h2 className="font-headline text-xl font-bold text-primary">Select Your Flight</h2>
                    {alternatives.map((alt) => {
                        const active = alt.id === flight.id;
                        return (
                            <Link
                                key={alt.id}
                                to={keepQuery(alt.id)}
                                className={`block rounded-xl p-5 transition-all ${
                                    active
                                        ? "bg-surface-container-lowest border-2 border-primary shadow-lg"
                                        : "bg-surface-container-low hover:bg-surface-container"
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <AirlineLogo flight={alt} size="w-10 h-10" />
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm truncate">{alt.airline}</p>
                                        <p className="text-xs text-on-surface-variant">
                                            {alt.flightNumber}
                                            {alt.aircraftType ? ` • ${alt.aircraftType}` : ""}
                                        </p>
                                    </div>
                                </div>
                                <FlightTimeline flight={alt} compact />
                                <div className="flex justify-between items-baseline mt-4">
                                    <span className="text-xs text-on-surface-variant">From</span>
                                    <span className="font-headline font-black text-primary">
                                        {formatMoney(alt.fromPrice, alt.currencyCode)}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Middle: seat map */}
                <div className="lg:col-span-6 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div>
                            <h3 className="font-headline text-2xl font-bold text-on-surface">
                                {flight.aircraftType || "Cabin map"}
                            </h3>
                            <p className="text-sm text-on-surface-variant">
                                {flight.airline} {flight.flightNumber} · {formatDuration(flight.durationMinutes)} ·{" "}
                                {flight.availableSeats} seats left
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-surface-container-low rounded-full px-2 py-1">
                            <button
                                type="button"
                                onClick={() => changePax(-1)}
                                className="w-8 h-8 rounded-full hover:bg-surface-container-high font-bold"
                            >
                                −
                            </button>
                            <span className="text-sm font-bold px-1">
                                {pax} passenger{pax > 1 ? "s" : ""}
                            </span>
                            <button
                                type="button"
                                onClick={() => changePax(1)}
                                className="w-8 h-8 rounded-full hover:bg-surface-container-high font-bold"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {flight.cabinClasses.map((cls) => (
                            <button
                                key={cls}
                                type="button"
                                onClick={() => {
                                    setCabin(cls);
                                    setSelected([]);
                                }}
                                className={`px-4 py-2 rounded-full border text-sm font-bold transition-all ${
                                    cabin === cls
                                        ? "border-primary text-primary bg-primary-fixed/40"
                                        : "border-outline-variant hover:border-primary"
                                }`}
                            >
                                {SEAT_CLASS_LABELS[cls] || cls}
                            </button>
                        ))}
                        {flight.cabinClasses.length === 0 && (
                            <p className="text-sm text-error font-bold">This flight is sold out.</p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-6 mb-8 text-xs font-bold text-on-surface-variant">
                        <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded border border-outline-variant bg-surface-container-lowest" />{" "}
                            Available
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-surface-container-high flex items-center justify-center">
                                <span className="material-symbols-outlined text-[12px] text-outline">close</span>
                            </span>
                            Occupied
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded editorial-gradient" /> Selected
                        </span>
                    </div>
                    <SeatMap seats={cabinSeats} selected={selected} onToggle={toggleSeat} maxReached={selected.length >= pax} />
                </div>

                {/* Right: summary */}
                <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
                    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_32px_48px_-12px_rgba(27,28,28,0.06)] border border-outline-variant/15">
                        <h3 className="font-headline text-xl font-bold text-primary mb-6">Booking Summary</h3>
                        {selected.length === 0 ? (
                            <div className="flex items-start gap-3 bg-surface-container-low rounded-lg p-4 mb-6">
                                <span className="material-symbols-outlined text-primary">airline_seat_recline_extra</span>
                                <p className="text-sm text-on-surface-variant">
                                    Choose {pax} seat{pax > 1 ? "s" : ""} on the cabin map.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 mb-6">
                                {selected.map((seat, index) => (
                                    <div key={seat.id} className="bg-surface-container-low rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-bold">
                                                Seat {seat.seatNumber} · {SEAT_CLASS_LABELS[seat.seatClass]}
                                            </p>
                                            <span className="text-sm font-bold text-primary">
                                                {formatMoney(seat.price, flight.currencyCode)}
                                            </span>
                                        </div>
                                        <input
                                            className={inputClass}
                                            placeholder="Passenger full name *"
                                            maxLength={150}
                                            value={nameOf(seat, index)}
                                            onChange={(e) => setPassenger(seat.id, "passengerName", e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                className={inputClass}
                                                placeholder="Email"
                                                type="email"
                                                maxLength={150}
                                                value={passengers[seat.id]?.passengerEmail || ""}
                                                onChange={(e) => setPassenger(seat.id, "passengerEmail", e.target.value)}
                                            />
                                            <input
                                                className={inputClass}
                                                placeholder="Passport no."
                                                maxLength={30}
                                                value={passengers[seat.id]?.passportNo || ""}
                                                onChange={(e) => setPassenger(seat.id, "passportNo", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Flight fare × {selected.length || pax}</span>
                                <span className="font-bold">{formatMoney(total, flight.currencyCode)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Taxes &amp; fees</span>
                                <span className="font-bold">Included</span>
                            </div>
                            <label className="block">
                                <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                                    Payment
                                </span>
                                <select
                                    className={inputClass}
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    {PAYMENT_METHODS.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-baseline">
                                <span className="font-bold text-on-surface">Total</span>
                                <span className="text-2xl font-black text-primary font-headline">
                                    {formatMoney(total, flight.currencyCode)}
                                </span>
                            </div>
                        </div>
                        <FormAlert>{formError}</FormAlert>
                        <button
                            type="button"
                            disabled={submitting || flight.cabinClasses.length === 0}
                            onClick={handleBook}
                            className="w-full mt-6 bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-lg font-bold font-headline shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {submitting ? "Processing..." : "Continue to Payment"}
                        </button>
                        <div className="mt-3">
                            <AddToTripCartButton
                                itemType="flight"
                                disabled={flight.cabinClasses.length === 0}
                                build={buildBooking}
                            />
                        </div>
                        <p className="text-center text-[10px] text-on-surface-variant font-medium uppercase tracking-tighter mt-4">
                            <span className="material-symbols-outlined text-[14px] align-text-top mr-1">verified_user</span>
                            Free cancellation until 24h before departure
                        </p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-primary">luggage</span>
                            <h4 className="font-bold text-sm">Included Baggage</h4>
                        </div>
                        <p className="text-sm text-on-surface-variant whitespace-pre-line">
                            {flight.baggagePolicy || "Standard carry-on allowance applies. Contact us for checked baggage."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mt-16">
                <ReviewSection entityType="flight" entityId={flight.id} title="Passenger Reviews" />
            </div>
        </main>
    );
}

export default FlightDetail;
