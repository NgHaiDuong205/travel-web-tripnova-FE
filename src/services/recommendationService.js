import apiClient from "../config/axiosConfig";

/** Gợi ý cá nhân hoá (cần đăng nhập). type: all | hotel | tour | destination | landmark | car. */
export async function fetchRecommendations({ type = "all", limit = 12 } = {}) {
    const { data } = await apiClient.get("/api/ai/recommendations/", { params: { type, limit } });
    return data;
}

/** Khách sạn tương tự (công khai). */
export async function fetchSimilarHotels(hotelId, limit = 6) {
    const { data } = await apiClient.get(`/api/hotels/${hotelId}/similar/`, { params: { limit } });
    return data;
}

/** Ghi lượt xem / bấm làm tín hiệu gợi ý. Không chặn giao diện, lỗi bỏ qua. */
export function trackInteraction(entityType, entityId, action = "view") {
    return apiClient.post("/api/interactions/", { entityType, entityId, action }).catch(() => {});
}
