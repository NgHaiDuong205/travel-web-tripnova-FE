import apiClient from "../config/axiosConfig";

export const TRIP_CART_CHANGED_EVENT = "tripnova:trip-cart-changed";

function announce(items) {
    window.dispatchEvent(new CustomEvent(TRIP_CART_CHANGED_EVENT, { detail: items.length }));
    return items;
}

export const TRIP_CART_TYPES = [
    { key: "tour", label: "Tours", icon: "tour" },
    { key: "car", label: "Car rentals", icon: "directions_car" },
    { key: "flight", label: "Flights", icon: "flight" },
];

/** Các dòng tour / xe / chuyến bay; giá (currentPrice) và lỗi (issue) được BE tính lại mỗi lần đọc. */
export async function fetchTripCart() {
    const { data } = await apiClient.get("/api/trip-cart/");
    return data;
}

/**
 * @param {"tour"|"car"|"flight"} itemType
 * @param {object} booking body giống POST /api/{type}-bookings (không cần paymentMethod)
 */
export async function addTripCartItem(itemType, booking) {
    const { data } = await apiClient.post("/api/trip-cart/items/", { itemType, booking });
    return announce(data);
}

export async function removeTripCartItem(itemId) {
    const { data } = await apiClient.delete(`/api/trip-cart/items/${itemId}/`);
    return announce(data);
}

/** 1 order + 1 payment cho các dòng cùng loại; trả {orderId, orderCode, paymentId, amount, bookingIds, bookingType}. */
export async function checkoutTripCart(itemType, paymentMethod, itemIds) {
    const { data } = await apiClient.post("/api/trip-cart/checkout/", { itemType, paymentMethod, itemIds });
    window.dispatchEvent(new CustomEvent(TRIP_CART_CHANGED_EVENT));
    return data;
}
