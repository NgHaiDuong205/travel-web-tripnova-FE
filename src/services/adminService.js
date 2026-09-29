import apiClient from "../config/axiosConfig";

function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

export async function fetchAdminDashboard() {
    const { data } = await apiClient.get("/api/admin/dashboard/");
    return data;
}

/** Khoảng [from, to] (yyyy-MM-dd, tính cả 2 đầu), granularity: day | week | month. */
export async function fetchAdminStatistics({ from, to, granularity }) {
    const { data } = await apiClient.get("/api/admin/dashboard/statistics/", { params: { from, to, granularity } });
    return data;
}

/** [{date, revenue, transactions}] — date là ngày đầu kỳ. */
export async function fetchAdminRevenue({ from, to, groupBy }) {
    const { data } = await apiClient.get("/api/admin/dashboard/revenue/", { params: { from, to, groupBy } });
    return data;
}

export async function fetchAdminTopHotels({ from, to, limit = 5 }) {
    const { data } = await apiClient.get("/api/admin/dashboard/top-hotels/", { params: { from, to, limit } });
    return data;
}

export async function fetchAdminTopDestinations({ from, to, limit = 5 }) {
    const { data } = await apiClient.get("/api/admin/dashboard/top-destinations/", { params: { from, to, limit } });
    return data;
}

export async function fetchAdminRecentPayments(limit = 8) {
    const { data } = await apiClient.get("/api/admin/dashboard/recent-payments/", { params: { limit } });
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

/** @param {{amount?: number, reason?: string}} body amount bỏ trống = hoàn toàn bộ phần còn lại */
export async function refundAdminBooking(bookingId, { amount, reason } = {}) {
    const { data } = await apiClient.post(`/api/admin/hotel-bookings/${bookingId}/refund/`, { amount, reason });
    return data;
}

/** BE chỉ cho xoá booking đã huỷ và chưa từng thanh toán (409 nếu không). */
export async function deleteAdminBooking(bookingId) {
    await apiClient.delete(`/api/admin/hotel-bookings/${bookingId}/`);
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

/** @param {{fullName, phone?, dateOfBirth?, gender?, avatarUrl?}} profile ghi đè toàn bộ các trường hồ sơ */
export async function updateAdminUser(userId, profile) {
    const { data } = await apiClient.put(`/api/admin/users/${userId}/`, profile);
    return data;
}

/** Xoá mềm; 409 nếu user còn đặt phòng chưa kết thúc. */
export async function deleteAdminUser(userId) {
    await apiClient.delete(`/api/admin/users/${userId}/`);
}

export async function fetchAdminRoles() {
    const { data } = await apiClient.get("/api/admin/roles/");
    return data;
}

/** Tạo mới nếu không có id. */
export async function saveAdminRole({ id, name, description }) {
    const body = { name, description };
    const { data } = id
        ? await apiClient.put(`/api/admin/roles/${id}/`, body)
        : await apiClient.post("/api/admin/roles/", body);
    return data;
}

export async function deleteAdminRole(roleId) {
    await apiClient.delete(`/api/admin/roles/${roleId}/`);
}

export async function updateAdminRolePermissions(roleId, permissionIds) {
    const { data } = await apiClient.put(`/api/admin/roles/${roleId}/permissions/`, { permissionIds });
    return data;
}

export async function fetchAdminPermissions() {
    const { data } = await apiClient.get("/api/admin/permissions/");
    return data;
}

export async function fetchAdminPayments({ status = "all", page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/payments/", { params: { status, page, limit } });
    return readList(response);
}

export async function updateAdminPaymentStatus(paymentId, status, reason) {
    const { data } = await apiClient.put(`/api/admin/payments/${paymentId}/status/`, { status, reason });
    return data;
}

export async function refundAdminPayment(paymentId, reason) {
    const { data } = await apiClient.post(`/api/admin/payments/${paymentId}/refund/`, { reason });
    return data;
}

export async function replyAdminContactMessage(messageId, content) {
    const { data } = await apiClient.post(`/api/admin/contact-messages/${messageId}/reply/`, { content });
    return data;
}

export async function deleteAdminContactMessage(messageId) {
    await apiClient.delete(`/api/admin/contact-messages/${messageId}/`);
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

/** Booking admin được hoàn tiền (khớp HotelBookingServiceImpl.ADMIN_REFUNDABLE_STATUSES), khi đơn đã thanh toán. */
export const BOOKING_REFUNDABLE_STATUSES = ["confirmed", "no_show", "checked_out", "completed"];

/** Số tiền còn có thể hoàn của booking (0 nếu chưa thanh toán / không hợp lệ). */
export function remainingRefundable(booking) {
    if (!BOOKING_REFUNDABLE_STATUSES.includes(booking.status)) return 0;
    if (booking.orderStatus !== "paid" && booking.orderStatus !== "partially_refunded") return 0;
    return Math.max(0, Number(booking.totalPrice || 0) - Number(booking.refundAmount || 0));
}

/** Chuyển trạng thái giao dịch thủ công (khớp PaymentServiceImpl.updateStatusByAdmin). */
export const PAYMENT_NEXT_STATUSES = {
    pending: ["success", "failed"],
    success: ["refunded"],
};

export const ALL_ROLES = ["USER", "HOTEL_MANAGER", "ADMIN"];

export const CONTACT_STATUS_LABELS = {
    new: { label: "New", className: "bg-blue-50 text-blue-700 border-blue-200" },
    in_progress: { label: "In progress", className: "bg-amber-50 text-amber-700 border-amber-200" },
    resolved: { label: "Resolved", className: "bg-green-50 text-green-700 border-green-200" },
    spam: { label: "Spam", className: "bg-red-50 text-red-700 border-red-200" },
    closed: { label: "Closed", className: "bg-gray-50 text-gray-700 border-gray-200" },
};
