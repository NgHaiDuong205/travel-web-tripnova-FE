import apiClient from "../config/axiosConfig";

export const SEARCH_TYPES = [
    { key: "all", label: "All", icon: "travel_explore" },
    { key: "destination", label: "Destinations", icon: "location_on" },
    { key: "hotel", label: "Hotels", icon: "apartment" },
    { key: "tour", label: "Tours", icon: "tour" },
    { key: "car", label: "Cars", icon: "directions_car" },
    { key: "flight", label: "Flights", icon: "flight" },
];

/**
 * @returns {Promise<{query, type, searchId, counts: Record<string, number>, results: object[]}>}
 * type=all: tối đa `limit` kết quả mỗi loại; 1 loại: phân trang.
 */
export async function search({ q, type = "all", page = 1, limit } = {}) {
    const { data } = await apiClient.get("/api/search/", { params: { q, type, page, limit } });
    return data;
}

export async function suggest(q, limit = 8) {
    const { data } = await apiClient.get("/api/search/suggest/", { params: { q, limit } });
    return data;
}

/** Ghi lại kết quả user bấm (không chặn điều hướng nếu lỗi). */
export function trackClick(searchId, entityType, entityId) {
    if (!searchId || !entityId) return;
    apiClient.post("/api/search/click/", { searchId: String(searchId), entityType, entityId }).catch(() => {});
}

/** Trang FE của từng loại kết quả. */
export function resultLink(result) {
    switch (result.type) {
        case "hotel":
            return `/hotel/${result.id}`;
        case "tour":
            return `/tours/${result.id}`;
        case "car":
            return `/cars/${result.id}`;
        case "flight":
            return `/flights/${result.id}`;
        case "destination":
            // Trang chi tiết điểm đến cũ dùng dữ liệu tĩnh -> xem khách sạn tại điểm đến đó ngay trong trang tìm kiếm.
            return `/search?type=hotel&q=${encodeURIComponent(result.title)}`;
        case "city":
            return `/flights?to=${encodeURIComponent(result.subtitle || result.title)}`;
        default:
            return "/";
    }
}
