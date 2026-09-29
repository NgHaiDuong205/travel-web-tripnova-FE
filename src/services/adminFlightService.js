import apiClient from "../config/axiosConfig";

function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

/** Danh sách chuyến bay (admin). */
export async function fetchAdminFlights({ q, page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/flights/", {
        params: { q: q || undefined, page: page || undefined, limit: limit || undefined },
    });
    return readList(response);
}

/** Một chuyến bay (admin). */
export async function fetchAdminFlight(id) {
    const { data } = await apiClient.get(`/api/admin/flights/${id}/`);
    return data;
}

/** Tạo chuyến bay. */
export async function createAdminFlight(body) {
    const { data } = await apiClient.post("/api/admin/flights/", body);
    return data;
}

/** Cập nhật chuyến bay. */
export async function updateAdminFlight(id, body) {
    const { data } = await apiClient.put(`/api/admin/flights/${id}/`, body);
    return data;
}

/** Ngừng bán chuyến bay (xoá mềm). */
export async function deleteAdminFlight(id) {
    await apiClient.delete(`/api/admin/flights/${id}/`);
}

/** Sơ đồ ghế đầy đủ trạng thái (admin). */
export async function fetchAdminFlightSeats(id) {
    const { data } = await apiClient.get(`/api/admin/flights/${id}/seats/`);
    return data;
}

/** Sinh lại sơ đồ ghế theo khối. */
export async function generateAdminFlightSeats(id, blocks) {
    const { data } = await apiClient.post(`/api/admin/flights/${id}/seats/generate/`, { blocks });
    return data;
}

/** Cập nhật một ghế. */
export async function updateAdminFlightSeat(flightId, seatId, body) {
    const { data } = await apiClient.put(`/api/admin/flights/${flightId}/seats/${seatId}/`, body);
    return data;
}

/** Xoá một ghế chưa từng được đặt. */
export async function deleteAdminFlightSeat(flightId, seatId) {
    await apiClient.delete(`/api/admin/flights/${flightId}/seats/${seatId}/`);
}

/** Danh sách vé (admin). */
export async function fetchAdminFlightBookings({ status, q, page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/flight-bookings/", {
        params: { status: status || undefined, q: q || undefined, page: page || undefined, limit: limit || undefined },
    });
    return readList(response);
}

/** Đổi trạng thái vé (admin). */
export async function updateAdminFlightBookingStatus(id, status, reason) {
    const { data } = await apiClient.put(`/api/admin/flight-bookings/${id}/status/`, { status, reason });
    return data;
}

export const FLIGHT_BOOKING_NEXT_STATUSES = {
    pending: ["cancelled"],
    confirmed: ["checked_in", "no_show", "cancelled"],
    checked_in: ["completed"],
};
