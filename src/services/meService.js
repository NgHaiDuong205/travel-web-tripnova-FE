import apiClient from "../config/axiosConfig";

function readTotal(headers, fallback) {
    const total = Number(headers?.["x-total-count"]);
    return Number.isNaN(total) ? fallback : total;
}

export async function fetchMyProfile() {
    const { data } = await apiClient.get("/api/me/profile/");
    return data;
}

/** @param {{fullName, phone?, dateOfBirth?, gender?, avatarUrl?}} payload */
export async function updateMyProfile(payload) {
    const { data } = await apiClient.put("/api/me/profile/", payload);
    return data;
}

export async function changeMyPassword(currentPassword, newPassword) {
    await apiClient.put("/api/me/change-password/", { currentPassword, newPassword });
}

export async function fetchMyDashboard() {
    const { data } = await apiClient.get("/api/me/dashboard/");
    return data;
}

/**
 * @param {{status?: "all"|"upcoming"|"completed"|"cancelled"|"pending", page?: number, limit?: number}} filters
 * @returns {Promise<{items: object[], total: number}>}
 */
export async function fetchMyBookings({ status = "all", page = 1, limit = 10 } = {}) {
    const response = await apiClient.get("/api/me/bookings/", { params: { status, page, limit } });
    return { items: response.data, total: readTotal(response.headers, response.data.length) };
}

/** @param {{status?: "all"|"pending"|"success"|"failed"|"refunded", page?: number, limit?: number}} filters */
export async function fetchMyPayments({ status = "all", page = 1, limit = 10 } = {}) {
    const response = await apiClient.get("/api/me/payments/", { params: { status, page, limit } });
    return { items: response.data, total: readTotal(response.headers, response.data.length) };
}

export async function fetchMyPaymentSummary() {
    const { data } = await apiClient.get("/api/me/payments/summary/");
    return data;
}
