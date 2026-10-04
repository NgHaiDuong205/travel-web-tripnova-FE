import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import { HotelCartGroup, TripCartGroup } from "../../../components/client/CartGroups";
import AllPendingOrders from "../../../components/client/AllPendingOrders";
import { checkoutCart, clearCart, fetchCart, removeCartItem, updateCartItem } from "../../../services/cartService";
import { checkoutTripCart, fetchTripCart, removeTripCartItem, TRIP_CART_TYPES } from "../../../services/tripCartService";
import { useT } from "../../../i18n/I18nContext";

const EXPLORE_LINKS = [
    { key: "hotel", to: "/hotels" },
    { key: "tour", to: "/tours" },
    { key: "car", to: "/cars" },
    { key: "flight", to: "/flights" },
];

const hotelApi = {
    update: updateCartItem,
    remove: removeCartItem,
    clear: async () => {
        await clearCart();
        return fetchCart();
    },
    checkout: (paymentMethod, itemIds) => checkoutCart({ paymentMethod, itemIds }),
};

const tripApi = { remove: removeTripCartItem, checkout: checkoutTripCart };

/**
 * Giỏ hàng chung: khách sạn (/api/cart) + tour / xe / chuyến bay (/api/trip-cart) — cùng bảng carts ở BE.
 * Mỗi đơn hàng chỉ chứa một loại booking nên mỗi nhóm thanh toán riêng; giá / tình trạng được BE tính lại mỗi lần tải.
 */
function Cart() {
    const t = useT();
    const navigate = useNavigate();
    const [hotelCart, setHotelCart] = useState(null);
    const [tripItems, setTripItems] = useState(null);
    const [error, setError] = useState("");
    const [busyGroup, setBusyGroup] = useState("");

    const loadHotels = useCallback(() => fetchCart().then(setHotelCart), []);
    const loadTrips = useCallback(() => fetchTripCart().then(setTripItems), []);

    useEffect(() => {
        setError("");
        Promise.all([loadHotels(), loadTrips()]).catch((err) => {
            setError(err.message);
            setHotelCart((prev) => prev ?? { items: [] });
            setTripItems((prev) => prev ?? []);
        });
    }, [loadHotels, loadTrips]);

    const tripGroups = useMemo(
        () =>
            TRIP_CART_TYPES.map((type) => ({
                ...type,
                label: t(`booking.tripCart.types.${type.key}`),
                items: (tripItems || []).filter((i) => i.itemType === type.key),
            })).filter((g) => g.items.length > 0),
        [tripItems, t],
    );

    const loading = hotelCart === null || tripItems === null;
    const hotelCount = hotelCart?.items?.length ?? 0;
    const empty = !loading && hotelCount === 0 && tripGroups.length === 0;

    // Chạy checkout của một nhóm: khoá các nút khác, thành công thì sang trang thanh toán tương ứng
    const runCheckout = (groupKey, paymentPath) => async (result) => {
        setBusyGroup(groupKey);
        navigate(`${paymentPath}/${result.paymentId}`);
    };
    const guarded = (groupKey, fn) => async (...args) => {
        setBusyGroup(groupKey);
        try {
            return await fn(...args);
        } finally {
            setBusyGroup("");
        }
    };

    return (
        <main className="max-w-6xl mx-auto px-8 pt-32 pb-24">
            <section className="mb-10">
                <span className="text-[0.75rem] uppercase tracking-[0.2em] text-on-tertiary-fixed-variant mb-2 block">
                    {t("booking.tripCart.planJourney")}
                </span>
                <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-3">{t("booking.cart.title")}</h1>
                <p className="text-on-surface-variant">{t("booking.cart.intro")}</p>
            </section>

            <FormAlert>{error}</FormAlert>

            {/* Đơn đã tạo (từ giỏ hoặc trang chi tiết) nhưng chưa thanh toán: thanh toán tiếp / huỷ */}
            <AllPendingOrders />

            {loading && (
                <div className="space-y-6">
                    {Array.from({ length: 2 }, (_, i) => (
                        <div key={i} className="h-48 bg-surface-container-high rounded-xl animate-pulse" />
                    ))}
                </div>
            )}

            {empty && (
                <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-outline mb-3">shopping_cart</span>
                    <p className="text-on-surface-variant mb-6">{t("booking.cart.empty")}</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {EXPLORE_LINKS.map((link) => (
                            <Link key={link.key} to={link.to} className="bg-primary text-white px-5 py-3 rounded-lg font-bold">
                                {t("booking.tripCart.explore", { type: t(`booking.cart.exploreTypes.${link.key}`) })}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {!loading && (
                <div className="space-y-10">
                    {hotelCount > 0 && (
                        <HotelCartGroup
                            cart={hotelCart}
                            api={{
                                ...hotelApi,
                                checkout: guarded("hotel", async (method, itemIds) => {
                                    try {
                                        return await hotelApi.checkout(method, itemIds);
                                    } catch (err) {
                                        loadHotels().catch(() => {}); // tình trạng phòng có thể đã đổi
                                        throw err;
                                    }
                                }),
                            }}
                            onCartChange={setHotelCart}
                            onCheckedOut={runCheckout("hotel", "/payment")}
                            busy={busyGroup === "hotel"}
                            disabled={Boolean(busyGroup)}
                        />
                    )}
                    {tripGroups.map((group) => (
                        <TripCartGroup
                            key={group.key}
                            group={group}
                            api={{ ...tripApi, checkout: guarded(group.key, tripApi.checkout) }}
                            onChanged={() => loadTrips().catch((err) => setError(err.message))}
                            onCheckedOut={runCheckout(group.key, "/trip-payment")}
                            busy={busyGroup === group.key}
                            disabled={Boolean(busyGroup)}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}

export default Cart;
