import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import { PAYMENT_METHODS } from "../../../services/bookingService";
import { CART_ISSUE_LABELS, checkoutCart, clearCart, fetchCart, removeCartItem, updateCartItem } from "../../../services/cartService";
import { formatDate, formatMoney, isoDateFromToday } from "../../../utils/formatters";

const MAX_ROOMS = 5; // khớp CartServiceImpl.MAX_ROOMS_PER_ITEM
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80";
const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-[#003580] outline-none";

function ItemEditor({ item, onSave, onCancel }) {
    const [form, setForm] = useState({
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        quantity: item.quantity,
        adults: item.adults,
        children: item.children,
        specialRequests: item.specialRequests || "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = (name, numeric) => (e) => setForm((prev) => ({ ...prev, [name]: numeric ? Number(e.target.value) : e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.checkOut <= form.checkIn) {
            setError("Ngày trả phòng phải sau ngày nhận phòng");
            return;
        }
        if (form.adults < form.quantity) {
            setError("Mỗi phòng cần ít nhất 1 người lớn");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await onSave({ ...form, specialRequests: form.specialRequests.trim() || undefined });
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <label className="text-xs font-bold text-gray-600">
                    Check-in
                    <input type="date" required min={isoDateFromToday(0)} value={form.checkIn} onChange={set("checkIn")} className={`${inputClass} mt-1`} />
                </label>
                <label className="text-xs font-bold text-gray-600">
                    Check-out
                    <input type="date" required min={form.checkIn} value={form.checkOut} onChange={set("checkOut")} className={`${inputClass} mt-1`} />
                </label>
                <label className="text-xs font-bold text-gray-600">
                    Rooms
                    <select value={form.quantity} onChange={set("quantity", true)} className={`${inputClass} mt-1`}>
                        {Array.from({ length: MAX_ROOMS }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                </label>
                <label className="text-xs font-bold text-gray-600">
                    Adults (total)
                    <input type="number" min={1} max={20} value={form.adults} onChange={set("adults", true)} className={`${inputClass} mt-1`} />
                </label>
                <label className="text-xs font-bold text-gray-600">
                    Children (total)
                    <input type="number" min={0} max={20} value={form.children} onChange={set("children", true)} className={`${inputClass} mt-1`} />
                </label>
                <label className="col-span-2 md:col-span-5 text-xs font-bold text-gray-600">
                    Special requests
                    <input maxLength={1000} value={form.specialRequests} onChange={set("specialRequests")} className={`${inputClass} mt-1`} />
                </label>
            </div>
            <FormAlert>{error}</FormAlert>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500">Cancel</button>
                <button type="submit" disabled={saving} className="bg-[#003580] text-white px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>
        </form>
    );
}

function Cart() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [deselected, setDeselected] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("vnpay");
    const [checkingOut, setCheckingOut] = useState(false);

    useEffect(() => {
        fetchCart().then(setCart).catch((err) => setError(err.message));
    }, []);

    const items = useMemo(() => cart?.items || [], [cart]);
    // Chỉ thanh toán dòng không lỗi và đang được chọn
    const selected = items.filter((i) => !i.issue && !deselected.includes(i.id));
    const selectedTotal = selected.reduce((sum, i) => sum + Number(i.totalPrice), 0);
    const currency = cart?.currencyCode || "USD";

    const toggle = (id) => setDeselected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const handleRemove = async (item) => {
        setBusyId(item.id);
        setError("");
        try {
            setCart(await removeCartItem(item.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleClear = async () => {
        if (!window.confirm("Xoá toàn bộ giỏ hàng?")) return;
        try {
            await clearCart();
            setCart(await fetchCart());
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCheckout = async () => {
        setCheckingOut(true);
        setError("");
        try {
            const result = await checkoutCart({ paymentMethod, itemIds: selected.map((i) => i.id) });
            navigate(`/payment/${result.paymentId}`, { replace: true });
        } catch (err) {
            setError(err.message);
            setCheckingOut(false);
            fetchCart().then(setCart).catch(() => {}); // cập nhật lại tình trạng phòng
        }
    };

    if (!cart) {
        return (
            <main className="max-w-screen-xl mx-auto px-8 pt-32 pb-24">
                {error ? <FormAlert>{error}</FormAlert> : <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />}
            </main>
        );
    }

    return (
        <main className="max-w-screen-xl mx-auto px-8 pt-32 pb-24">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-display font-extrabold text-primary tracking-tight mb-2">Your cart</h1>
                    <p className="text-on-surface-variant">Giá và tình trạng phòng được cập nhật mỗi khi bạn mở giỏ. Phòng chỉ được giữ sau khi thanh toán.</p>
                </div>
                {items.length > 0 && (
                    <button type="button" onClick={handleClear} className="text-sm font-bold text-gray-500 hover:text-red-600">Clear cart</button>
                )}
            </div>

            <FormAlert>{error}</FormAlert>

            {items.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">shopping_cart</span>
                    <p className="text-gray-500 mb-4">Giỏ hàng đang trống.</p>
                    <Link to="/hotels" className="font-bold text-[#003580] hover:underline">Tìm khách sạn</Link>
                </div>
            ) : (
                <div className="grid grid-cols-12 gap-10">
                    <section className="col-span-12 lg:col-span-8 space-y-4">
                        {items.map((item) => (
                            <article key={item.id} className={`bg-white rounded-xl border shadow-sm p-5 ${item.issue ? "border-red-200" : "border-gray-100"}`}>
                                <div className="flex gap-4">
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        aria-label={`Select ${item.roomTypeName}`}
                                        disabled={!!item.issue}
                                        checked={!item.issue && !deselected.includes(item.id)}
                                        onChange={() => toggle(item.id)}
                                    />
                                    <img src={item.hotelCoverImageUrl || PLACEHOLDER_IMAGE} alt={item.hotelName || "Hotel"} className="w-28 h-24 rounded-lg object-cover hidden sm:block" />
                                    <div className="min-w-0 flex-1">
                                        <Link to={`/hotel/${item.hotelId}`} className="font-bold text-gray-900 hover:text-[#003580]">{item.hotelName}</Link>
                                        <p className="text-sm text-gray-600">
                                            {item.roomTypeName} · {item.quantity} room{item.quantity > 1 ? "s" : ""}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(item.checkIn)} → {formatDate(item.checkOut)} · {item.nights} night{item.nights > 1 ? "s" : ""} ·{" "}
                                            {item.adults} adult{item.adults > 1 ? "s" : ""}
                                            {item.children ? `, ${item.children} child${item.children > 1 ? "ren" : ""}` : ""}
                                        </p>
                                        {item.specialRequests && <p className="text-xs text-gray-500 mt-1">“{item.specialRequests}”</p>}
                                        {item.issue && (
                                            <p className="text-sm font-semibold text-red-600 mt-2">
                                                {CART_ISSUE_LABELS[item.issue]}
                                                {item.issue === "unavailable" && item.availableRooms != null ? ` (còn ${item.availableRooms})` : ""}
                                            </p>
                                        )}
                                        {!item.issue && item.priceChanged && (
                                            <p className="text-sm text-amber-700 mt-2">
                                                Giá đã thay đổi từ {formatMoney(Number(item.snapshotUnitPrice) * item.quantity, currency)} lúc thêm vào giỏ.
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <span className="font-bold text-gray-900 whitespace-nowrap">{formatMoney(item.totalPrice, currency)}</span>
                                        <div className="flex gap-3 text-sm font-bold">
                                            {editingId !== item.id && (
                                                <button type="button" onClick={() => setEditingId(item.id)} className="text-[#003580] hover:underline">Edit</button>
                                            )}
                                            <button type="button" disabled={busyId === item.id} onClick={() => handleRemove(item)} className="text-gray-500 hover:text-red-600 disabled:opacity-50">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {editingId === item.id && (
                                    <ItemEditor
                                        item={item}
                                        onCancel={() => setEditingId(null)}
                                        onSave={async (body) => {
                                            setCart(await updateCartItem(item.id, body));
                                            setEditingId(null);
                                        }}
                                    />
                                )}
                            </article>
                        ))}
                    </section>

                    <aside className="col-span-12 lg:col-span-4">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5 lg:sticky lg:top-28">
                            <h2 className="text-xl font-bold text-primary">Summary</h2>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>{selected.length} of {items.length} item{items.length > 1 ? "s" : ""} selected</span>
                                <span>{selected.reduce((n, i) => n + i.quantity, 0)} rooms</span>
                            </div>
                            <div className="flex justify-between text-lg font-extrabold text-gray-900 border-t border-gray-100 pt-4">
                                <span>Total</span>
                                <span>{formatMoney(selectedTotal, currency)}</span>
                            </div>
                            <label className="block">
                                <span className="block text-sm font-bold text-gray-700 mb-2">Payment method</span>
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputClass}>
                                    {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            </label>
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={selected.length === 0 || checkingOut}
                                className="w-full bg-[#003580] text-white py-4 rounded-lg font-bold tracking-wide shadow-md hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {checkingOut ? "Reserving rooms..." : "Checkout selected"}
                            </button>
                            <p className="text-xs text-center text-gray-500">
                                Các phòng được đặt chung 1 đơn, thanh toán 1 lần và giữ 15 phút. Dòng bị lỗi không được thanh toán.
                            </p>
                        </div>
                    </aside>
                </div>
            )}
        </main>
    );
}

export default Cart;
