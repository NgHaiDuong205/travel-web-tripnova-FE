import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import BookingSummaryCard from "../../../components/catalog/BookingSummaryCard";
import DetailBackLink from "../../../components/catalog/DetailBackLink";
import InfoRow from "../../../components/catalog/InfoRow";
import SpecTile from "../../../components/catalog/SpecTile";
import FormAlert from "../../../components/common/FormAlert";
import FavoriteButton from "../../../components/common/FavoriteButton";
import AddToTripCartButton from "../../../components/catalog/AddToTripCartButton";
import ReviewSection from "../../../components/client/ReviewSection";
import useTrackView from "../../../hooks/useTrackView";
import PendingOrderNotice, { usePendingOrders } from "../../../components/catalog/PendingOrderNotice";
import { PAYMENT_METHODS } from "../../../services/bookingService";
import {
    CAR_TYPE_LABELS,
    cancelCarBooking,
    createCarBooking,
    fetchCar,
    fetchCarAvailability,
    fetchMyCarBookings,
} from "../../../services/carService";
import { formatDateTime, formatMoney } from "../../../utils/formatters";
import { localDateTimeFromToday, rentalDaysBetween, withSeconds } from "../../../utils/dateTime";
import { useT } from "../../../i18n/I18nContext";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&q=80";
const FREE_CANCELLATION_HOURS = 48;
const inputClass =
    "w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-fixed-dim";
