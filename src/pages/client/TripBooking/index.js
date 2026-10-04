import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import StatusBadge from "../../../components/common/StatusBadge";
import { useI18n } from "../../../i18n/I18nContext";
import { PAYMENT_METHODS } from "../../../services/bookingService";
import {
    cancelTripBooking,
    createTripBooking,
    fetchTripBooking,
    fetchTripQuote,
    payTripBooking,
} from "../../../services/plannerService";
import { formatDate, formatDateTime, formatMoney } from "../../../utils/formatters";

/** Số ngày tính tiền thuê xe — khớp CarBookingServiceImpl.rentalDays: làm tròn lên theo từng 24 giờ, tối thiểu 1. */
function rentalDays(pickup, dropOff) {
    const minutes = (new Date(dropOff) - new Date(pickup)) / 60000;
    return Number.isFinite(minutes) && minutes > 0 ? Math.max(1, Math.ceil(minutes / 1440)) : 0;
}

/** "2026-10-24T08:00:00" → giá trị cho input datetime-local. */
const toInput = (value) => (value ? value.slice(0, 16) : "");
const hhmm = (value) => (value ? value.slice(0, 5) : "");

const card = "rounded-2xl bg-white border border-outline-variant/20 shadow-sm";
const inputClass = "w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20";

/**
 * Đặt trọn gói từ lịch trình: chọn hạng phòng + xe → giữ chỗ (BE tạo order khách sạn + order xe trong một transaction)
 * → thanh toán một lần cho mọi order → hoàn tất (hoá đơn từng order, lịch trình "booked").
 */
