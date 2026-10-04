import apiClient from "../config/axiosConfig";

/** Trợ lý AI (/api/ai/chat/*): phiên chat của user đang đăng nhập. */

export async function fetchChatSessions({ page = 1, limit = 30 } = {}) {
    const response = await apiClient.get("/api/ai/chat/sessions/", { params: { page, limit } });
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

/** context: { contextType, contextId } khi mở từ trang chi tiết (tuỳ chọn). */
export async function createChatSession(context = {}) {
    const { data } = await apiClient.post("/api/ai/chat/sessions/", context);
    return data;
}

export async function closeChatSession(sessionId) {
    await apiClient.delete(`/api/ai/chat/sessions/${sessionId}/`);
}

export async function fetchChatMessages(sessionId) {
    const { data } = await apiClient.get(`/api/ai/chat/sessions/${sessionId}/messages/`);
    return data;
}

/** @returns {Promise<{userMessage, assistantMessage, session}>} — lỗi AI: assistantMessage.isError = true. */
export async function sendChatMessage(sessionId, content, locale) {
    // AI có thể thử model dự phòng: chờ lâu hơn mặc định 30s (BE chờ dịch vụ AI tối đa 90s).
    const { data } = await apiClient.post(
        `/api/ai/chat/sessions/${sessionId}/messages/`,
        { content, locale },
        { timeout: 100000 }
    );
    return data;
}

/** feedback: { isHelpful?, rating?, comment? } */
export async function sendChatFeedback(messageId, feedback) {
    const { data } = await apiClient.post(`/api/ai/chat/messages/${messageId}/feedback/`, feedback);
    return data;
}
