import apiClient from "../config/axiosConfig";

/** Đọc dữ liệu danh sách từ phản hồi API. */
function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

/** Lấy danh sách tour quản trị. */
export async function fetchAdminTours({ q, active, page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/tours/", {
        params: {
            q: q || undefined,
            active: typeof active === "boolean" ? active : undefined,
            page: page || undefined,
            limit: limit || undefined,
        },
    });
    return readList(response);
}

/** Lấy chi tiết tour quản trị. */
export async function fetchAdminTour(id) {
    const { data } = await apiClient.get(`/api/admin/tours/${id}/`);
    return data;
}
/** Tạo tour quản trị. */
export async function createAdminTour(body) {
    const { data } = await apiClient.post("/api/admin/tours/", body);
    return data;
}
/** Cập nhật tour quản trị. */
export async function updateAdminTour(id, body) {
    const { data } = await apiClient.put(`/api/admin/tours/${id}/`, body);
    return data;
}
/** Xóa mềm tour quản trị. */
export async function deleteAdminTour(id) {
    await apiClient.delete(`/api/admin/tours/${id}/`);
}
/** Liên kết khách sạn với tour. */
export async function linkAdminTourHotel(tourId, hotelId, body) {
    const { data } = await apiClient.post(`/api/admin/tours/${tourId}/hotels/${hotelId}/`, body);
    return data;
}
/** Gỡ khách sạn khỏi tour. */
export async function unlinkAdminTourHotel(tourId, hotelId) {
    const { data } = await apiClient.delete(`/api/admin/tours/${tourId}/hotels/${hotelId}/`);
    return data;
}
/** Liên kết xe với tour. */
export async function linkAdminTourCar(tourId, carId, body) {
    const { data } = await apiClient.post(`/api/admin/tours/${tourId}/cars/${carId}/`, body);
    return data;
}
/** Gỡ xe khỏi tour. */
export async function unlinkAdminTourCar(tourId, carId) {
    const { data } = await apiClient.delete(`/api/admin/tours/${tourId}/cars/${carId}/`);
    return data;
}
/** Liên kết chuyến bay với tour. */
export async function linkAdminTourFlight(tourId, flightId, body) {
    const { data } = await apiClient.post(`/api/admin/tours/${tourId}/flights/${flightId}/`, body);
    return data;
}
/** Gỡ chuyến bay khỏi tour. */
export async function unlinkAdminTourFlight(tourId, flightId) {
    const { data } = await apiClient.delete(`/api/admin/tours/${tourId}/flights/${flightId}/`);
    return data;
}
/** Lấy danh sách đơn đặt tour quản trị. */
export async function fetchAdminTourBookings({ status, q, page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/tour-bookings/", {
        params: { status: status || undefined, q: q || undefined, page: page || undefined, limit: limit || undefined },
    });
    return readList(response);
}
/** Cập nhật trạng thái đơn đặt tour. */
export async function updateAdminTourBookingStatus(id, status, reason) {
    const { data } = await apiClient.put(`/api/admin/tour-bookings/${id}/status/`, { status, reason });
    return data;
}

export const TOUR_BOOKING_NEXT_STATUSES = {
    pending: ["cancelled"],
    confirmed: ["checked_in", "no_show", "cancelled"],
    checked_in: ["completed"],
};