function TripBooking() {
    const { t } = useI18n();
    const { itineraryId } = useParams();
    const [quote, setQuote] = useState(null);
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        try {
            const [q, b] = await Promise.all([fetchTripQuote(itineraryId), fetchTripBooking(itineraryId)]);
            setQuote(q);
            setBooking(b);
        } catch (err) {
            setError(err.message);
        }
    }, [itineraryId]);

    useEffect(() => {
        load();
    }, [load]);

    const run = async (action) => {
        setBusy(true);
        setError("");
        try {
            const next = await action();
            // Lượt đặt vừa bị huỷ (huỷ tay / thanh toán lỗi) → báo giá lại để tình trạng phòng & xe là mới nhất.
            if (next.state === "cancelled") setQuote(await fetchTripQuote(itineraryId));
            setBooking(next);
        } catch (err) {
            setError(err.message);
            // 409: đã có lượt đặt khác (tab khác) → hiện lượt đó.
            if (err.status === 409) {
                const latest = await fetchTripBooking(itineraryId).catch(() => null);
                if (latest) setBooking(latest);
            }
        } finally {
            setBusy(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    if (!quote || !booking) {
        return (
            <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-10">
                {error ? <FormAlert>{error}</FormAlert> : <div className="h-64 rounded-2xl bg-surface-container-high animate-pulse" />}
                <Link to={`/itineraries/${itineraryId}`} className="inline-block mt-6 text-primary font-bold text-sm">{t("planner.booking.backToItinerary")}</Link>
            </main>
        );
    }

    const step = booking.state === "pending" ? 2 : booking.state === "paid" || booking.state === "partial" ? 3 : 1;

    return (
        <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
            <Link to={`/itineraries/${itineraryId}`} className="text-primary font-bold text-sm">← {t("planner.booking.backToItinerary")}</Link>
            <header className="mt-3 mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t("planner.booking.eyebrow")}</p>
                <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">{quote.itineraryTitle}</h1>
                <p className="mt-1 text-sm text-on-surface-variant flex flex-wrap gap-x-5">
                    <span>{quote.destinationName}</span>
                    <span>{formatDate(quote.startDate)} – {formatDate(quote.endDate)}</span>
                    <span>{t("planner.result.travellers", { count: quote.partySize })}</span>
                </p>
            </header>
            <Stepper step={step} />
            {error && <div className="mb-6"><FormAlert>{error}</FormAlert></div>}

            {step === 1 && (
                <SelectStep
                    quote={quote}
                    lastState={booking.state}
                    busy={busy}
                    onSubmit={(body) => run(() => createTripBooking(itineraryId, body))}
                />
            )}
            {step === 2 && (
                <PayStep
                    booking={booking}
                    quote={quote}
                    busy={busy}
                    onPay={(success) => run(() => payTripBooking(itineraryId, success))}
                    onCancel={() => run(() => cancelTripBooking(itineraryId))}
                    onExpired={load}
                />
            )}
            {step === 3 && <DoneStep booking={booking} itineraryId={itineraryId} />}
        </main>
    );
}

function Stepper({ step }) {
    const { t } = useI18n();
    const steps = ["planner.booking.steps.select", "planner.booking.steps.pay", "planner.booking.steps.done"];
    return (
        <ol className="mb-8 grid grid-cols-3 gap-2" aria-label={t("planner.booking.steps.label")}>
            {steps.map((key, i) => {
                const n = i + 1;
                const state = n < step ? "done" : n === step ? "current" : "todo";
                return (
                    <li key={key} aria-current={state === "current" ? "step" : undefined}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${state === "current" ? "bg-primary text-white" : state === "done" ? "bg-green-50 text-green-700" : "bg-surface-container-low text-on-surface-variant"}`}>
                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{state === "done" ? "check_circle" : ["hotel", "payments", "verified"][i]}</span>
                        <span className="truncate">{t(key)}</span>
                    </li>
                );
            })}
        </ol>
    );
}

// ================================================================== bước 1: chọn dịch vụ

function SelectStep({ quote, lastState, busy, onSubmit }) {
    const { t } = useI18n();
    const hotel = quote.hotel;
    const recommendedRoom = hotel?.roomOptions.find((r) => r.roomTypeId === hotel.recommendedRoomTypeId) || null;
    const [includeHotel, setIncludeHotel] = useState(Boolean(recommendedRoom));
    const [roomTypeId, setRoomTypeId] = useState(recommendedRoom?.roomTypeId || null);
    const [roomQuantity, setRoomQuantity] = useState(recommendedRoom?.roomsNeeded || 1);
    const [specialRequests, setSpecialRequests] = useState("");
    const [includeCar, setIncludeCar] = useState(Boolean(quote.recommendedCarId));
    const [carId, setCarId] = useState(quote.recommendedCarId);
    const [pickupDate, setPickupDate] = useState(toInput(quote.carPickupDate));
    const [returnDate, setReturnDate] = useState(toInput(quote.carReturnDate));
    const [pickupMode, setPickupMode] = useState(hotel ? "hotel" : "office");
    const [customPickup, setCustomPickup] = useState("");
    const [driverLicenseNo, setDriverLicenseNo] = useState("");
    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);
    const [acceptTerms, setAcceptTerms] = useState(false);

    const room = hotel?.roomOptions.find((r) => r.roomTypeId === roomTypeId) || null;
    const car = quote.cars.find((c) => c.carId === carId) || null;
    const days = car ? rentalDays(pickupDate, returnDate) : 0;
    const hotelAmount = includeHotel && room ? Number(room.pricePerNight) * hotel.nights * roomQuantity : 0;
    const carAmount = includeCar && car ? Number(car.pricePerDay) * days : 0;
    const total = hotelAmount + carAmount;
    const maxRooms = room ? Math.min(quote.partySize, room.availableRooms) : 1;
    const pickupLocation = pickupMode === "hotel" && hotel ? `${hotel.name}${hotel.address ? ` – ${hotel.address}` : ""}`
        : pickupMode === "custom" ? customPickup.trim() : car?.pickupLocation || "";
    const tripStart = `${quote.startDate}T00:00`;
    const tripEnd = `${quote.endDate}T23:59`;
    const carTimeError = includeCar && car && (!pickupDate || !returnDate || returnDate <= pickupDate
        || pickupDate < tripStart || returnDate > tripEnd) ? t("planner.booking.car.timeInvalid") : "";
    const needsLicense = includeCar && car && !car.withDriver;
    const nothing = !(includeHotel && room) && !(includeCar && car);
    const canSubmit = !busy && acceptTerms && !nothing && !carTimeError && (!needsLicense || driverLicenseNo.trim())
        && (pickupMode !== "custom" || !includeCar || customPickup.trim());

    const pickRoom = (option) => {
        setRoomTypeId(option.roomTypeId);
        setRoomQuantity(option.roomsNeeded);
    };

    const submit = (e) => {
        e.preventDefault();
        onSubmit({
            hotelId: includeHotel && room ? hotel.hotelId : null,
            roomTypeId: includeHotel && room ? room.roomTypeId : null,
            roomQuantity: includeHotel && room ? roomQuantity : null,
            specialRequests: includeHotel && specialRequests.trim() ? specialRequests.trim() : null,
            carId: includeCar && car ? car.carId : null,
            pickupDate: includeCar && car ? `${pickupDate}:00` : null,
            returnDate: includeCar && car ? `${returnDate}:00` : null,
            pickupLocation: includeCar && car ? pickupLocation : null,
            returnLocation: includeCar && car ? pickupLocation : null,
            driverLicenseNo: needsLicense ? driverLicenseNo.trim() : null,
            paymentMethod,
            acceptTerms,
        });
    };

    return (
        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
                {(lastState === "cancelled") && (
                    <p className="rounded-xl bg-amber-50 text-amber-800 px-4 py-3 text-sm">{t("planner.booking.previousCancelled")}</p>
                )}

                {/* Khách sạn */}
                <section className={`${card} p-5`}>
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
                            <span aria-hidden="true" className="material-symbols-outlined text-primary">hotel</span>{t("planner.booking.hotel.title")}
                        </h2>
                        {hotel && recommendedRoom && (
                            <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                                <input type="checkbox" checked={includeHotel} onChange={(e) => setIncludeHotel(e.target.checked)} className="rounded border-outline-variant" />
                                {t("planner.booking.include")}
                            </label>
                        )}
                    </div>
                    {!hotel || !recommendedRoom ? (
                        <p className="text-sm text-on-surface-variant">{t(`planner.booking.hotel.unavailable.${quote.hotelUnavailableReason || "sold_out"}`)}</p>
                    ) : (
                        <div className={includeHotel ? "" : "opacity-50 pointer-events-none"}>
                            <div className="flex gap-4">
                                {hotel.coverImageUrl && <img src={hotel.coverImageUrl} alt="" className="w-28 h-24 rounded-xl object-cover shrink-0" />}
                                <div className="min-w-0 text-sm">
                                    <p className="font-headline font-bold text-lg text-on-surface">{hotel.name}</p>
                                    {hotel.starRating > 0 && <p className="text-amber-500">{"★".repeat(hotel.starRating)}</p>}
                                    {hotel.address && <p className="text-on-surface-variant">{hotel.address}</p>}
                                </div>
                            </div>
                            <dl className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <Fact label={t("planner.booking.hotel.checkIn")} value={`${formatDate(hotel.checkIn)} · ${hhmm(hotel.checkInTime) || "14:00"}`} />
                                <Fact label={t("planner.booking.hotel.checkOut")} value={`${formatDate(hotel.checkOut)} · ${hhmm(hotel.checkOutTime) || "12:00"}`} />
                                <Fact label={t("planner.booking.hotel.nights")} value={t("planner.booking.hotel.nightsValue", { count: hotel.nights })} />
                                <Fact label={t("planner.booking.hotel.breakfast")} value={t(hotel.breakfastIncluded ? "planner.booking.hotel.breakfastYes" : "planner.booking.hotel.breakfastNo")} />
                            </dl>
                            <PolicyNote
                                until={hotel.freeCancellationUntil}
                                text={hotel.freeCancellationUntil
                                    ? t("planner.booking.hotel.freeCancel", { date: formatDateTime(hotel.freeCancellationUntil), hours: hotel.cancellationHours })
                                    : t("planner.booking.hotel.noFreeCancel")}
                            />

                            <h3 className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t("planner.booking.hotel.roomType")}</h3>
                            <ul className="space-y-2" role="radiogroup">
                                {hotel.roomOptions.map((option) => {
                                    const selected = option.roomTypeId === roomTypeId;
                                    return (
                                        <li key={option.roomTypeId}>
                                            <label className={`flex items-center gap-3 rounded-xl border p-3 ${!option.feasible ? "opacity-50" : "cursor-pointer"} ${selected ? "border-primary bg-primary/5" : "border-outline-variant/40 hover:border-primary/60"}`}>
                                                <input type="radio" name="roomType" disabled={!option.feasible} checked={selected} onChange={() => pickRoom(option)} />
                                                <div className="min-w-0 flex-1 text-sm">
                                                    <p className="font-semibold text-on-surface">{option.name}</p>
                                                    <p className="text-xs text-on-surface-variant">
                                                        {[option.bedType, t("planner.booking.hotel.capacity", { count: option.maxOccupancy }), option.areaSqm ? `${option.areaSqm} m²` : null].filter(Boolean).join(" · ")}
                                                    </p>
                                                    <p className={`text-xs ${option.feasible ? "text-green-700" : "text-error"}`}>
                                                        {option.feasible
                                                            ? t("planner.booking.hotel.roomsLeft", { count: option.availableRooms })
                                                            : t("planner.booking.hotel.notEnough", { needed: option.roomsNeeded, count: option.availableRooms })}
                                                    </p>
                                                </div>
                                                <div className="text-right text-sm shrink-0">
                                                    <p className="font-bold text-on-surface">{t("planner.result.perNight", { price: formatMoney(option.pricePerNight, "USD") })}</p>
                                                    <p className="text-xs text-on-surface-variant">{t("planner.booking.hotel.minRooms", { count: option.roomsNeeded })}</p>
                                                </div>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                            {room && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <label className="block text-sm">
                                        <span className="block text-xs font-bold text-on-surface-variant mb-1">{t("planner.booking.hotel.quantity")}</span>
                                        <input type="number" min={room.roomsNeeded} max={maxRooms} value={roomQuantity}
                                               onChange={(e) => setRoomQuantity(Math.min(maxRooms, Math.max(room.roomsNeeded, Number(e.target.value) || room.roomsNeeded)))}
                                               className={inputClass} />
                                    </label>
                                    <label className="block text-sm md:col-span-2">
                                        <span className="block text-xs font-bold text-on-surface-variant mb-1">{t("planner.booking.hotel.specialRequests")}</span>
                                        <input type="text" maxLength={500} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)}
                                               placeholder={t("planner.booking.hotel.specialPlaceholder")} className={inputClass} />
                                    </label>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Xe */}
                <section className={`${card} p-5`}>
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
                            <span aria-hidden="true" className="material-symbols-outlined text-primary">directions_car</span>{t("planner.booking.car.title")}
                        </h2>
                        {quote.cars.length > 0 && (
                            <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                                <input type="checkbox" checked={includeCar} onChange={(e) => setIncludeCar(e.target.checked)} className="rounded border-outline-variant" />
                                {t("planner.booking.include")}
                            </label>
                        )}
                    </div>
                    {quote.cars.length === 0 ? (
                        <p className="text-sm text-on-surface-variant">{t("planner.booking.car.none")}</p>
                    ) : (
                        <div className={includeCar ? "" : "opacity-50 pointer-events-none"}>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3" role="radiogroup">
                                {quote.cars.map((option) => {
                                    const usable = option.available && option.fitsParty;
                                    const selected = option.carId === carId;
                                    return (
                                        <li key={option.carId}>
                                            <label className={`flex gap-3 rounded-xl border p-3 h-full ${usable ? "cursor-pointer" : "opacity-50"} ${selected ? "border-primary bg-primary/5" : "border-outline-variant/40 hover:border-primary/60"}`}>
                                                <input type="radio" name="car" disabled={!usable} checked={selected} onChange={() => setCarId(option.carId)} className="mt-1" />
                                                {option.coverImageUrl && <img src={option.coverImageUrl} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />}
                                                <div className="min-w-0 text-sm">
                                                    <p className="font-semibold text-on-surface">{option.name}</p>
                                                    <p className="text-xs text-on-surface-variant">
                                                        {t("planner.booking.car.seats", { count: option.seats })} · {option.transmission} · {option.fuelType}
                                                    </p>
                                                    <p className={`text-xs font-semibold ${option.withDriver ? "text-green-700" : "text-on-surface-variant"}`}>
                                                        {t(option.withDriver ? "planner.booking.car.withDriver" : "planner.booking.car.selfDrive")}
                                                    </p>
                                                    <p className="mt-1 font-bold text-on-surface">{t("planner.booking.car.perDay", { price: formatMoney(option.pricePerDay, "USD") })}</p>
                                                    {!option.available && <p className="text-xs text-error">{t("planner.booking.car.busy")}</p>}
                                                    {option.available && !option.fitsParty && <p className="text-xs text-error">{t("planner.booking.car.tooSmall")}</p>}
                                                </div>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                            {car && (
                                <div className="mt-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="block text-sm">
                                            <span className="block text-xs font-bold text-on-surface-variant mb-1">{t("planner.booking.car.pickupAt")}</span>
                                            <input type="datetime-local" value={pickupDate} min={toInput(quote.carPickupDate)} max={tripEnd} onChange={(e) => setPickupDate(e.target.value)} className={inputClass} />
                                        </label>
                                        <label className="block text-sm">
                                            <span className="block text-xs font-bold text-on-surface-variant mb-1">{t("planner.booking.car.returnAt")}</span>
                                            <input type="datetime-local" value={returnDate} min={pickupDate} max={tripEnd} onChange={(e) => setReturnDate(e.target.value)} className={inputClass} />
                                        </label>
                                    </div>
                                    {carTimeError && <p className="text-sm text-error">{carTimeError}</p>}
                                    <fieldset>
                                        <legend className="text-xs font-bold text-on-surface-variant mb-1">{t("planner.booking.car.pickupPlace")}</legend>
                                        <div className="flex flex-col gap-2 text-sm">
                                            {hotel && (
                                                <label className="flex items-center gap-2"><input type="radio" name="pickupMode" checked={pickupMode === "hotel"} onChange={() => setPickupMode("hotel")} />{t("planner.booking.car.atHotel", { hotel: hotel.name })}</label>
                                            )}
                                            <label className="flex items-center gap-2"><input type="radio" name="pickupMode" checked={pickupMode === "office"} onChange={() => setPickupMode("office")} />{t("planner.booking.car.atOffice", { place: car.pickupLocation })}</label>
                                            <label className="flex items-center gap-2"><input type="radio" name="pickupMode" checked={pickupMode === "custom"} onChange={() => setPickupMode("custom")} />{t("planner.booking.car.atCustom")}</label>
                                            {pickupMode === "custom" && (
                                                <input type="text" maxLength={255} value={customPickup} onChange={(e) => setCustomPickup(e.target.value)} placeholder={t("planner.booking.car.customPlaceholder")} className={inputClass} />
                                            )}
                                        </div>
                                    </fieldset>
                                    {needsLicense && (
                                        <label className="block text-sm max-w-sm">
                                            <span className="block text-xs font-bold text-on-surface-variant mb-1">{t("planner.booking.car.license")}</span>
                                            <input type="text" maxLength={50} required value={driverLicenseNo} onChange={(e) => setDriverLicenseNo(e.target.value)} className={inputClass} />
                                        </label>
                                    )}
                                    <PolicyNote
                                        until={car.freeCancellationUntil}
                                        text={car.freeCancellationUntil
                                            ? t("planner.booking.car.freeCancel", { date: formatDateTime(car.freeCancellationUntil), hours: quote.carFreeCancellationHours })
                                            : t("planner.booking.car.noFreeCancel")}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Khách hàng + phương thức thanh toán */}
                <section className={`${card} p-5`}>
                    <h2 className="font-headline text-xl font-bold text-on-surface mb-3">{t("planner.booking.customer.title")}</h2>
                    <dl className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <Fact label={t("planner.booking.customer.name")} value={quote.customerName || "—"} />
                        <Fact label={t("planner.booking.customer.email")} value={quote.customerEmail} />
                        <Fact label={t("planner.booking.customer.phone")} value={quote.customerPhone || "—"} />
                    </dl>
                    <Link to="/profile" className="mt-2 inline-block text-xs font-bold text-primary">{t("planner.booking.customer.edit")}</Link>

                    <h3 className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t("planner.booking.payment.method")}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2" role="radiogroup">
                        {PAYMENT_METHODS.map((m) => (
                            <label key={m.value} className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-sm font-semibold cursor-pointer ${paymentMethod === m.value ? "border-primary bg-primary/5 text-primary" : "border-outline-variant/40 text-on-surface"}`}>
                                <input type="radio" name="paymentMethod" className="sr-only" checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} />
                                <span aria-hidden="true" className="material-symbols-outlined">{m.icon}</span>
                                {t(`common.paymentMethods.${m.value}`)}
                            </label>
                        ))}
                    </div>
                </section>
            </div>

            {/* Tóm tắt chi phí */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24">
                <div className={`${card} p-5`}>
                    <h2 className="font-headline text-lg font-bold text-on-surface mb-4">{t("planner.booking.summary.title")}</h2>
                    <dl className="space-y-3 text-sm">
                        {includeHotel && room && (
                            <SummaryLine
                                title={`${hotel.name} · ${room.name}`}
                                detail={t("planner.booking.summary.roomCalc", { price: formatMoney(room.pricePerNight, "USD"), nights: hotel.nights, rooms: roomQuantity })}
                                amount={hotelAmount}
                            />
                        )}
                        {includeCar && car && (
                            <SummaryLine
                                title={car.name}
                                detail={t("planner.booking.summary.carCalc", { price: formatMoney(car.pricePerDay, "USD"), days })}
                                amount={carAmount}
                            />
                        )}
                        {nothing && <p className="text-on-surface-variant">{t("planner.booking.summary.nothing")}</p>}
                        <div className="flex justify-between text-on-surface-variant border-t border-outline-variant/30 pt-3">
                            <dt>{t("planner.booking.summary.discount")}</dt><dd>{formatMoney(0, "USD")}</dd>
                        </div>
                        <div className="flex justify-between text-on-surface-variant">
                            <dt>{t("planner.booking.summary.tax")}</dt><dd>{formatMoney(0, "USD")}</dd>
                        </div>
                        <div className="flex justify-between text-base font-extrabold text-on-surface border-t border-outline-variant/30 pt-3">
                            <dt>{t("planner.booking.summary.payNow")}</dt><dd>{formatMoney(total, "USD")}</dd>
                        </div>
                    </dl>
                    {Number(quote.onSiteEstimate) > 0 && (
                        <p className="mt-4 rounded-xl bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
                            {t("planner.booking.summary.onSite", { amount: formatMoney(quote.onSiteEstimate, "USD") })}
                        </p>
                    )}
                    <p className="mt-3 text-xs text-on-surface-variant">{t("planner.booking.summary.hold", { minutes: quote.holdMinutes })}</p>
                    <label className="mt-4 flex items-start gap-2 text-sm text-on-surface">
                        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-0.5 rounded border-outline-variant" />
                        <span>{t("planner.booking.summary.terms")}</span>
                    </label>
                    <button type="submit" disabled={!canSubmit} className="mt-4 w-full primary-gradient text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                        <span aria-hidden="true" className="material-symbols-outlined">{busy ? "progress_activity" : "lock_clock"}</span>
                        {busy ? t("planner.booking.summary.holding") : t("planner.booking.summary.hold_button")}
                    </button>
                </div>
            </aside>
        </form>
    );
}

function Fact({ label, value }) {
    return (
        <div>
            <dt className="text-xs text-on-surface-variant">{label}</dt>
            <dd className="font-semibold text-on-surface">{value}</dd>
        </div>
    );
}

function PolicyNote({ until, text }) {
    return (
        <p className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-xs ${until ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">{until ? "event_available" : "info"}</span>
            {text}
        </p>
    );
}

function SummaryLine({ title, detail, amount }) {
    return (
        <div className="flex justify-between gap-3">
            <div className="min-w-0">
                <dt className="font-semibold text-on-surface">{title}</dt>
                <dd className="text-xs text-on-surface-variant">{detail}</dd>
            </div>
            <dd className="font-semibold text-on-surface whitespace-nowrap">{formatMoney(amount, "USD")}</dd>
        </div>
    );
}

// ================================================================== bước 2: thanh toán

function useCountdown(until) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);
    return until ? Math.max(0, Math.floor((new Date(until).getTime() - now) / 1000)) : 0;
}

function OrderCard({ order }) {
    const { t } = useI18n();
    const statusLabels = useMemo(() => ({
        pending: { label: t("common.status.pending"), className: "bg-amber-50 text-amber-700 border-amber-200" },
        paid: { label: t("common.status.paid"), className: "bg-green-50 text-green-700 border-green-200" },
        partially_refunded: { label: t("common.status.partially_refunded"), className: "bg-purple-50 text-purple-700 border-purple-200" },
        refunded: { label: t("common.status.refunded"), className: "bg-purple-50 text-purple-700 border-purple-200" },
        cancelled: { label: t("common.status.cancelled"), className: "bg-gray-50 text-gray-700 border-gray-200" },
    }), [t]);
    return (
        <article className={`${card} p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-primary">{order.bookingType === "hotel" ? "hotel" : "directions_car"}</span>
                    {t(`planner.booking.order.${order.bookingType}`)} · <span className="font-mono text-sm">{order.orderCode}</span>
                </h3>
                <StatusBadge status={order.orderStatus} labels={statusLabels} />
            </div>
            <ul className="mt-3 space-y-2 text-sm">
                {order.lines.map((line) => (
                    <li key={`${line.title}-${line.subtitle}`} className="flex justify-between gap-3">
                        <div className="min-w-0">
                            <p className="font-semibold text-on-surface">{line.title}{line.subtitle ? ` · ${line.subtitle}` : ""}</p>
                            <p className="text-xs text-on-surface-variant">
                                {formatDateTime(line.startAt)} → {formatDateTime(line.endAt)} · {order.bookingType === "hotel"
                                    ? t("planner.booking.summary.roomCalc", { price: formatMoney(line.unitPrice, "USD"), nights: line.units, rooms: line.quantity })
                                    : t("planner.booking.summary.carCalc", { price: formatMoney(line.unitPrice, "USD"), days: line.units })}
                            </p>
                        </div>
                        <span className="font-semibold whitespace-nowrap">{formatMoney(line.amount, "USD")}</span>
                    </li>
                ))}
            </ul>
            <dl className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs border-t border-outline-variant/30 pt-3">
                <Fact label={t("planner.booking.order.method")} value={order.paymentMethod ? t(`common.paymentMethods.${order.paymentMethod}`, { defaultValue: order.paymentMethod }) : "—"} />
                <Fact label={t("planner.booking.order.payment")} value={t(`common.status.${order.paymentStatus}`, { defaultValue: order.paymentStatus })} />
                <Fact label={t("planner.booking.order.transaction")} value={order.transactionId || "—"} />
                <Fact label={t("planner.booking.order.amount")} value={formatMoney(order.amount, "USD")} />
            </dl>
        </article>
    );
}

function PayStep({ booking, quote, busy, onPay, onCancel, onExpired }) {
    const { t } = useI18n();
    const seconds = useCountdown(booking.holdExpiresAt);
    const expired = booking.holdExpiresAt && seconds === 0;
    useEffect(() => {
        if (!expired) return undefined;
        // BE huỷ đơn quá hạn mỗi phút → đợi một lúc rồi tải lại trạng thái.
        const timer = setTimeout(onExpired, 65000);
        return () => clearTimeout(timer);
    }, [expired, onExpired]);
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-4">
                <p className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${expired ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`} role="timer">
                    <span aria-hidden="true" className="material-symbols-outlined">timer</span>
                    {expired ? t("planner.booking.pay.expired") : t("planner.booking.pay.holdFor", { time: `${mm}:${ss}` })}
                </p>
                {booking.orders.map((order) => <OrderCard key={order.orderId} order={order} />)}
            </div>
            <aside className="lg:col-span-4 lg:sticky lg:top-24">
                <div className={`${card} p-5`}>
                    <h2 className="font-headline text-lg font-bold text-on-surface mb-3">{t("planner.booking.pay.title")}</h2>
                    <dl className="space-y-2 text-sm">
                        {booking.orders.map((o) => (
                            <div key={o.orderId} className="flex justify-between">
                                <dt className="text-on-surface-variant">{t(`planner.booking.order.${o.bookingType}`)} · {o.orderCode}</dt>
                                <dd className="font-semibold">{formatMoney(o.amount, "USD")}</dd>
                            </div>
                        ))}
                        <div className="flex justify-between text-base font-extrabold text-on-surface border-t border-outline-variant/30 pt-3">
                            <dt>{t("planner.booking.summary.payNow")}</dt><dd>{formatMoney(booking.totalAmount, "USD")}</dd>
                        </div>
                    </dl>
                    <p className="mt-3 text-xs text-on-surface-variant">{t("planner.booking.pay.note", { count: booking.orders.length })}</p>
                    {booking.mockPaymentEnabled ? (
                        <>
                            <button type="button" disabled={busy || expired} onClick={() => onPay(true)}
                                    className="mt-4 w-full primary-gradient text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                <span aria-hidden="true" className="material-symbols-outlined">{busy ? "progress_activity" : "lock"}</span>
                                {busy ? t("planner.booking.pay.processing") : t("planner.booking.pay.payAll", { amount: formatMoney(booking.totalAmount, "USD") })}
                            </button>
                            <button type="button" disabled={busy || expired} onClick={() => onPay(false)} className="mt-2 w-full text-xs font-semibold text-on-surface-variant hover:text-error disabled:opacity-50">
                                {t("planner.booking.pay.simulateFail")}
                            </button>
                        </>
                    ) : (
                        <p className="mt-4 text-sm text-on-surface-variant">{t("planner.booking.pay.gatewayOff")}</p>
                    )}
                    <button type="button" disabled={busy || expired} onClick={() => { if (window.confirm(t("planner.booking.pay.confirmCancel"))) onCancel(); }}
                            className="mt-3 w-full rounded-xl border border-error/40 py-2.5 text-sm font-bold text-error hover:bg-error-container/10 disabled:opacity-50">
                        {t("planner.booking.pay.cancel")}
                    </button>
                    {Number(quote.onSiteEstimate) > 0 && (
                        <p className="mt-4 text-xs text-on-surface-variant">{t("planner.booking.summary.onSite", { amount: formatMoney(quote.onSiteEstimate, "USD") })}</p>
                    )}
                </div>
            </aside>
        </div>
    );
}

// ================================================================== bước 3: hoàn tất

function DoneStep({ booking, itineraryId }) {
    const { t } = useI18n();
    const partial = booking.state === "partial";
    return (
        <div className="space-y-4">
            <div className={`rounded-2xl p-6 ${partial ? "bg-amber-50 text-amber-900" : "bg-green-50 text-green-900"}`}>
                <h2 className="font-headline text-2xl font-extrabold flex items-center gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined">{partial ? "error" : "verified"}</span>
                    {t(partial ? "planner.booking.done.partialTitle" : "planner.booking.done.title")}
                </h2>
                <p className="mt-1 text-sm">{t(partial ? "planner.booking.done.partialText" : "planner.booking.done.text")}</p>
            </div>
            {booking.orders.map((order) => <OrderCard key={order.orderId} order={order} />)}
            <div className="flex flex-wrap gap-3">
                <Link to="/invoices" className="primary-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold">{t("planner.booking.done.invoices")}</Link>
                <Link to="/my-trips?tab=hotels" className="px-5 py-2.5 rounded-xl text-sm font-bold border border-outline-variant/50">{t("planner.booking.done.myTrips")}</Link>
                <Link to={`/itineraries/${itineraryId}`} className="px-5 py-2.5 rounded-xl text-sm font-bold border border-outline-variant/50">{t("planner.booking.backToItinerary")}</Link>
            </div>
        </div>
    );
}

export default TripBooking;
