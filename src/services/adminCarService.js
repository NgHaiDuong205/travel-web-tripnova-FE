import apiClient from "../config/axiosConfig";

function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

/** Fetch cars for administration. */
export async function fetchAdminCars({ q, type, active, page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/cars/", {
        params: {
            q: q || undefined,
            type: type || undefined,
            active: typeof active === "boolean" ? active : undefined,
            page: page || undefined,
            limit: limit || undefined,
        },
    });
    return readList(response);
}
/** Fetch one administration car. */
export async function fetchAdminCar(id) {
    const { data } = await apiClient.get(`/api/admin/cars/${id}/`);
    return data;
}
/** Create an administration car. */
export async function createAdminCar(body) {
    const { data } = await apiClient.post("/api/admin/cars/", body);
    return data;
}
/** Update an administration car. */
export async function updateAdminCar(id, body) {
    const { data } = await apiClient.put(`/api/admin/cars/${id}/`, body);
    return data;
}
/** Delete an administration car. */
export async function deleteAdminCar(id) {
    await apiClient.delete(`/api/admin/cars/${id}/`);
}
/** Fetch car bookings for administration. */
export async function fetchAdminCarBookings({ status, q, page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/car-bookings/", {
        params: { status: status || undefined, q: q || undefined, page: page || undefined, limit: limit || undefined },
    });
    return readList(response);
}
/** Update an administration car booking status. */
export async function updateAdminCarBookingStatus(id, status, reason) {
    const { data } = await apiClient.put(`/api/admin/car-bookings/${id}/status/`, { status, reason });
    return data;
}

export const CAR_BOOKING_NEXT_STATUSES = {
    pending: ["cancelled"],
    confirmed: ["checked_in", "no_show", "cancelled"],
    checked_in: ["checked_out"],
    checked_out: ["completed"],
};
