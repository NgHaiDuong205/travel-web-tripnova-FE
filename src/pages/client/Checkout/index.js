import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { checkHotelAvailability, createHotelBooking, PAYMENT_METHODS } from "../../../services/bookingService";
import { addCartItem } from "../../../services/cartService";
import { fetchHotelById } from "../../../services/hotelService";
import { fetchRoomDetails } from "../../../services/roomService";
import { useAuth } from "../../../context/AuthContext";
import FormAlert from "../../../components/common/FormAlert";
import { formatDate, formatMoney, isoDateFromToday, nightsBetween } from "../../../utils/formatters";
import { useT } from "../../../i18n/I18nContext";
import HotelPendingNotice from "../../../components/client/HotelPendingNotice";

const inputClass =
    "w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#003580] focus:ring-4 focus:ring-[#003580]/10 transition-all outline-none";

function Checkout() {
    const t = useT();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const hotelId = searchParams.get("hotelId");
    const roomTypeId = searchParams.get("roomTypeId");
    const roomId = searchParams.get("roomId");

    const [form, setForm] = useState({
        checkIn: searchParams.get("checkIn") || isoDateFromToday(7),
        checkOut: searchParams.get("checkOut") || isoDateFromToday(10),
        adults: Math.max(1, Number(searchParams.get("guests")) || 1),
        children: 0,
        specialRequests: "",
        paymentMethod: "vnpay",
    });
    const [hotel, setHotel] = useState(null);
    const [room, setRoom] = useState(null);
    const [quote, setQuote] = useState(null);
    const [quoteError, setQuoteError] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [quoteNonce, setQuoteNonce] = useState(0); // tăng để lấy lại báo giá / phòng trống (sau khi huỷ đơn)

    const nights = nightsBetween(form.checkIn, form.checkOut);

    useEffect(() => {
        if (!hotelId || !roomId) return;
        fetchHotelById(hotelId).then(setHotel).catch(() => null);
        fetchRoomDetails(hotelId, roomId).then(setRoom).catch(() => null);
    }, [hotelId, roomId]);

    // Lấy báo giá + tình trạng phòng từ backend mỗi khi đổi ngày.
    useEffect(() => {
        if (!hotelId || !roomTypeId || nights <= 0) {
            setQuote(null);
            return;
        }
        let cancelled = false;
        setQuoteError("");
        checkHotelAvailability({ hotelId, roomTypeId, roomId, checkIn: form.checkIn, checkOut: form.checkOut })
            .then((data) => !cancelled && setQuote(data))
            .catch((err) => {
                if (!cancelled) {
                    setQuote(null);
                    setQuoteError(err.message);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [hotelId, roomTypeId, roomId, form.checkIn, form.checkOut, nights, quoteNonce]);

    const maxGuests = room?.maxGuests || 4;
    const roomAvailable = quote?.available ?? false;
    const canSubmit = useMemo(
        () => !!quote && (roomAvailable || quote.availableRooms > 0) && nights > 0 && !submitting,
        [quote, roomAvailable, nights, submitting]
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "adults" || name === "children" ? Number(value) : value,
        }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.adults + form.children > maxGuests) {
            setError(t("booking.checkout.validation.maxGuests", { count: maxGuests }));
            return;
        }
        setSubmitting(true);
        try {
            const result = await createHotelBooking({
                hotelId,
                roomTypeId,
                // Phòng đã chọn bị giữ bởi người khác -> để backend tự chọn phòng khác cùng loại.
                roomId: roomAvailable ? roomId : undefined,
                checkIn: form.checkIn,
                checkOut: form.checkOut,
                adults: form.adults,
                children: form.children,
                specialRequests: form.specialRequests.trim() || undefined,
                paymentMethod: form.paymentMethod,
            });
            navigate(`/payment/${result.paymentId}`, { replace: true });
        } catch (err) {
            setError(err.message || t("booking.checkout.errors.createBooking"));
        } finally {
            setSubmitting(false);
        }
    };

    // Giỏ hàng đặt theo loại phòng (không giữ phòng cụ thể), số khách là tổng cho các phòng.
    const handleAddToCart = async () => {
        if (form.adults + form.children > maxGuests) {
            setError(t("booking.checkout.validation.maxGuests", { count: maxGuests }));
            return;
        }
        setAddingToCart(true);
        setError("");
        try {
            await addCartItem({
                itemType: "hotel",
                hotelId,
                roomTypeId,
                checkIn: form.checkIn,
                checkOut: form.checkOut,
                quantity: 1,
                adults: form.adults,
                children: form.children,
                specialRequests: form.specialRequests.trim() || undefined,
            });
            navigate("/cart");
        } catch (err) {
            setError(err.message || t("booking.checkout.errors.addToCart"));
            setAddingToCart(false);
        }
    };

    if (!hotelId || !roomTypeId) {
        return (
            <div className="max-w-screen-md mx-auto px-8 pt-32 pb-24 text-center">
                <h2 className="text-2xl font-bold text-primary mb-4">{t("booking.checkout.errors.missingRoomInfo")}</h2>
                <Link to="/hotels" className="font-bold text-[#003580] hover:underline">
                    {t("booking.checkout.findHotel")}
                </Link>
            </div>
        );
    }

    return (
        <main className="max-w-screen-xl mx-auto px-8 pt-32 pb-24">
            <h1 className="text-4xl font-display font-extrabold text-primary tracking-tight mb-2">{t("booking.checkout.title")}</h1>
            <p className="text-on-surface-variant mb-10">
                {hotel?.name || t("booking.checkout.hotelFallback")} · {room?.roomTypeName || t("booking.checkout.roomFallback")}
                {room?.roomNumber ? ` · ${t("booking.checkout.roomNumber", { number: room.roomNumber })}` : ""}
            </p>

            {/* Đã đặt phòng ở khách sạn này nhưng chưa thanh toán (VD bấm Back từ trang thanh toán) */}
            <HotelPendingNotice hotelId={hotelId} onChanged={() => setQuoteNonce((n) => n + 1)} />

            <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-10" noValidate>
                <div className="col-span-12 lg:col-span-7 space-y-8">
                    <FormAlert>{error}</FormAlert>

                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-6">
                        <h2 className="text-xl font-bold text-primary">{t("booking.checkout.yourStay")}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="block text-sm font-bold text-gray-700 mb-2">{t("common.fields.checkIn")}</span>
                                <input
                                    type="date"
                                    name="checkIn"
                                    min={isoDateFromToday(0)}
                                    value={form.checkIn}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </label>
                            <label className="block">
                                <span className="block text-sm font-bold text-gray-700 mb-2">{t("common.fields.checkOut")}</span>
                                <input
                                    type="date"
                                    name="checkOut"
                                    min={form.checkIn}
                                    value={form.checkOut}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </label>
                            <label className="block">
                                <span className="block text-sm font-bold text-gray-700 mb-2">{t("common.fields.adults")}</span>
                                <select name="adults" value={form.adults} onChange={handleChange} className={inputClass}>
                                    {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="block text-sm font-bold text-gray-700 mb-2">{t("common.fields.children")}</span>
                                <select name="children" value={form.children} onChange={handleChange} className={inputClass}>
                                    {Array.from({ length: maxGuests }, (_, i) => i).map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <label className="block">
                            <span className="block text-sm font-bold text-gray-700 mb-2">{t("booking.checkout.specialRequests")}</span>
                            <textarea
                                name="specialRequests"
                                rows={3}
                                maxLength={1000}
                                value={form.specialRequests}
                                onChange={handleChange}
                                placeholder={t("booking.checkout.specialRequestsPlaceholder")}
                                className={inputClass}
                            />
                        </label>
                    </section>

                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-4">
                        <h2 className="text-xl font-bold text-primary">{t("booking.checkout.guest")}</h2>
                        <p className="text-sm text-gray-600">
                            {user?.fullName} · {user?.email}
                        </p>
                    </section>

                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-4">
                        <h2 className="text-xl font-bold text-primary">{t("common.fields.paymentMethod")}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {PAYMENT_METHODS.map((method) => (
                                <label
                                    key={method.value}
                                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                                        form.paymentMethod === method.value
                                            ? "border-[#003580] bg-blue-50"
                                            : "border-gray-200 hover:bg-gray-50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.value}
                                        checked={form.paymentMethod === method.value}
                                        onChange={handleChange}
                                        className="text-[#003580]"
                                    />
                                    <span className="material-symbols-outlined text-[#003580]">{method.icon}</span>
                                    <span className="font-bold text-sm">{t(`common.paymentMethods.${method.value}`)}</span>
                                </label>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="col-span-12 lg:col-span-5">
                    <div className="sticky top-28 bg-white rounded-xl border border-gray-100 shadow-lg p-8 space-y-5">
                        {hotel?.imageUrl && (
                            <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-40 object-cover rounded-lg" />
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{t("booking.checkout.dates")}</span>
                            <span className="font-semibold">
                                {formatDate(form.checkIn)} → {formatDate(form.checkOut)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{t("common.fields.guests")}</span>
                            <span className="font-semibold">
                                {form.children > 0 ? t("booking.checkout.guestsWithChildren", { adults: t("common.units.adult", { count: form.adults }), children: t("common.units.child", { count: form.children }) }) : t("booking.checkout.guestsSummary", { adults: t("common.units.adult", { count: form.adults }) })}
                            </span>
                        </div>
                        {quote && (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">
                                        {t("booking.checkout.nightsAtRate", { nights: t("common.units.night", { count: quote.nights }), price: formatMoney(quote.pricePerNight) })}
                                    </span>
                                    <span className="font-semibold">{formatMoney(quote.totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-primary pt-4 border-t border-gray-100">
                                    <span>{t("common.fields.total")}</span>
                                    <span>{formatMoney(quote.totalPrice)}</span>
                                </div>
                                {!roomAvailable && quote.availableRooms > 0 && (
                                    <FormAlert type="success">
                                        {t("booking.checkout.alternateRoom", { count: quote.availableRooms })}
                                    </FormAlert>
                                )}
                                {quote.availableRooms === 0 && <FormAlert>{t("booking.checkout.noRoomsAvailable")}</FormAlert>}
                            </>
                        )}
                        {nights <= 0 && <FormAlert>{t("booking.checkout.validation.checkOutAfterCheckIn")}</FormAlert>}
                        {quoteError && <FormAlert>{quoteError}</FormAlert>}

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full bg-[#003580] text-white py-4 rounded-lg font-bold tracking-wide shadow-md hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? t("booking.checkout.creatingBooking") : t("booking.checkout.continueToPayment")}
                        </button>
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!canSubmit || addingToCart}
                            className="w-full border-2 border-[#003580] text-[#003580] py-3 rounded-lg font-bold tracking-wide hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                            {addingToCart ? t("booking.checkout.adding") : t("booking.checkout.addToCart")}
                        </button>
                        <p className="text-xs text-center text-gray-500">
                            {t("booking.checkout.holdPolicy")}
                        </p>
                    </div>
                </aside>
            </form>
        </main>
    );
}

export default Checkout;
