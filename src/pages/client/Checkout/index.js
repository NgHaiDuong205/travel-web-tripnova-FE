import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { checkHotelAvailability, createHotelBooking, PAYMENT_METHODS } from "../../../services/bookingService";
import { addCartItem } from "../../../services/cartService";
import { fetchHotelById } from "../../../services/hotelService";
import { fetchRoomDetails } from "../../../services/roomService";
import { useAuth } from "../../../context/AuthContext";
import FormAlert from "../../../components/common/FormAlert";
import { formatDate, formatMoney, isoDateFromToday, nightsBetween } from "../../../utils/formatters";

const inputClass =
    "w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#003580] focus:ring-4 focus:ring-[#003580]/10 transition-all outline-none";

function Checkout() {
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
    }, [hotelId, roomTypeId, roomId, form.checkIn, form.checkOut, nights]);

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
            setError(`Phòng chỉ chứa tối đa ${maxGuests} khách.`);
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
            setError(err.message || "Không tạo được đặt phòng.");
        } finally {
            setSubmitting(false);
        }
    };

    // Giỏ hàng đặt theo loại phòng (không giữ phòng cụ thể), số khách là tổng cho các phòng.
    const handleAddToCart = async () => {
        if (form.adults + form.children > maxGuests) {
            setError(`Phòng chỉ chứa tối đa ${maxGuests} khách.`);
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
            setError(err.message || "Không thêm được vào giỏ hàng.");
            setAddingToCart(false);
        }
    };

    if (!hotelId || !roomTypeId) {
        return (
            <div className="max-w-screen-md mx-auto px-8 pt-32 pb-24 text-center">
                <h2 className="text-2xl font-bold text-primary mb-4">Thiếu thông tin phòng</h2>
                <Link to="/hotels" className="font-bold text-[#003580] hover:underline">
                    Tìm khách sạn
                </Link>
            </div>
        );
    }

    return (
        <main className="max-w-screen-xl mx-auto px-8 pt-32 pb-24">
            <h1 className="text-4xl font-display font-extrabold text-primary tracking-tight mb-2">Complete your booking</h1>
            <p className="text-on-surface-variant mb-10">
                {hotel?.name || "Hotel"} · {room?.roomTypeName || "Room"}
                {room?.roomNumber ? ` · Room ${room.roomNumber}` : ""}
            </p>

            <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-10" noValidate>
                <div className="col-span-12 lg:col-span-7 space-y-8">
                    <FormAlert>{error}</FormAlert>

                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-6">
                        <h2 className="text-xl font-bold text-primary">Your stay</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="block text-sm font-bold text-gray-700 mb-2">Check-in</span>
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
                                <span className="block text-sm font-bold text-gray-700 mb-2">Check-out</span>
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
                                <span className="block text-sm font-bold text-gray-700 mb-2">Adults</span>
                                <select name="adults" value={form.adults} onChange={handleChange} className={inputClass}>
                                    {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="block text-sm font-bold text-gray-700 mb-2">Children</span>
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
                            <span className="block text-sm font-bold text-gray-700 mb-2">Special requests (optional)</span>
                            <textarea
                                name="specialRequests"
                                rows={3}
                                maxLength={1000}
                                value={form.specialRequests}
                                onChange={handleChange}
                                placeholder="High floor, late check-in..."
                                className={inputClass}
                            />
                        </label>
                    </section>

                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-4">
                        <h2 className="text-xl font-bold text-primary">Guest</h2>
                        <p className="text-sm text-gray-600">
                            {user?.fullName} · {user?.email}
                        </p>
                    </section>

                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-4">
                        <h2 className="text-xl font-bold text-primary">Payment method</h2>
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
                                    <span className="font-bold text-sm">{method.label}</span>
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
                            <span className="text-gray-500">Dates</span>
                            <span className="font-semibold">
                                {formatDate(form.checkIn)} → {formatDate(form.checkOut)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Guests</span>
                            <span className="font-semibold">
                                {form.adults} adult{form.adults > 1 ? "s" : ""}
                                {form.children > 0 ? `, ${form.children} child${form.children > 1 ? "ren" : ""}` : ""}
                            </span>
                        </div>
                        {quote && (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">
                                        {quote.nights} night{quote.nights > 1 ? "s" : ""} × {formatMoney(quote.pricePerNight)}
                                    </span>
                                    <span className="font-semibold">{formatMoney(quote.totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-primary pt-4 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>{formatMoney(quote.totalPrice)}</span>
                                </div>
                                {!roomAvailable && quote.availableRooms > 0 && (
                                    <FormAlert type="success">
                                        Phòng đã chọn không còn trống, chúng tôi sẽ xếp phòng khác cùng hạng ({quote.availableRooms} phòng còn trống).
                                    </FormAlert>
                                )}
                                {quote.availableRooms === 0 && <FormAlert>Hạng phòng này đã hết phòng trong thời gian đã chọn.</FormAlert>}
                            </>
                        )}
                        {nights <= 0 && <FormAlert>Ngày trả phòng phải sau ngày nhận phòng.</FormAlert>}
                        {quoteError && <FormAlert>{quoteError}</FormAlert>}

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full bg-[#003580] text-white py-4 rounded-lg font-bold tracking-wide shadow-md hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Creating booking..." : "Continue to payment"}
                        </button>
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!canSubmit || addingToCart}
                            className="w-full border-2 border-[#003580] text-[#003580] py-3 rounded-lg font-bold tracking-wide hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                            {addingToCart ? "Adding..." : "Add to cart"}
                        </button>
                        <p className="text-xs text-center text-gray-500">
                            Phòng được giữ 15 phút sau khi bạn bấm tiếp tục. Thêm vào giỏ thì chưa giữ phòng.
                        </p>
                    </div>
                </aside>
            </form>
        </main>
    );
}

export default Checkout;
