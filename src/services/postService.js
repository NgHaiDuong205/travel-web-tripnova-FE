import apiClient from "../config/axiosConfig";

function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

/** Fetch posts. */
export async function fetchPosts({ entityType, entityId, userId, q, rating, sort, page = 1, limit = 10 } = {}) {
    const response = await apiClient.get("/api/posts/", {
        params: {
            entityType: entityType || undefined,
            entityId: entityId || undefined,
            userId: userId || undefined,
            q: q || undefined,
            rating: rating || undefined,
            sort: sort || undefined,
            page: page || undefined,
            limit: limit || undefined,
        },
    });
    return readList(response);
}

/** Fetch a post rating summary. */
export async function fetchRatingSummary(entityType, entityId) {
    const { data } = await apiClient.get("/api/posts/rating-summary/", {
        params: { entityType: entityType || undefined, entityId: entityId || undefined },
    });
    return data;
}

/** Fetch one post. */
export async function fetchPost(postId) {
    const { data } = await apiClient.get(`/api/posts/${postId}/`);
    return data;
}

/** Create a post. */
export async function createPost(body) {
    const { data } = await apiClient.post("/api/posts/", body);
    return data;
}

/** Update a post. */
export async function updatePost(postId, body) {
    const { data } = await apiClient.put(`/api/posts/${postId}/`, body);
    return data;
}

/** Delete a post. */
export async function deletePost(postId) {
    await apiClient.delete(`/api/posts/${postId}/`);
}

/** React to a post. */
export async function reactToPost(postId, type) {
    const { data } = await apiClient.post(`/api/posts/${postId}/reactions/`, { type });
    return data;
}

/** Remove a post reaction. */
export async function removePostReaction(postId) {
    const { data } = await apiClient.delete(`/api/posts/${postId}/reactions/`);
    return data;
}

/** Fetch post comments. */
export async function fetchComments(postId) {
    const { data } = await apiClient.get(`/api/posts/${postId}/comments/`);
    return data;
}

/** Create a comment. */
export async function createComment(postId, { content, parentId }) {
    const { data } = await apiClient.post(`/api/posts/${postId}/comments/`, { content, parentId });
    return data;
}

/** Update a comment. */
export async function updateComment(commentId, content) {
    const { data } = await apiClient.put(`/api/comments/${commentId}/`, { content });
    return data;
}

/** Delete a comment. */
export async function deleteComment(commentId) {
    await apiClient.delete(`/api/comments/${commentId}/`);
}

/** Fetch the current user's posts. */
export async function fetchMyPosts({ status, page = 1, limit = 10 } = {}) {
    const response = await apiClient.get("/api/me/posts/", {
        params: { status: status || undefined, page: page || undefined, limit: limit || undefined },
    });
    return readList(response);
}

export const POST_STATUS_LABELS = {
    pending: { label: "Pending review", className: "bg-amber-50 text-amber-700 border-amber-200" },
    approved: { label: "Published", className: "bg-green-50 text-green-700 border-green-200" },
    rejected: { label: "Rejected", className: "bg-red-50 text-red-600 border-red-200" },
};

export const POST_SORTS = [
    { value: "newest", label: "Newest" },
    { value: "top", label: "Most helpful" },
    { value: "rating_high", label: "Highest rating" },
    { value: "rating_low", label: "Lowest rating" },
    { value: "oldest", label: "Oldest" },
];
