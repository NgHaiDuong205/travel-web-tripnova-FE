import apiClient from "../config/axiosConfig";

function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

/** Lấy danh sách chuyến bay. */
export async function fetchFlights(params = {}) {
    const response = await apiClient.get("/api/flights/", {
        params: {
            from: params.from || undefined,
            to: params.to || undefined,
            departDate: params.departDate || undefined,
            class: params.seatClass || undefined,
            pax: params.pax || undefined,
            airlines: params.airlines?.length ? params.airlines.join(",") : undefined,
            priceMax: params.priceMax || undefined,
            time: params.time || undefined,
            sort: params.sort || undefined,
            page: params.page || 1,
            limit: params.limit || 10,
        },
    });
    return readList(response);
}

/** Lấy các giá trị cho bộ lọc chuyến bay. */
export async function fetchFlightFilters() {
    const { data } = await apiClient.get("/api/flights/filters/");
    return data;
}

/** Lấy một chuyến bay. */
export async function fetchFlight(id) {
    const { data } = await apiClient.get(`/api/flights/${id}/`);
    return data;
}

/** Lấy sơ đồ ghế của chuyến bay. */
export async function fetchFlightSeats(id, seatClass) {
    const { data } = await apiClient.get(`/api/flights/${id}/seats/`, {
        params: { class: seatClass || undefined },
    });
    return data;
}

/** Tìm sân bay (autocomplete). */
export async function fetchAirports(q) {
    const { data } = await apiClient.get("/api/airports/", { params: { q } });
    return data;
}

/** Tạo đơn đặt vé (nhiều hành khách). */
export async function createFlightBooking(body) {
    const { data } = await apiClient.post("/api/flight-bookings/", body);
    return data;
}

/** Lấy một vé máy bay. */
export async function fetchFlightBooking(id) {
    const { data } = await apiClient.get(`/api/flight-bookings/${id}/`);
    return data;
}

/** Đổi ghế cho vé. */
export async function selectFlightSeat(id, seatId) {
    const { data } = await apiClient.post(`/api/flight-bookings/${id}/select-seat/`, { seatId });
    return data;
}

/** Huỷ vé. */
export async function cancelFlightBooking(id, reason) {
    const { data } = await apiClient.post(`/api/flight-bookings/${id}/cancel/`, { reason });
    return data;
}

/** Vé máy bay của user đang đăng nhập. */
export async function fetchMyFlightBookings({ status, page = 1, limit = 10 } = {}) {
    const response = await apiClient.get("/api/me/flight-bookings/", {
        params: { status: status || undefined, page: page || undefined, limit: limit || undefined },
    });
    return readList(response);
}

export const SEAT_CLASS_LABELS = {
    economy: "Economy",
    premium_economy: "Premium Economy",
    business: "Business",
    first: "First",
};

export const FLIGHT_SORTS = [
    { value: "departure", label: "Earliest departure" },
    { value: "price_asc", label: "Best price" },
    { value: "price_desc", label: "Highest price" },
    { value: "duration", label: "Shortest" },
];

export const TIME_SLOTS = [
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "evening", label: "Evening" },
    { value: "night", label: "Night" },
];

export function formatDuration(minutes) {
    if (minutes == null) return "";
    const value = Number(minutes);
    return `${Math.floor(value / 60)}h ${value % 60}m`;
}
