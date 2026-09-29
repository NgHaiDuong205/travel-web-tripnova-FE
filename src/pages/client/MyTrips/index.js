import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../../components/common/StatusBadge";
import { BOOKING_STATUS_LABELS, cancelCarBooking, fetchMyCarBookings } from "../../../services/carService";
import { formatDateTime, formatMoney } from "../../../utils/formatters";

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
                <img src={booking.carImageUrl || PLACEHOLDER_IMAGE} alt={booking.carName} className="w-full h-full object-cover" />
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
                        <p className="font-headline text-xl font-black text-primary">{formatMoney(booking.totalPrice, booking.currencyCode)}</p>
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
                        <Link to={`/trip-payment/${booking.paymentId}`} className="editorial-gradient text-white px-4 py-2 rounded-lg text-xs font-bold">
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

/** Các chuyến đã đặt ngoài khách sạn (hiện có: thuê xe). Khách sạn vẫn ở Booking History. */
function MyTrips() {
    const [params, setParams] = useSearchParams();
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
        fetchMyCarBookings({ status, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [status, page]);

    // Vừa thanh toán xong: cuộn tới đơn đó (danh sách xếp theo ngày nhận xe nên có thể không nằm đầu trang).
    useEffect(() => {
        if (paidId && !loading) {
            document.getElementById(`trip-${paidId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [paidId, loading]);

    const setFilter = (changes) => {
        const next = new URLSearchParams(params);
        Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
        next.delete("paid");
        setParams(next);
    };

    return (
        <DashboardLayout>
            <section className="mb-10">
                <span className="text-[0.75rem] uppercase tracking-[0.2em] text-on-tertiary-fixed-variant mb-2 block">Journeys</span>
                <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-2">My Trips</h1>
                <p className="text-on-surface-variant text-lg">Car rentals and other reservations. Hotel stays are in Booking History.</p>
            </section>

            {paidId && <FormAlert type="success">Payment received — your reservation is confirmed.</FormAlert>}

            <div className="flex flex-wrap gap-2 my-6">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => setFilter({ status: tab.value === "all" ? "" : tab.value, page: "" })}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                            status === tab.value ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
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
                    <span className="material-symbols-outlined text-5xl text-outline mb-3">directions_car</span>
                    <p className="text-on-surface-variant mb-4">No trips here yet.</p>
                    <Link to="/cars" className="text-sm font-bold text-primary hover:underline">
                        Browse cars
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {result.items.map((booking) => (
                        <CarTripCard
                            key={booking.id}
                            booking={booking}
                            highlighted={booking.id === paidId}
                            onChanged={(updated) =>
                                setResult((prev) => ({ ...prev, items: prev.items.map((b) => (b.id === updated.id ? updated : b)) }))
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
