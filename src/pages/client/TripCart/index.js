import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import { PAYMENT_METHODS } from "../../../services/bookingService";
import { checkoutTripCart, fetchTripCart, removeTripCartItem, TRIP_CART_TYPES } from "../../../services/tripCartService";
import { formatDateTime, formatMoney } from "../../../utils/formatters";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80";
const EXPLORE_LINKS = { tour: "/tours", car: "/cars", flight: "/flights" };

/**
 * Giỏ chuyến đi cho tour / thuê xe / vé máy bay (giỏ khách sạn cũ ở /cart giữ nguyên).
 * Mỗi đơn chỉ chứa một loại booking nên thanh toán theo từng nhóm; giá hiện tại do BE tính lại mỗi lần tải.
 */
function TripCart() {
    const navigate = useNavigate();
    const [items, setItems] = useState(null);
    const [error, setError] = useState("");
    // Các dòng bị bỏ chọn (mặc định chọn hết những dòng không có lỗi).
    const [unchecked, setUnchecked] = useState(() => new Set());
    const [methods, setMethods] = useState({});
    const [busyType, setBusyType] = useState("");
    const [groupErrors, setGroupErrors] = useState({});

    const load = useCallback(async () => {
        setError("");
        try {
            setItems(await fetchTripCart());
        } catch (err) {
            setError(err.message);
            setItems([]);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const groups = useMemo(
        () =>
            TRIP_CART_TYPES.map((type) => ({ ...type, items: (items || []).filter((i) => i.itemType === type.key) })).filter(
                (g) => g.items.length > 0,
            ),
        [items],
    );

    const isSelected = (item) => !item.issue && !unchecked.has(item.id);

    const toggle = (id) =>
        setUnchecked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const handleRemove = async (id) => {
        setError("");
        try {
            await removeTripCartItem(id);
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCheckout = async (group) => {
        const ids = group.items.filter(isSelected).map((i) => i.id);
        if (ids.length === 0) return;
        setBusyType(group.key);
        setGroupErrors((prev) => ({ ...prev, [group.key]: "" }));
        try {
            const result = await checkoutTripCart(group.key, methods[group.key] || PAYMENT_METHODS[0].value, ids);
            navigate(`/trip-payment/${result.paymentId}`);
        } catch (err) {
            const message = err.details?.length ? err.details.join(" · ") : err.message;
            setGroupErrors((prev) => ({ ...prev, [group.key]: message }));
            setBusyType("");
            // Giá / chỗ trống có thể đã đổi — tải lại để hiện lỗi từng dòng.
            load();
        }
    };

    return (
        <main className="max-w-6xl mx-auto px-8 py-12">
            <section className="mb-10">
                <span className="text-[0.75rem] uppercase tracking-[0.2em] text-on-tertiary-fixed-variant mb-2 block">
                    Plan your journey
                </span>
                <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-3">Trip Cart</h1>
                <p className="text-on-surface-variant">
                    Tours, car rentals and flights you plan to book. Each group is paid separately. Hotel rooms live in your{" "}
                    <Link to="/cart" className="text-primary font-bold underline">
                        hotel cart
                    </Link>
                    .
                </p>
            </section>

            <FormAlert>{error}</FormAlert>

            {items === null && (
                <div className="space-y-6">
                    {Array.from({ length: 2 }, (_, i) => (
                        <div key={i} className="h-48 bg-surface-container-high rounded-xl animate-pulse" />
                    ))}
                </div>
            )}

            {items !== null && groups.length === 0 && !error && (
                <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-outline mb-3">add_shopping_cart</span>
                    <p className="text-on-surface-variant mb-6">
                        Your trip cart is empty. Use “Add to Trip Cart” on a tour, car or flight.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {TRIP_CART_TYPES.map((t) => (
                            <Link
                                key={t.key}
                                to={EXPLORE_LINKS[t.key]}
                                className="bg-primary text-white px-5 py-3 rounded-lg font-bold"
                            >
                                Explore {t.label.toLowerCase()}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-10">
                {groups.map((group) => {
                    const selected = group.items.filter(isSelected);
                    const total = selected.reduce((sum, i) => sum + Number(i.currentPrice ?? 0), 0);
                    return (
                        <section
                            key={group.key}
                            data-testid={`trip-cart-${group.key}`}
                            className="bg-surface-container-lowest rounded-2xl shadow-[0_8px_48px_rgba(27,28,28,0.06)] overflow-hidden"
                        >
                            <header className="flex items-center gap-3 px-8 py-5 bg-surface-container-low">
                                <span className="material-symbols-outlined text-primary">{group.icon}</span>
                                <h2 className="font-headline text-xl font-bold text-on-surface">{group.label}</h2>
                                <span className="text-sm text-on-surface-variant">({group.items.length})</span>
                            </header>

                            <ul className="divide-y divide-outline-variant/20">
                                {group.items.map((item) => (
                                    <li key={item.id} className="flex flex-col md:flex-row gap-5 px-8 py-6">
                                        <label className="flex items-start gap-4 flex-1 min-w-0 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="mt-2 w-5 h-5 accent-primary"
                                                checked={isSelected(item)}
                                                disabled={Boolean(item.issue)}
                                                onChange={() => toggle(item.id)}
                                                aria-label={`Select ${item.title}`}
                                            />
                                            <img
                                                src={item.imageUrl || PLACEHOLDER_IMAGE}
                                                alt={item.title}
                                                className="w-28 h-20 rounded-lg object-cover bg-surface-container-low shrink-0"
                                                loading="lazy"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-bold text-on-surface truncate">{item.title}</p>
                                                {item.subtitle && (
                                                    <p className="text-sm text-on-surface-variant mt-1">{item.subtitle}</p>
                                                )}
                                                <p className="text-xs text-on-surface-variant mt-1">
                                                    Added {formatDateTime(item.addedAt)}
                                                </p>
                                                {item.issue && (
                                                    <p className="text-xs text-error font-semibold mt-2 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">error</span>
                                                        {item.issue}
                                                    </p>
                                                )}
                                            </div>
                                        </label>
                                        <div className="flex md:flex-col items-center md:items-end justify-between gap-2 md:w-48 shrink-0">
                                            <div className="text-right">
                                                {item.currentPrice != null && (
                                                    <p className="text-lg font-extrabold text-on-surface">
                                                        {formatMoney(item.currentPrice)}
                                                    </p>
                                                )}
                                                {item.priceChanged && (
                                                    <p className="text-xs text-amber-700 font-semibold">
                                                        was <span className="line-through">{formatMoney(item.addedPrice)}</span>
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(item.id)}
                                                className="flex items-center gap-1 text-sm text-error hover:underline"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                Remove
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <footer className="flex flex-col md:flex-row md:items-center gap-4 px-8 py-6 bg-surface-container-low/60">
                                <div className="flex-1">
                                    <p className="text-sm text-on-surface-variant">
                                        {selected.length} of {group.items.length} selected
                                    </p>
                                    <p className="text-2xl font-extrabold text-primary">{formatMoney(total)}</p>
                                </div>
                                <select
                                    value={methods[group.key] || PAYMENT_METHODS[0].value}
                                    onChange={(e) => setMethods((prev) => ({ ...prev, [group.key]: e.target.value }))}
                                    className="border border-outline-variant rounded-lg px-4 py-3 text-sm bg-white"
                                    aria-label={`Payment method for ${group.label}`}
                                >
                                    {PAYMENT_METHODS.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    disabled={selected.length === 0 || Boolean(busyType)}
                                    onClick={() => handleCheckout(group)}
                                    className="primary-gradient text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50"
                                >
                                    {busyType === group.key ? "Processing..." : `Checkout ${group.label}`}
                                </button>
                            </footer>
                            {groupErrors[group.key] && (
                                <div className="px-8 pb-6">
                                    <FormAlert>{groupErrors[group.key]}</FormAlert>
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>
            <div className="h-16" />
        </main>
    );
}

export default TripCart;
