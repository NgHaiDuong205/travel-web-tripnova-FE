import apiClient, { refreshAccessToken } from "../config/axiosConfig";
import { API_BASE_URL } from "../constants/api";
import { tokenStorage } from "../utils/tokenStorage";

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
export async function sendChatMessage(sessionId, content, locale, context = null) {
    // AI có thể thử model dự phòng: chờ lâu hơn mặc định 30s (BE chờ dịch vụ AI tối đa 90s).
    // context: { contextType, contextId } của trang đang xem — ghi đè ngữ cảnh của phiên cho câu hỏi này.
    const { data } = await apiClient.post(
        `/api/ai/chat/sessions/${sessionId}/messages/`,
        { content, locale, ...(context || {}) },
        { timeout: 100000 }
    );
    return data;
}

/**
 * Như sendChatMessage nhưng nhận câu trả lời dần (SSE): onDelta(text) cho từng đoạn chữ, trả về reply giống sendChatMessage.
 * Lỗi kiểm tra (rỗng, 429...) → Error {status, code}. err.fallback = true khi máy chủ / trình duyệt không hỗ trợ stream
 * (nên gọi sendChatMessage); err.streamBroken = true khi đứt giữa chừng (câu trả lời vẫn được lưu ở máy chủ).
 */
export async function streamChatMessage(sessionId, content, locale, context = null, { onDelta, signal } = {}) {
    if (typeof window === "undefined" || !window.ReadableStream || !window.TextDecoder) {
        throw Object.assign(new Error("Streaming not supported"), { fallback: true });
    }
    const post = (token) =>
        fetch(`${API_BASE_URL}/api/ai/chat/sessions/${sessionId}/messages/stream/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "text/event-stream, application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ content, locale, ...(context || {}) }),
            signal,
        });

    let response;
    try {
        response = await post(tokenStorage.getAccessToken());
        if (response.status === 401 && tokenStorage.getRefreshToken()) {
            response = await post(await refreshAccessToken());
        }
    } catch (err) {
        if (err.name === "AbortError") throw err;
        throw Object.assign(new Error(err.message), { fallback: true });
    }
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const error = new Error(data.message || data.error || `HTTP ${response.status}`);
        error.status = response.status;
        error.code = data.code;
        // Máy chủ cũ chưa có endpoint stream.
        error.fallback = response.status === 405 || (response.status === 404 && !data.message);
        throw error;
    }
    if (!response.body) throw Object.assign(new Error("Empty stream"), { fallback: true });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let reply = null;
    const handle = (block) => {
        let name = "message";
        const data = [];
        for (const line of block.split("\n")) {
            if (line.startsWith("event:")) name = line.slice(6).trim();
            else if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
        }
        if (!data.length) return;
        const payload = JSON.parse(data.join("\n"));
        if (name === "delta") onDelta?.(payload.text || "");
        else if (name === "done") reply = payload;
    };
    try {
        for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
            let cut;
            while ((cut = buffer.indexOf("\n\n")) >= 0) {
                handle(buffer.slice(0, cut));
                buffer = buffer.slice(cut + 2);
            }
        }
        if (buffer.trim()) handle(buffer);
    } catch (err) {
        if (err.name === "AbortError") throw err;
        throw Object.assign(new Error(err.message), { streamBroken: true });
    }
    if (!reply) throw Object.assign(new Error("Stream ended early"), { streamBroken: true });
    return reply;
}

/** feedback: { isHelpful?, rating?, comment? } */
export async function sendChatFeedback(messageId, feedback) {
    const { data } = await apiClient.post(`/api/ai/chat/messages/${messageId}/feedback/`, feedback);
    return data;
}
