import apiClient from "../config/axiosConfig";

export const NOTIFICATIONS_CHANGED_EVENT = "tripnova:notifications-changed";

/** Báo cho chuông thông báo đếm lại số chưa đọc. */
function announceChange() {
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

/** @returns {Promise<{items: object[], total: number, unread: number}>} */
export async function fetchNotifications({ unread = false, page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/me/notifications/", {
        params: { unread: unread || undefined, page, limit },
    });
    const total = Number(response.headers?.["x-total-count"]);
    const unreadCount = Number(response.headers?.["x-unread-count"]);
    return {
        items: response.data,
        total: Number.isNaN(total) ? response.data.length : total,
        unread: Number.isNaN(unreadCount) ? 0 : unreadCount,
    };
}

export async function fetchUnreadCount() {
    const { data } = await apiClient.get("/api/me/notifications/unread-count/");
    return data.count;
}

export async function markNotificationRead(id) {
    const { data } = await apiClient.patch(`/api/me/notifications/${id}/read/`);
    announceChange();
    return data;
}

export async function markAllNotificationsRead() {
    const { data } = await apiClient.post("/api/me/notifications/mark-all-read/");
    announceChange();
    return data.updated;
}

export async function deleteNotification(id) {
    await apiClient.delete(`/api/me/notifications/${id}/`);
    announceChange();
}

/** Icon Material Symbols + màu theo loại thông báo. */
export function notificationStyle(type = "") {
    if (type.startsWith("payment_success")) return { icon: "check_circle", className: "bg-green-50 text-green-700" };
    if (type.startsWith("payment_failed")) return { icon: "error", className: "bg-red-50 text-red-600" };
    if (type === "refund" || type === "payment_refunded" || type === "booking_refunded")
        return { icon: "currency_exchange", className: "bg-amber-50 text-amber-700" };
    if (type.startsWith("booking_cancelled") || type === "booking_no_show")
        return { icon: "event_busy", className: "bg-red-50 text-red-600" };
    if (type.startsWith("booking_")) return { icon: "event_available", className: "bg-blue-50 text-blue-700" };
    if (type === "post_approved") return { icon: "verified", className: "bg-green-50 text-green-700" };
    if (type === "post_rejected") return { icon: "block", className: "bg-red-50 text-red-600" };
    if (type === "post_comment" || type === "comment_reply") return { icon: "forum", className: "bg-purple-50 text-purple-700" };
    if (type === "contact_reply") return { icon: "support_agent", className: "bg-blue-50 text-blue-700" };
    return { icon: "notifications", className: "bg-gray-100 text-gray-600" };
}
