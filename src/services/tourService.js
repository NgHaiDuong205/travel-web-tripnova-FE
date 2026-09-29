import apiClient from "../config/axiosConfig";

/** Đọc dữ liệu danh sách từ phản hồi API. */
function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

/** Lấy danh sách tour. */
export async function fetchTours({ q, destinationId, priceMin, priceMax, minDays, maxDays, sort, page = 1, limit = 9 } = {}) {
    const response = await apiClient.get("/api/tours/", {
        params: {
            q: q || undefined,
            destinationId: destinationId || undefined,
            priceMin: priceMin || undefined,
            priceMax: priceMax || undefined,
            minDays: minDays || undefined,
            maxDays: maxDays || undefined,
            sort: sort || undefined,
            page: page || undefined,
            limit: limit || undefined,
        },
    });
    return readList(response);
}

/** Lấy chi tiết một tour. */
export async function fetchTour(id) {
    const { data } = await apiClient.get(`/api/tours/${id}/`);
    return data;
}

/** Lấy tình trạng chỗ trống của tour. */
export async function fetchTourAvailability(id, date) {
    const { data } = await apiClient.get(`/api/tours/${id}/availability/`, { params: { date: date || undefined } });
    return data;
}

/** Lấy khách sạn liên kết với tour. */
export async function fetchTourHotels(id) {
    const { data } = await apiClient.get(`/api/tours/${id}/hotels/`);
    return data;
}

/** Lấy xe liên kết với tour. */
export async function fetchTourCars(id) {
    const { data } = await apiClient.get(`/api/tours/${id}/cars/`);
    return data;
}

/** Lấy chuyến bay liên kết với tour. */
export async function fetchTourFlights(id) {
    const { data } = await apiClient.get(`/api/tours/${id}/flights/`);
    return data;
}

/** Tạo đơn đặt tour. */
export async function createTourBooking(body) {
    const { data } = await apiClient.post("/api/tour-bookings/", body);
    return data;
}

/** Lấy một đơn đặt tour. */
export async function fetchTourBooking(id) {
    const { data } = await apiClient.get(`/api/tour-bookings/${id}/`);
    return data;
}

/** Hủy đơn đặt tour. */
export async function cancelTourBooking(id, reason) {
    const { data } = await apiClient.post(`/api/tour-bookings/${id}/cancel/`, { reason });
    return data;
}

/** Lấy đơn đặt tour của người dùng hiện tại. */
export async function fetchMyTourBookings({ status, page = 1, limit = 10 } = {}) {
    const response = await apiClient.get("/api/me/tour-bookings/", {
        params: { status: status || undefined, page: page || undefined, limit: limit || undefined },
    });
    return readList(response);
}

export const TOUR_SORTS = [
    { value: "newest", label: "Editor's picks" },
    { value: "price_asc", label: "Price: low to high" },
    { value: "price_desc", label: "Price: high to low" },
    { value: "duration_asc", label: "Shortest first" },
    { value: "duration_desc", label: "Longest first" },
    { value: "departure", label: "Next departure" },
];

export const DURATION_FILTERS = [
    { value: "", label: "Any length", min: undefined, max: undefined },
    { value: "short", label: "1 - 3 days", min: 1, max: 3 },
    { value: "week", label: "4 - 7 days", min: 4, max: 7 },
    { value: "long", label: "8+ days", min: 8, max: undefined },
];