/** Chi tiết xe + khung đặt xe (theo CAR_DETAIL.HTML). Đặt xong chuyển tới trang thanh toán chung /trip-payment/:id. */
function CarDetail() {
    const t = useT();
    const { id } = useParams();
    useTrackView("car", id);
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn } = useAuth();
    const [car, setCar] = useState(null);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        pickup: params.get("pickup") || localDateTimeFromToday(1),
        dropoff: params.get("dropoff") || localDateTimeFromToday(4),
        driverLicenseNo: "",
        pickupLocation: "",
        specialRequests: "",
        paymentMethod: PAYMENT_METHODS[0]?.value || "credit_card",
    });
    const [availability, setAvailability] = useState(null);
    const [checking, setChecking] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [availabilityNonce, setAvailabilityNonce] = useState(0); // tăng để kiểm tra lại xe trống (sau khi huỷ đơn)
    // Đơn thuê xe này đã đặt nhưng chưa thanh toán (VD bấm Back từ trang thanh toán)
    const { orders: pendingOrders, reload: reloadPending } = usePendingOrders(fetchMyCarBookings, (b) => b.carId === id, id);

    useEffect(() => {
        fetchCar(id)
            .then(setCar)
            .catch((err) => setError(err.status === 404 ? t("cars.errors.noLongerAvailable") : err.message));
    }, [id, t]);

    const validPeriod = form.pickup && form.dropoff && form.dropoff > form.pickup;

    // Kiểm tra xe trống mỗi khi đổi thời gian (trễ 300ms để không gọi liên tục khi đang gõ).
    useEffect(() => {
        if (!car || !validPeriod) {
            setAvailability(null);
            return undefined;
        }
        let cancelled = false;
        setChecking(true);
        const timer = setTimeout(() => {
            fetchCarAvailability(id, withSeconds(form.pickup), withSeconds(form.dropoff))
                .then((data) => !cancelled && setAvailability(data))
                .catch(() => !cancelled && setAvailability(null))
                .finally(() => !cancelled && setChecking(false));
        }, 300);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [car, id, form.pickup, form.dropoff, validPeriod, availabilityNonce]);

    const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

    const handleRent = async () => {
        if (!isLoggedIn) {
            const back = `${location.pathname}?${new URLSearchParams({ pickup: form.pickup, dropoff: form.dropoff })}`;
            navigate(`/login?redirect=${encodeURIComponent(back)}`);
            return;
        }
        if (!car.withDriver && !form.driverLicenseNo.trim()) {
            setFormError(t("cars.validation.driverLicense"));
            return;
        }
        setSubmitting(true);
        setFormError("");
        try {
            const booking = await createCarBooking({
                carId: car.id,
                pickupDate: withSeconds(form.pickup),
                returnDate: withSeconds(form.dropoff),
                pickupLocation: form.pickupLocation.trim() || null,
                driverLicenseNo: form.driverLicenseNo.trim() || null,
                specialRequests: form.specialRequests.trim() || null,
                paymentMethod: form.paymentMethod,
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
                <DetailBackLink to="/cars" label={t("cars.detail.backToList")} />
                <FormAlert>{error}</FormAlert>
            </main>
        );
    }
    if (!car) {
        return (
            <main className="max-w-7xl mx-auto px-8 py-8 animate-pulse">
                <div className="h-6 w-40 bg-surface-container-high rounded mb-8" />
                <div className="aspect-[16/9] md:aspect-[21/9] bg-surface-container-high rounded-xl mb-12" />
                <div className="h-12 w-1/2 bg-surface-container-high rounded" />
            </main>
        );
    }

    const days = validPeriod ? rentalDaysBetween(form.pickup, form.dropoff) : 0;
    const total = availability?.totalPrice ?? Number(car.pricePerDay) * days;
    const unavailable = availability && !availability.available;
    const tooLong = days > 30;
    const periodError = !validPeriod ? t("cars.validation.dropoffAfterPickup") : tooLong ? t("cars.validation.maximumRental") : "";

    return (
        <main className="max-w-7xl mx-auto px-8 py-8">
            <DetailBackLink to="/cars" label={t("cars.detail.backToList")} />

            <PendingOrderNotice
                orders={pendingOrders}
                describe={(bookings) =>
                    bookings.map((b) => `${formatDateTime(b.pickupDate)} → ${formatDateTime(b.returnDate)}`).join("; ")
                }
                onCancel={(bookings) => cancelCarBooking(bookings[0].id, "Cancelled by customer before payment")}
                onChanged={() => {
                    reloadPending();
                    setAvailabilityNonce((n) => n + 1);
                }}
            />

            {/* Hero */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-16">
                <div className="md:col-span-8 group overflow-hidden rounded-xl bg-surface-container-low aspect-[16/9]">
                    <img
                        alt={car.name}
                        src={car.coverImageUrl || PLACEHOLDER_IMAGE}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                </div>
                <div className="md:col-span-4 flex flex-col gap-4">
                    <div className="flex-1 rounded-xl editorial-gradient text-white p-8 flex flex-col justify-between">
                        <span className="material-symbols-outlined text-4xl">{car.withDriver ? "person_pin" : "key"}</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">{t("cars.detail.rentalMode")}</p>
                            <p className="font-headline text-2xl font-bold">
                                {car.withDriver ? t("cars.detail.chauffeurIncluded") : t("cars.detail.selfDrive")}
                            </p>
                        </div>
                    </div>
                    <div className="flex-1 rounded-xl bg-surface-container-low p-8 flex flex-col justify-between">
                        <span className="material-symbols-outlined text-4xl text-primary">location_on</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                                {t("cars.detail.basedIn")}
                            </p>
                            <p className="font-headline text-2xl font-bold text-on-surface">
                                {[car.destinationName, car.countryName].filter(Boolean).join(", ") || t("cars.detail.askOurTeam")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-12">
                    <header>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[10px] px-2 py-1 rounded font-bold tracking-widest uppercase">
                                {t(`cars.types.${car.carType}`, { defaultValue: CAR_TYPE_LABELS[car.carType] || car.carType })}
                            </span>
                            {[car.brand, car.model].some(Boolean) && (
                                <span className="text-sm font-medium text-on-surface-variant">
                                    {[car.brand, car.model].filter(Boolean).join(" ")}
                                </span>
                            )}
                        </div>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <h1 className="text-5xl font-extrabold text-on-surface font-headline tracking-tighter leading-tight">
                                {car.name}
                            </h1>
                            <FavoriteButton itemType="car" itemId={car.id} className="shrink-0 mt-2" />
                        </div>
                        {car.description && (
                            <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed whitespace-pre-line">
                                {car.description}
                            </p>
                        )}
                    </header>

                    <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <SpecTile icon="settings_input_component" label={t("cars.detail.transmission")} value={t(`cars.transmission.${car.transmission}`, { defaultValue: car.transmission || "—" })} />
                        <SpecTile icon="chair" label={t("cars.detail.capacity")} value={t("cars.card.seats", { count: car.seats })} />
                        <SpecTile icon="ev_station" label={t("cars.detail.fuelType")} value={t(`cars.fuelType.${car.fuelType}`, { defaultValue: car.fuelType || "—" })} />
                        <SpecTile
                            icon={car.withDriver ? "person" : "badge"}
                            label={t("cars.detail.driver")}
                            value={car.withDriver ? t("cars.detail.included") : t("cars.detail.selfDrive")}
                        />
                    </section>

                    <section className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold font-headline mb-4 text-primary">{t("cars.detail.pickupDropoff")}</h3>
                            <div className="space-y-4">
                                <InfoRow icon="location_on" title={car.pickupLocation || t("cars.detail.pickupPointAfterBooking")}>
                                    {car.withDriver
                                        ? t("cars.detail.driverPickupInfo")
                                        : t("cars.detail.selfDrivePickupInfo")}
                                </InfoRow>
                                <InfoRow icon="schedule" title={t("cars.detail.billedPer24Hours")}>
                                    {t("cars.detail.rentalDaysInfo")}
                                </InfoRow>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-headline mb-4 text-primary">{t("cars.detail.cancellation")}</h3>
                            <div className="bg-surface-container-low rounded-xl p-6 border-l-4 border-primary">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-on-surface">{t("cars.detail.freeCancellation")}</span>
                                    <span className="text-xs font-bold text-primary">{t("cars.detail.fullRefund")}</span>
                                </div>
                                <p className="text-on-surface-variant text-sm leading-relaxed">
                                    {t("cars.detail.cancellationInfo", { hours: FREE_CANCELLATION_HOURS })}
                                </p>
                            </div>
                        </div>
                    </section>

                    <ReviewSection entityType="car" entityId={car.id} title={t("cars.detail.renterReviews")} />
                </div>

                <BookingSummaryCard
                    eyebrow={t("cars.detail.rentalPrice")}
                    price={formatMoney(car.pricePerDay, car.currencyCode)}
                    priceSuffix={t("common.units.perDay")}
                    rows={
                        days > 0
                            ? [
                                  {
                                      label: t("cars.detail.rentalDays", { count: days }),
                                      value: formatMoney(total, car.currencyCode),
                                  },
                              ]
                            : []
                    }
                    total={days > 0 ? formatMoney(total, car.currencyCode) : null}
                    ctaLabel={unavailable ? t("cars.detail.notAvailable") : t("cars.actions.rentNow")}
                    ctaDisabled={Boolean(periodError) || unavailable || checking}
                    ctaBusy={submitting}
                    onCta={handleRent}
                    footnote={t("cars.detail.freeCancellationUntil", { hours: FREE_CANCELLATION_HOURS })}
                    footnoteIcon="flash_on"
                >
                    <label className="block">
                        <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">
                            {t("cars.search.pickup")}
                        </span>
                        <input type="datetime-local" className={inputClass} value={form.pickup} onChange={set("pickup")} />
                    </label>
                    <label className="block">
                        <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">
                            {t("cars.search.dropoff")}
                        </span>
                        <input
                            type="datetime-local"
                            className={inputClass}
                            min={form.pickup}
                            value={form.dropoff}
                            onChange={set("dropoff")}
                        />
                    </label>
                    {!car.withDriver && (
                        <label className="block">
                            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">
                                {t("cars.detail.driverLicenseNumber")}
                            </span>
                            <input
                                className={inputClass}
                                maxLength={50}
                                value={form.driverLicenseNo}
                                onChange={set("driverLicenseNo")}
                            />
                        </label>
                    )}
                    <label className="block">
                        <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">
                            {t("cars.detail.pickupAddressOptional")}
                        </span>
                        <input
                            className={inputClass}
                            maxLength={500}
                            placeholder={car.pickupLocation || t("cars.detail.pickupAddressPlaceholder")}
                            value={form.pickupLocation}
                            onChange={set("pickupLocation")}
                        />
                    </label>
                    <label className="block">
                        <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">
                            {t("cars.detail.payment")}
                        </span>
                        <select className={inputClass} value={form.paymentMethod} onChange={set("paymentMethod")}>
                            {PAYMENT_METHODS.map((method) => (
                                <option key={method.value} value={method.value}>
                                    {t(`common.paymentMethods.${method.value}`, { defaultValue: method.label })}
                                </option>
                            ))}
                        </select>
                    </label>
                    {periodError && <p className="text-xs font-bold text-error">{periodError}</p>}
                    {checking && !periodError && <p className="text-xs text-on-surface-variant">{t("cars.detail.checkingAvailability")}</p>}
                    {unavailable && (
                        <div className="text-xs text-error space-y-1">
                            <p className="font-bold">{t("cars.detail.alreadyBookedDuring")}</p>
                            {availability.busyRanges.map((r) => (
                                <p key={r.from}>
                                    {formatDateTime(r.from)} → {formatDateTime(r.to)}
                                </p>
                            ))}
                        </div>
                    )}
                    {availability?.available && !checking && (
                        <p className="text-xs font-bold text-green-700 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            {t("cars.detail.availableForDates")}
                        </p>
                    )}
                    <FormAlert>{formError}</FormAlert>
                    <AddToTripCartButton
                        itemType="car"
                        disabled={Boolean(periodError) || unavailable || checking}
                        build={() => {
                            if (!car.withDriver && !form.driverLicenseNo.trim())
                                throw new Error(t("cars.validation.driverLicense"));
                            return {
                                carId: car.id,
                                pickupDate: withSeconds(form.pickup),
                                returnDate: withSeconds(form.dropoff),
                                pickupLocation: form.pickupLocation.trim() || null,
                                driverLicenseNo: form.driverLicenseNo.trim() || null,
                                specialRequests: form.specialRequests.trim() || null,
                            };
                        }}
                    />
                </BookingSummaryCard>
            </div>
        </main>
    );
}

export default CarDetail;
