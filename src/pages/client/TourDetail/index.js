import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import BookingSummaryCard from "../../../components/catalog/BookingSummaryCard";
import FormAlert from "../../../components/common/FormAlert";
import FavoriteButton from "../../../components/common/FavoriteButton";
import AddToTripCartButton from "../../../components/catalog/AddToTripCartButton";
import ReviewSection from "../../../components/client/ReviewSection";
import useTrackView from "../../../hooks/useTrackView";
import PendingOrderNotice, { usePendingOrders } from "../../../components/catalog/PendingOrderNotice";
import { PAYMENT_METHODS } from "../../../services/bookingService";
import {
    cancelTourBooking,
    createTourBooking,
    fetchMyTourBookings,
    fetchTour,
    fetchTourAvailability,
    fetchTourCars,
    fetchTourFlights,
    fetchTourHotels,
} from "../../../services/tourService";
import { formatDate, formatDateTime, formatMoney } from "../../../utils/formatters";
import { localDateTimeFromToday } from "../../../utils/dateTime";
import { useT } from "../../../i18n/I18nContext";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1800&q=80";
const FREE_CANCELLATION_DAYS = 30;
const MIN_LEAD_DAYS = 3;
const INCLUSION_ICONS = [
    ["meal|dining|breakfast|lunch|dinner|food", "restaurant"],
    ["boat|cruise|yacht|kayak", "directions_boat"],
    ["guide|historian|expert", "map"],
    ["transfer|shuttle|transport|car|bus", "airport_shuttle"],
    ["hotel|stay|room|accommodation", "hotel"],
    ["flight|air", "flight"],
    ["ticket|entrance|admission", "confirmation_number"],
];
const inputClass =
    "w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-fixed-dim";

const iconFor = (text) => INCLUSION_ICONS.find(([pattern]) => new RegExp(pattern, "i").test(text))?.[1] || "check_circle";
/** yyyy-MM-dd theo giờ địa phương (toISOString là UTC — lệch ngày trước 7h sáng ở VN). */
const isoPlusDays = (days) => localDateTimeFromToday(days).slice(0, 10);

/** Bộ đếm +/- (người lớn, trẻ em) theo thiết kế Booking Summary. */
function Counter({ label, value, min, max, onChange, t }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-on-surface">{label}</span>
            <div className="flex items-center gap-3 bg-surface-container-low rounded-full px-2 py-1">
                <button
                    type="button"
                    aria-label={t("tours.detail.fewer", { label })}
                    disabled={value <= min}
                    onClick={() => onChange(value - 1)}
                    className="w-8 h-8 rounded-full font-bold hover:bg-surface-container-high disabled:opacity-30"
                >
                    −
                </button>
                <span className="w-5 text-center font-bold">{value}</span>
                <button
                    type="button"
                    aria-label={t("tours.detail.more", { label })}
                    disabled={value >= max}
                    onClick={() => onChange(value + 1)}
                    className="w-8 h-8 rounded-full font-bold hover:bg-surface-container-high disabled:opacity-30"
                >
                    +
                </button>
            </div>
        </div>
    );
}

