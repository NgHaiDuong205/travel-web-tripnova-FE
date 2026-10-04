import apiClient from "../config/axiosConfig";
import { pickField, unwrapListResponse } from "../utils/apiHelpers";

export function normalizeDestination(raw) {
    return {
        id: pickField(raw, "id"),
        name: pickField(raw, "name", "destinationName", "destination_name"),
        countryCode: pickField(raw, "countryCode", "country_code"),
    };
}

export async function fetchDestinations({ countryCode } = {}) {
    const params = {};
    if (countryCode) params.countryCode = countryCode;

    const { data } = await apiClient.get("/api/destinations/", { params });
    const { items } = unwrapListResponse(data);
    return items.map(normalizeDestination).filter((d) => d.name);
}

/** Một trang điểm đến (DestinationDTO đầy đủ) + tổng từ X-Total-Count. */
export async function fetchDestinationPage({ q, countryCode, isPopular, category, page = 1, limit = 12 } = {}) {
    const params = { page, limit };
    if (q) params.q = q;
    if (countryCode) params.countryCode = countryCode;
    if (isPopular) params.isPopular = true;
    if (category && category !== "all") params.category = category;
    const response = await apiClient.get("/api/destinations/", { params });
    const { items } = unwrapListResponse(response.data);
    const total = Number(response.headers?.["x-total-count"]);
    return { items, total: Number.isFinite(total) ? total : items.length };
}

/** Chi tiết điểm đến (DestinationDTO đầy đủ). */
export async function fetchDestination(id) {
    const { data } = await apiClient.get(`/api/destinations/${id}/`);
    return data;
}

/** Tìm điểm đến theo đúng tên (không phân biệt hoa thường); không có → null. */
export async function findDestinationByName(name) {
    const { data } = await apiClient.get("/api/destinations/", { params: { q: name, limit: 20 } });
    const { items } = unwrapListResponse(data);
    const target = name.trim().toLowerCase();
    return items.find((d) => d.name?.trim().toLowerCase() === target) ?? null;
}

/** Một địa danh của điểm đến (LandmarkDTO). */
export async function fetchLandmark(destinationId, landmarkId) {
    const { data } = await apiClient.get(`/api/destinations/${destinationId}/landmarks/${landmarkId}/`);
    return data;
}

export async function fetchDestinationLandmarks(id) {
    const { data } = await apiClient.get(`/api/destinations/${id}/landmarks/`);
    return unwrapListResponse(data).items;
}
