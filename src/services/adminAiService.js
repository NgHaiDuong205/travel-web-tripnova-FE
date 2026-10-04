import apiClient from "../config/axiosConfig";

/** Quản trị trợ lý AI (/api/admin/ai/*): kho tài liệu RAG và phiên chat của khách. */

function withTotal(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

function clean(params) {
    return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined));
}

export async function fetchKnowledgeDocuments({ q, sourceType, language, active, page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/ai/knowledge-documents/", {
        params: clean({ q, sourceType, language, active, page, limit }),
    });
    return withTotal(response);
}

/** fields: { file, title?, sourceType, sourceId?, language, url? } */
export async function uploadKnowledgeDocument({ file, title, sourceType, sourceId, language, url }) {
    const form = new FormData();
    form.append("file", file);
    Object.entries(clean({ title, sourceType, sourceId, language, url })).forEach(([k, v]) => form.append(k, v));
    const { data } = await apiClient.post("/api/admin/ai/knowledge-documents/", form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
    });
    return data;
}

export async function setKnowledgeDocumentActive(id, isActive) {
    const { data } = await apiClient.patch(`/api/admin/ai/knowledge-documents/${id}/`, { isActive });
    return data;
}

export async function deleteKnowledgeDocument(id) {
    await apiClient.delete(`/api/admin/ai/knowledge-documents/${id}/`);
}

/** full = false: chỉ tài liệu lập chỉ mục bằng model embedding cũ. */
export async function reindexKnowledge(full = false) {
    const { data } = await apiClient.post("/api/admin/ai/jobs/reindex/", null, { params: { full }, timeout: 300000 });
    return data;
}

export async function fetchAdminChatSessions({ userId, q, from, to, page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/ai/chat-sessions/", {
        params: clean({ userId, q, from, to, page, limit }),
    });
    return withTotal(response);
}

export async function fetchAdminChatMessages(sessionId) {
    const { data } = await apiClient.get(`/api/admin/ai/chat-sessions/${sessionId}/messages/`);
    return data;
}
