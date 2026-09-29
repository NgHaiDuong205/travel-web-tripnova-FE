import apiClient from "../config/axiosConfig";

function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

/** action: khớp chính xác hoặc tiền tố (VD "hotels" khớp "hotels.update"); from/to = yyyy-MM-dd. */
export async function fetchAuditLogs({ userId, action, from, to, page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/audit-logs/", {
        params: {
            userId: userId || undefined,
            action: action || undefined,
            from: from || undefined,
            to: to || undefined,
            page,
            limit,
        },
    });
    return readList(response);
}

export async function fetchAuditActions() {
    const { data } = await apiClient.get("/api/admin/audit-logs/actions/");
    return data;
}

export async function fetchSearchQueries({ userId, q, from, to, page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/search-queries/", {
        params: {
            userId: userId || undefined,
            q: q || undefined,
            from: from || undefined,
            to: to || undefined,
            page,
            limit,
        },
    });
    return readList(response);
}

/** [{queryText, searches, users, clicks, zeroResults}] — mặc định 30 ngày gần nhất. */
export async function fetchTopSearchQueries({ from, to, limit = 20 } = {}) {
    const { data } = await apiClient.get("/api/admin/search-queries/top/", {
        params: { from: from || undefined, to: to || undefined, limit },
    });
    return data;
}

// ---------- ảnh khách sạn ----------
export async function fetchHotelImages(hotelId) {
    const { data } = await apiClient.get(`/api/admin/hotels/${hotelId}/images/`);
    return data;
}

/** @param {{url: string, caption?: string, sortOrder?: number}} payload */
export async function addHotelImage(hotelId, payload) {
    const { data } = await apiClient.post(`/api/admin/hotels/${hotelId}/images/`, payload);
    return data;
}

export async function updateHotelImage(hotelId, imageId, payload) {
    const { data } = await apiClient.put(`/api/admin/hotels/${hotelId}/images/${imageId}/`, payload);
    return data;
}

export async function setHotelCover(hotelId, imageId) {
    const { data } = await apiClient.post(`/api/admin/hotels/${hotelId}/images/${imageId}/cover/`);
    return data;
}

export async function deleteHotelImage(hotelId, imageId) {
    await apiClient.delete(`/api/admin/hotels/${hotelId}/images/${imageId}/`);
}