/** Chi tiết tour + đặt tour (theo TOUR_DETAIL.HTML). Đặt xong chuyển tới /trip-payment/:id. */
function TourDetail() {
    const t = useT();
    const { id } = useParams();
    useTrackView("tour", id);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoggedIn } = useAuth();
    const [tour, setTour] = useState(null);
    const [hotels, setHotels] = useState([]);
    const [cars, setCars] = useState([]);
    const [flights, setFlights] = useState([]);
    const [error, setError] = useState("");
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [date, setDate] = useState("");
    const [availability, setAvailability] = useState(null);
    const [contact, setContact] = useState({ name: "", phone: "", email: "", requests: "" });
    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]?.value || "credit_card");
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [availabilityNonce, setAvailabilityNonce] = useState(0); // tăng để lấy lại số chỗ (sau khi huỷ đơn)
    // Đơn tour này đã đặt nhưng chưa thanh toán (VD bấm Back từ trang thanh toán)
    const { orders: pendingOrders, reload: reloadPending } = usePendingOrders(fetchMyTourBookings, (b) => b.tourId === id, id);

    useEffect(() => {
        setTour(null);
        fetchTour(id)
            .then((data) => {
                setTour(data);
                setDate(data.departureDate || isoPlusDays(Math.max(MIN_LEAD_DAYS, 14)));
                if (data.minParticipants && data.minParticipants > 2) setAdults(Math.min(data.minParticipants, 9));
            })
            .catch((err) => setError(err.status === 404 ? t("tours.detail.noLongerAvailable") : err.message));
        fetchTourHotels(id)
            .then(setHotels)
            .catch(() => setHotels([]));
        fetchTourCars(id)
            .then(setCars)
            .catch(() => setCars([]));
        fetchTourFlights(id)
            .then(setFlights)
            .catch(() => setFlights([]));
    }, [id, t]);

    useEffect(() => {
        if (user)
            setContact((c) => ({
                ...c,
                name: c.name || user.fullName || "",
                email: c.email || user.email || "",
                phone: c.phone || user.phone || "",
            }));
    }, [user]);

    useEffect(() => {
        if (!tour || !date) return undefined;
        let cancelled = false;
        fetchTourAvailability(id, date)
            .then((data) => !cancelled && setAvailability(data))
            .catch(() => !cancelled && setAvailability(null));
        return () => {
            cancelled = true;
        };
    }, [tour, id, date, availabilityNonce]);

    const handleBook = async () => {
        if (!isLoggedIn) {
            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
            return;
        }
        if (!contact.name.trim()) {
            setFormError(t("tours.booking.contactNameRequired"));
            return;
        }
        setSubmitting(true);
        setFormError("");
        try {
            const booking = await createTourBooking({
                tourId: id,
                departureDate: date,
                numAdults: adults,
                numChildren: children,
                contactName: contact.name.trim(),
                contactPhone: contact.phone.trim() || null,
                contactEmail: contact.email.trim() || null,
                specialRequests: contact.requests.trim() || null,
                paymentMethod,
            });
            navigate(`/trip-payment/${booking.paymentId}`);
        } catch (err) {
            setFormError(err.details?.length ? err.details.join(" · ") : err.message);
            setSubmitting(false);
        }
    };

    if (error) {
        return (
            <main className="max-w-7xl mx-auto px-8 py-16">
                <Link
                    to="/tours"
                    className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary mb-6"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    {t("tours.detail.backToTours")}
                </Link>
                <FormAlert>{error}</FormAlert>
            </main>
        );
    }
    if (!tour) {
        return <div className="h-[600px] bg-surface-container-high animate-pulse" />;
    }

    const childPrice = Number(tour.priceChild ?? tour.priceAdult);
    const guests = adults + children;
    const total = adults * Number(tour.priceAdult) + children * childPrice;
    const spotsLeft = availability?.spotsLeft;
    const notEnough = spotsLeft != null && guests > spotsLeft;
    const cancellationDate = date
        ? (() => {
              const d = new Date(date);
              d.setDate(d.getDate() - FREE_CANCELLATION_DAYS);
              return d;
          })()
        : null;
    const place = [tour.destinationName, tour.countryName].filter(Boolean).join(", ");

    return (
        <main>
            {/* Hero */}
            <section className="relative h-[620px] w-full overflow-hidden">
                <img
                    src={tour.coverImageUrl || PLACEHOLDER_IMAGE}
                    alt={tour.name}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                <div className="relative z-10 max-w-screen-2xl mx-auto px-8 h-full flex flex-col justify-between py-10">
                    <Link
                        to="/tours"
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium text-sm w-fit"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        {t("tours.detail.backToTours")}
                    </Link>
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="inline-block bg-tertiary-fixed text-on-tertiary-fixed text-[10px] px-3 py-1 rounded font-bold tracking-widest uppercase">
                                    {t("tours.detail.dayJourney", { count: tour.durationDays })}
                                </span>
                                <FavoriteButton itemType="tour" itemId={id} />
                            </div>
                            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
                                {tour.name}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-white/90 font-medium">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">schedule</span>
                                    {t("common.units.day", { count: tour.durationDays })}{tour.durationNights ? ` · ${t("common.units.night", { count: tour.durationNights })}` : ""}
                                </span>
                                {place && (
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined">location_on</span>
                                        {place}
                                    </span>
                                )}
                                {tour.departureLocation && (
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined">trip_origin</span>
                                        {t("tours.detail.fromLocation", { location: tour.departureLocation })}
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Floating booking card */}
                        <div className="bg-surface/95 backdrop-blur-md rounded-xl p-6 w-full lg:w-80 shadow-2xl">
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                {t("tours.detail.startingFrom")}
                            </span>
                            <div className="font-headline text-3xl font-black text-primary mb-4">
                                {formatMoney(tour.priceAdult, tour.currencyCode)}{" "}
                                <span className="text-sm font-medium text-on-surface-variant">{t("common.units.perPerson")}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                                        {t("tours.detail.nextDeparture")}
                                    </span>
                                    <span className="font-bold">
                                        {tour.departureDate ? formatDate(tour.departureDate) : t("tours.detail.flexible")}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                                        {t("tours.detail.availability")}
                                    </span>
                                    <span className="font-bold">
                                        {spotsLeft != null ? t("tours.detail.spotsLeft", { count: spotsLeft }) : t("tours.detail.open")}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => document.getElementById("book")?.scrollIntoView({ behavior: "smooth" })}
                                className="w-full editorial-gradient text-white py-3 rounded-lg font-bold hover:opacity-90"
                            >
                                {t("tours.detail.bookThisTour")}
                            </button>
                            <p className="text-[11px] text-center text-on-surface-variant mt-3">
                                {t("tours.detail.flexibleCancellation", { count: FREE_CANCELLATION_DAYS })}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {pendingOrders.length > 0 && (
                <div className="max-w-screen-2xl mx-auto px-8 pt-10">
                    <PendingOrderNotice
                        orders={pendingOrders}
                        describe={(bookings) =>
                            bookings
                                .map((b) => `${formatDate(b.departureDate)} · ${t("common.units.guest", { count: (b.numAdults || 0) + (b.numChildren || 0) })}`)
                                .join("; ")
                        }
                        onCancel={(bookings) => cancelTourBooking(bookings[0].id, "Cancelled by customer before payment")}
                        onChanged={() => {
                            reloadPending();
                            setAvailabilityNonce((n) => n + 1);
                        }}
                    />
                </div>
            )}

            <div className="max-w-screen-2xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-20">
                    {/* Overview */}
                    <section>
                        <h2 className="font-headline text-3xl font-bold text-primary mb-6">{t("tours.detail.theJourney")}</h2>
                        <p className="text-lg text-on-surface-variant leading-relaxed whitespace-pre-line">{tour.description}</p>
                        {tour.highlights?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-6">
                                {tour.highlights.map((h) => (
                                    <span
                                        key={h}
                                        className="px-4 py-2 rounded-full bg-primary-fixed/40 text-primary text-sm font-bold"
                                    >
                                        {h}
                                    </span>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Stays */}
                    {hotels.length > 0 && (
                        <section>
                            <div className="flex items-end justify-between mb-8">
                                <h2 className="font-headline text-3xl font-bold text-primary">{t("tours.detail.staysIncluded")}</h2>
                                <span className="text-sm font-bold text-on-surface-variant">
                                    {t("tours.detail.handpickedProperty", { count: hotels.length })}
                                </span>
                            </div>
                            <div className="space-y-6">
                                {hotels.map((h) => (
                                    <Link
                                        key={h.hotelId}
                                        to={`/hotel/${h.hotelId}`}
                                        className="flex flex-col md:flex-row gap-6 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                                    >
                                        <div className="md:w-72 h-52 shrink-0 bg-surface-container-high">
                                            <img
                                                src={h.imageUrl || PLACEHOLDER_IMAGE}
                                                alt={h.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-6">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                                {h.destinationName}
                                                {h.checkInDay ? ` · ${t("tours.detail.day", { count: h.checkInDay })}` : ""}
                                                {h.nights ? ` · ${t("common.units.night", { count: h.nights })}` : ""}
                                            </span>
                                            <h3 className="font-headline text-2xl font-bold text-on-surface mt-1 mb-2">
                                                {h.name}
                                            </h3>
                                            {h.starRating && (
                                                <p className="text-tertiary-fixed-dim mb-2">{"★".repeat(h.starRating)}</p>
                                            )}
                                            <p className="text-sm text-on-surface-variant line-clamp-3">{h.description}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Itinerary timeline */}
                    {tour.itinerary?.length > 0 && (
                        <section>
                            <h2 className="font-headline text-3xl font-bold text-primary mb-10">{t("tours.detail.theItinerary")}</h2>
                            <ol className="relative border-l-2 border-primary-fixed-dim ml-3 space-y-10">
                                {tour.itinerary.map((day) => (
                                    <li key={`${day.label}-${day.title}`} className="pl-8 relative">
                                        <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full editorial-gradient ring-4 ring-surface" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                                            {day.label}
                                        </span>
                                        <h3 className="font-headline text-xl font-bold text-on-surface mt-1 mb-2">{day.title}</h3>
                                        {day.description && (
                                            <p className="text-on-surface-variant leading-relaxed">{day.description}</p>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </section>
                    )}

                    {/* Transport */}
                    {(flights.length > 0 || cars.length > 0) && (
                        <section>
                            <h2 className="font-headline text-3xl font-bold text-primary mb-6">{t("tours.detail.gettingAround")}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {flights.map((f) => (
                                    <div
                                        key={f.flightId}
                                        className="bg-surface-container-low rounded-xl p-5 flex items-center gap-4"
                                    >
                                        <span className="material-symbols-outlined text-primary text-3xl">flight</span>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                                {f.leg || t("tours.detail.flight")}
                                            </p>
                                            <p className="font-bold">
                                                {f.airline} {f.flightNumber} · {f.departureAirportCode} → {f.arrivalAirportCode}
                                            </p>
                                            <p className="text-xs text-on-surface-variant">{formatDateTime(f.departureTime)}</p>
                                        </div>
                                    </div>
                                ))}
                                {cars.map((c) => (
                                    <div
                                        key={c.carId}
                                        className="bg-surface-container-low rounded-xl p-5 flex items-center gap-4"
                                    >
                                        <span className="material-symbols-outlined text-primary text-3xl">airport_shuttle</span>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                                {c.usageDay ? t("tours.detail.day", { count: c.usageDay }) : t("tours.detail.transfer")}
                                            </p>
                                            <p className="font-bold">{c.name}</p>
                                            <p className="text-xs text-on-surface-variant">
                                                {t("tours.detail.seats", { count: c.seats, withDriver: c.withDriver ? t("tours.detail.withDriver") : "" })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Inclusions */}
                    {(tour.included?.length > 0 || tour.excluded?.length > 0) && (
                        <section>
                            <h2 className="font-headline text-3xl font-bold text-primary mb-8">{t("tours.detail.curatedInclusions")}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {tour.included.map((item) => (
                                    <div
                                        key={item}
                                        className="bg-surface-container-low rounded-xl p-5 flex flex-col items-center text-center gap-3"
                                    >
                                        <span
                                            className="material-symbols-outlined text-primary text-3xl"
                                            style={{ fontVariationSettings: "'FILL' 1" }}
                                        >
                                            {iconFor(item)}
                                        </span>
                                        <span className="text-sm font-bold">{item}</span>
                                    </div>
                                ))}
                            </div>
                            {tour.excluded?.length > 0 && (
                                <div className="mt-6 text-sm text-on-surface-variant">
                                    <span className="font-bold text-on-surface">{t("tours.detail.notIncluded")}</span>
                                    {tour.excluded.join(" · ")}
                                </div>
                            )}
                        </section>
                    )}

                    <ReviewSection entityType="tour" entityId={id} title={t("tours.detail.travellerReviews")} />
                </div>

                {/* Booking summary */}
                <div id="book" className="scroll-mt-24">
                    <BookingSummaryCard
                        eyebrow={t("tours.booking.summary")}
                        price={formatMoney(tour.priceAdult, tour.currencyCode)}
                        priceSuffix={t("common.units.perPerson")}
                        rows={[
                            {
                                label: t("tours.booking.adultQuantity", { count: adults }),
                                value: formatMoney(adults * Number(tour.priceAdult), tour.currencyCode),
                            },
                            ...(children > 0
                                ? [
                                      {
                                          label: t("tours.booking.childQuantity", { count: children }),
                                          value: formatMoney(children * childPrice, tour.currencyCode),
                                      },
                                  ]
                                : []),
                        ]}
                        totalLabel={t("tours.booking.totalPrice")}
                        total={formatMoney(total, tour.currencyCode)}
                        ctaLabel={notEnough ? t("tours.booking.notEnoughSpots") : t("tours.booking.confirmBooking")}
                        ctaDisabled={notEnough || !date}
                        ctaBusy={submitting}
                        onCta={handleBook}
                        footnote={
                            cancellationDate
                                ? t("tours.booking.freeCancellationUntil", { date: formatDate(cancellationDate) })
                                : t("tours.detail.flexibleCancellation", { count: FREE_CANCELLATION_DAYS })
                        }
                    >
                        <label className="block">
                            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">
                                {t("tours.booking.departure")}
                            </span>
                            <input
                                type="date"
                                className={`${inputClass} disabled:opacity-70`}
                                value={date}
                                min={isoPlusDays(MIN_LEAD_DAYS)}
                                disabled={Boolean(tour.departureDate)}
                                onChange={(e) => setDate(e.target.value)}
                            />
                            {tour.departureDate && (
                                <span className="text-[11px] text-on-surface-variant ml-1">{t("tours.booking.fixedDateDeparture")}</span>
                            )}
                        </label>
                        <Counter label={t("common.fields.adults")} value={adults} min={1} max={20} onChange={setAdults} t={t} />
                        <Counter label={t("common.fields.children")} value={children} min={0} max={20} onChange={setChildren} t={t} />
                        {spotsLeft != null && (
                            <p className={`text-xs font-bold ${notEnough ? "text-error" : "text-green-700"}`}>
                                {t("tours.booking.spotsLeftForDate", { count: spotsLeft })}
                            </p>
                        )}
                        <input
                            className={inputClass}
                            placeholder={t("tours.booking.contactName")}
                            maxLength={150}
                            value={contact.name}
                            onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                className={inputClass}
                                placeholder={t("common.fields.phone")}
                                maxLength={30}
                                value={contact.phone}
                                onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                            />
                            <input
                                className={inputClass}
                                placeholder={t("common.fields.email")}
                                type="email"
                                maxLength={150}
                                value={contact.email}
                                onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                            />
                        </div>
                        <select className={inputClass} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            {PAYMENT_METHODS.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {t(`common.paymentMethods.${m.value}`)}
                                </option>
                            ))}
                        </select>
                        <FormAlert>{formError}</FormAlert>
                        <AddToTripCartButton
                            itemType="tour"
                            disabled={notEnough || !date}
                            build={() => {
                                if (!contact.name.trim()) throw new Error(t("tours.booking.contactNameRequired"));
                                return {
                                    tourId: id,
                                    departureDate: date,
                                    numAdults: adults,
                                    numChildren: children,
                                    contactName: contact.name.trim(),
                                    contactPhone: contact.phone.trim() || null,
                                    contactEmail: contact.email.trim() || null,
                                    specialRequests: contact.requests.trim() || null,
                                };
                            }}
                        />
                    </BookingSummaryCard>
                </div>
            </div>
        </main>
    );
}

export default TourDetail;
