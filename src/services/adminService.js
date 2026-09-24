import apiClient from "../config/axiosConfig";

function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

export async function fetchAdminDashboard() {
    const { data } = await apiClient.get("/api/admin/dashboard/");
    return data;
}

/** @param {{status?, q?, page?, limit?}} filters */
export async function fetchAdminBookings({ status = "all", q = "", page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/hotel-bookings/", {
        params: { status, q: q || undefined, page, limit },
    });
    return readList(response);
}

export async function updateAdminBookingStatus(bookingId, status, reason) {
    const { data } = await apiClient.put(`/api/admin/hotel-bookings/${bookingId}/status/`, { status, reason });
    return data;
}

/** @param {{q?, role?, status?: "all"|"active"|"locked", page?, limit?}} filters */
export async function fetchAdminUsers({ q = "", role = "all", status = "all", page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/users/", {
        params: { q: q || undefined, role, status, page, limit },
    });
    return readList(response);
}

export async function updateAdminUserStatus(userId, isActive) {
    const { data } = await apiClient.put(`/api/admin/users/${userId}/status/`, { isActive });
    return data;
}

export async function updateAdminUserRoles(userId, roles) {
    const { data } = await apiClient.put(`/api/admin/users/${userId}/roles/`, { roles });
    return data;
}

export async function fetchAdminPayments({ status = "all", page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/payments/", { params: { status, page, limit } });
    return readList(response);
}

export async function fetchAdminContactMessages({ status = "all", page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/contact-messages/", { params: { status, page, limit } });
    return readList(response);
}

export async function updateAdminContactStatus(messageId, status) {
    const { data } = await apiClient.put(`/api/admin/contact-messages/${messageId}/status/`, { status });
    return data;
}

/** Trạng thái booking kế tiếp hợp lệ (khớp HotelBookingServiceImpl.updateStatusByAdmin). */
export const BOOKING_NEXT_STATUSES = {
    pending: ["cancelled"],
    confirmed: ["checked_in", "no_show", "cancelled"],
    checked_in: ["checked_out"],
    checked_out: ["completed"],
};

export const ALL_ROLES = ["USER", "HOTEL_MANAGER", "ADMIN"];

export const CONTACT_STATUS_LABELS = {
    new: { label: "New", className: "bg-blue-50 text-blue-700 border-blue-200" },
    in_progress: { label: "In progress", className: "bg-amber-50 text-amber-700 border-amber-200" },
    resolved: { label: "Resolved", className: "bg-green-50 text-green-700 border-green-200" },
    spam: { label: "Spam", className: "bg-red-50 text-red-700 border-red-200" },
    closed: { label: "Closed", className: "bg-gray-50 text-gray-700 border-gray-200" },
};
