import apiClient from "../config/axiosConfig";

function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

/** Fetch cars. */
export async function fetchCars(params = {}) {
    const response = await apiClient.get("/api/cars/", {
        params: {
            q: params.q || undefined,
            destinationId: params.destinationId || undefined,
            type: params.type || undefined,
            brands: params.brands?.length ? params.brands.join(",") : undefined,
            seats: params.seats || undefined,
            transmission: params.transmission || undefined,
            fuelType: params.fuelType || undefined,
            withDriver: params.withDriver || undefined,
            priceMin: params.priceMin || undefined,
            priceMax: params.priceMax || undefined,
            pickupDate: params.pickupDate || undefined,
            returnDate: params.returnDate || undefined,
            sort: params.sort || undefined,
            page: params.page || 1,
            limit: params.limit || 12,
        },
    });
    return readList(response);
}

/** Fetch car filters. */
export async function fetchCarFilters() {
    const { data } = await apiClient.get("/api/cars/filters/");
    return data;
}
/** Fetch one car. */
export async function fetchCar(carId) {
    const { data } = await apiClient.get(`/api/cars/${carId}/`);
    return data;
}
/** Fetch car availability. */
export async function fetchCarAvailability(carId, from, to) {
    const { data } = await apiClient.get(`/api/cars/${carId}/availability/`, { params: { from, to } });
    return data;
}
/** Create a car booking. */
export async function createCarBooking(body) {
    const { data } = await apiClient.post("/api/car-bookings/", body);
    return data;
}
/** Fetch one car booking. */
export async function fetchCarBooking(id) {
    const { data } = await apiClient.get(`/api/car-bookings/${id}/`);
    return data;
}
/** Cancel a car booking. */
export async function cancelCarBooking(id, reason) {
    const { data } = await apiClient.post(`/api/car-bookings/${id}/cancel/`, { reason });
    return data;
}
/** Fetch current user car bookings. */
export async function fetchMyCarBookings({ status, page = 1, limit = 10 } = {}) {
    const response = await apiClient.get("/api/me/car-bookings/", {
        params: { status: status || undefined, page: page || undefined, limit: limit || undefined },
    });
    return readList(response);
}

export const CAR_TYPE_LABELS = {
    sedan: "Sedan",
    suv: "SUV",
    minivan: "Minivan",
    luxury: "Luxury",
    motorbike: "Motorbike",
    coach: "Coach",
};
export const CAR_SORTS = [
    { value: "newest", label: "Recommended" },
    { value: "price_asc", label: "Price: low to high" },
    { value: "price_desc", label: "Price: high to low" },
    { value: "seats_desc", label: "Most seats" },
];
export const BOOKING_STATUS_LABELS = {
    pending: { label: "Awaiting payment", className: "bg-amber-50 text-amber-700 border-amber-200" },
    confirmed: { label: "Confirmed", className: "bg-green-50 text-green-700 border-green-200" },
    checked_in: { label: "In progress", className: "bg-blue-50 text-blue-700 border-blue-200" },
    checked_out: { label: "Returned", className: "bg-blue-50 text-blue-700 border-blue-200" },
    completed: { label: "Completed", className: "bg-gray-50 text-gray-700 border-gray-200" },
    cancelled: { label: "Cancelled", className: "bg-red-50 text-red-600 border-red-200" },
    refunded: { label: "Refunded", className: "bg-gray-50 text-gray-600 border-gray-200" },
    no_show: { label: "No-show", className: "bg-red-50 text-red-600 border-red-200" },
};
