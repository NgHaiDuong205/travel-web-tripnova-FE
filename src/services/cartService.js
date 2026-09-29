import apiClient from "../config/axiosConfig";

/** Fetch the current user's cart. */
export async function fetchCart() {
    const { data } = await apiClient.get("/api/cart/");
    return data;
}

/** Add an item to the cart. */
export async function addCartItem(body) {
    const { data } = await apiClient.post("/api/cart/items/", body);
    return data;
}

/** Update a cart item. */
export async function updateCartItem(itemId, body) {
    const { data } = await apiClient.put(`/api/cart/items/${itemId}/`, body);
    return data;
}

/** Remove a cart item. */
export async function removeCartItem(itemId) {
    const { data } = await apiClient.delete(`/api/cart/items/${itemId}/`);
    return data;
}

/** Clear the cart. */
export async function clearCart() {
    await apiClient.delete("/api/cart/clear/");
}

/** Check out selected cart items. */
export async function checkoutCart({ paymentMethod, itemIds }) {
    const { data } = await apiClient.post("/api/cart/checkout/", { paymentMethod, itemIds });
    return data;
}

export const CART_ISSUE_LABELS = {
    expired: "Ngày nhận phòng đã qua — hãy đổi ngày",
    inactive: "Phòng này hiện không nhận đặt",
    unavailable: "Không đủ phòng trống cho số lượng đã chọn",
};
