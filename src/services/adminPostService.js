import apiClient from "../config/axiosConfig";

function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

/** Fetch admin posts. */
export async function fetchAdminPosts({ status, entityType, q, sort, page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/posts/", {
        params: {
            status: status || undefined,
            entityType: entityType || undefined,
            q: q || undefined,
            sort: sort || undefined,
            page: page || undefined,
            limit: limit || undefined,
        },
    });
    return readList(response);
}

/** Update an admin post status. */
export async function updateAdminPostStatus(postId, status) {
    const { data } = await apiClient.put(`/api/admin/posts/${postId}/status/`, { status });
    return data;
}

/** Delete an admin post. */
export async function deleteAdminPost(postId) {
    await apiClient.delete(`/api/admin/posts/${postId}/`);
}

/** Fetch admin post comments. */
export async function fetchAdminPostComments(postId) {
    const { data } = await apiClient.get(`/api/admin/posts/${postId}/comments/`);
    return data;
}

/** Fetch admin comments. */
export async function fetchAdminComments({ status, postId, q, page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/comments/", {
        params: {
            status: status || undefined,
            postId: postId || undefined,
            q: q || undefined,
            page: page || undefined,
            limit: limit || undefined,
        },
    });
    return readList(response);
}

/** Update an admin comment status. */
export async function updateAdminCommentStatus(commentId, status) {
    const { data } = await apiClient.put(`/api/admin/comments/${commentId}/status/`, { status });
    return data;
}

/** Delete an admin comment. */
export async function deleteAdminComment(commentId) {
    await apiClient.delete(`/api/admin/comments/${commentId}/`);
}

export const COMMENT_STATUS_LABELS = {
    active: { label: "Visible", className: "bg-green-50 text-green-700 border-green-200" },
    flagged: { label: "Hidden", className: "bg-amber-50 text-amber-700 border-amber-200" },
    deleted: { label: "Deleted", className: "bg-gray-50 text-gray-600 border-gray-200" },
};
