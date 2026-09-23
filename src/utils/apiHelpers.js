/** Chuẩn hóa danh sách từ Spring Page hoặc mảng thuần */
export function unwrapListResponse(data) {
    if (!data) {
        return { items: [], total: 0, page: 1, totalPages: 1, limit: 10 };
    }

    if (Array.isArray(data)) {
        return {
            items: data,
            total: data.length,
            page: 1,
            totalPages: 1,
            limit: data.length,
        };
    }

    const items =
        data.content ??
        data.items ??
        data.data ??
        data.results ??
        data.hotels ??
        [];

    const total =
        data.totalElements ??
        data.total ??
        data.count ??
        items.length;

    const limit = data.size ?? data.limit ?? (items.length || 10);
    const page =
        data.number != null
            ? data.number + 1
            : data.page ?? data.currentPage ?? 1;

    const totalPages =
        data.totalPages ??
        data.total_pages ??
        (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);

    return { items, total, page, totalPages, limit };
}

export function pickField(obj, ...keys) {
    for (const key of keys) {
        if (obj[key] != null && obj[key] !== "") return obj[key];
    }
    return undefined;
}
