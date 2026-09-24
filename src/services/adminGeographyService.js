import apiClient from "../config/axiosConfig";

function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

async function save(basePath, id, payload) {
    const { data } = id ? await apiClient.put(`${basePath}${id}/`, payload) : await apiClient.post(basePath, payload);
    return data;
}

// ---- Continents ----

export async function fetchAdminContinents() {
    const { data } = await apiClient.get("/api/admin/continents/");
    return data;
}

export const saveAdminContinent = (id, payload) => save("/api/admin/continents/", id, payload);

/** BE trả 409 nếu châu lục còn quốc gia. */
export async function deleteAdminContinent(id) {
    await apiClient.delete(`/api/admin/continents/${id}/`);
}

// ---- Countries ----

export async function fetchAdminCountries({ q = "", continentId = "" } = {}) {
    const { data } = await apiClient.get("/api/admin/countries/", {
        params: { q: q || undefined, continentId: continentId || undefined },
    });
    return data;
}

export const saveAdminCountry = (id, payload) => save("/api/admin/countries/", id, payload);

/** BE trả 409 nếu quốc gia còn điểm đến. */
export async function deleteAdminCountry(id) {
    await apiClient.delete(`/api/admin/countries/${id}/`);
}

// ---- Destinations ----

export async function fetchAdminDestinations({ q = "", countryId = "", status = "all", page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/destinations/", {
        params: { q: q || undefined, countryId: countryId || undefined, status, page, limit },
    });
    return readList(response);
}

export const saveAdminDestination = (id, payload) => save("/api/admin/destinations/", id, payload);

/** Xoá mềm; khôi phục bằng saveAdminDestination với isActive: true. */
export async function deactivateAdminDestination(id) {
    await apiClient.delete(`/api/admin/destinations/${id}/`);
}

// ---- Landmarks ----

export async function fetchAdminLandmarks({ q = "", destinationId = "", category = "all", status = "all", page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/landmarks/", {
        params: { q: q || undefined, destinationId: destinationId || undefined, category, status, page, limit },
    });
    return readList(response);
}

export const saveAdminLandmark = (id, payload) => save("/api/admin/landmarks/", id, payload);

/** Xoá mềm; khôi phục bằng saveAdminLandmark với isActive: true. */
export async function deactivateAdminLandmark(id) {
    await apiClient.delete(`/api/admin/landmarks/${id}/`);
}

export const LANDMARK_CATEGORIES = ["beach", "temple", "museum", "park", "mountain", "market", "restaurant", "entertainment", "historical", "other"];

/** "" / null → null, còn lại → Number (cho lat/long, phí...). */
export function toNumberOrNull(value) {
    return value === "" || value === null || value === undefined ? null : Number(value);
}
