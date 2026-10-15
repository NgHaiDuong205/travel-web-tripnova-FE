import apiClient from "../config/axiosConfig";

/**
 * Bản tóm tắt review do AI sinh (công khai). Trả null khi chưa có (204: chưa đủ review hoặc AI chưa tóm tắt).
 * { overview, pros[], cons[], bestFor[], basedOnCount, currentReviewCount, stale, generatedAt, language }
 */
export async function fetchReviewSummary(entityType, entityId, lang) {
    const response = await apiClient.get("/api/ai/summaries/", {
        params: { entityType, entityId, lang: lang || undefined },
    });
    return response.status === 204 || !response.data ? null : response.data;
}

/** [AUTH] Yêu cầu tóm tắt: { status: fresh | not_enough_reviews | queued, jobId?, summary? }. */
export async function requestReviewSummary(entityType, entityId, lang) {
    const { data } = await apiClient.post("/api/ai/summarize/", { entityType, entityId }, {
        params: { lang: lang || undefined },
    });
    return data;
}
