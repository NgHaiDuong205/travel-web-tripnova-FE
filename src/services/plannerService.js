import apiClient from "../config/axiosConfig";

/** AI Planner (/api/ai/itineraries/*): bản nháp lịch trình từ điểm đến + lưu thành lịch trình của tôi. */

/**
 * body: { destinationId, startDate, days, partySize, budget, pace, interests[], note, locale, variant }
 * @returns PlannerResultDTO — AI lỗi vẫn trả lịch trình, kèm warnings "ai_unavailable" | "ai_quota".
 */
export async function planItinerary(body) {
    // BE chờ dịch vụ AI tối đa 90s.
    const { data } = await apiClient.post("/api/ai/itineraries/plan/", body, { timeout: 100000 });
    return data;
}

/** Lưu bản nháp (đã chỉnh) → ItineraryDTO (generatedBy = "ai"). */
export async function savePlannedItinerary(plan) {
    const items = [];
    plan.dayPlans.forEach((day) => {
        day.items.forEach((item) => {
            items.push({
                dayNumber: day.dayNumber,
                startTime: item.startTime || null,
                endTime: item.endTime || null,
                entityType: item.entityType || (item.kind === "lunch" || item.kind === "dinner" ? "restaurant" : "activity"),
                entityId: item.entityId || null,
                title: item.title,
                notes: item.notes || null,
                estimatedCost: item.estimatedCost ?? null,
            });
        });
    });
    const { data } = await apiClient.post("/api/ai/itineraries/", {
        title: plan.title,
        destinationId: plan.destinationId,
        startDate: plan.startDate,
        endDate: plan.endDate,
        partySize: plan.partySize,
        prompt: plan.prompt,
        modelVersion: plan.model,
        items,
    });
    return data;
}
