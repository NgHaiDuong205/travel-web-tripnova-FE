import apiClient from "../config/axiosConfig";

function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

/** Fetch the current user's itineraries. */
export async function fetchMyItineraries({ page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/me/itineraries/", { params: { page, limit } });
    return readList(response);
}

/** Fetch one itinerary. */
export async function fetchItinerary(id) {
    const { data } = await apiClient.get(`/api/me/itineraries/${id}/`);
    return data;
}

/** Create an itinerary. */
export async function createItinerary(body) {
    const { data } = await apiClient.post("/api/me/itineraries/", body);
    return data;
}

/** Update an itinerary. */
export async function updateItinerary(id, body) {
    const { data } = await apiClient.put(`/api/me/itineraries/${id}/`, body);
    return data;
}

/** Delete an itinerary. */
export async function deleteItinerary(id) {
    await apiClient.delete(`/api/me/itineraries/${id}/`);
}

/** Add an item to an itinerary. */
export async function addItineraryItem(id, body) {
    const { data } = await apiClient.post(`/api/me/itineraries/${id}/items/`, body);
    return data;
}

/** Delete an itinerary item. */
/** Sửa hoạt động (ghi đè toàn bộ); trả về lịch trình đầy đủ. */
export async function updateItineraryItem(id, itemId, body) {
    const { data } = await apiClient.put(`/api/me/itineraries/${id}/items/${itemId}/`, body);
    return data;
}

export async function deleteItineraryItem(id, itemId) {
    await apiClient.delete(`/api/me/itineraries/${id}/items/${itemId}/`);
}

export const ITINERARY_STATUS_LABELS = {
    draft: { label: "Draft", className: "bg-gray-50 text-gray-700 border-gray-200" },
    saved: { label: "Saved", className: "bg-blue-50 text-blue-700 border-blue-200" },
    booked: { label: "Booked", className: "bg-green-50 text-green-700 border-green-200" },
};

export const ITEM_TYPES = [
    { value: "landmark", label: "Sightseeing", icon: "photo_camera" },
    { value: "hotel", label: "Hotel", icon: "hotel" },
    { value: "restaurant", label: "Food & drink", icon: "restaurant" },
    { value: "activity", label: "Activity", icon: "hiking" },
    { value: "transport", label: "Transport", icon: "directions_car" },
    { value: "destination", label: "Destination", icon: "location_on" },
    { value: "other", label: "Other", icon: "more_horiz" },
];

/** Địa danh / khách sạn của điểm đến để gắn vào hoạt động: [{id, name}]. */
export async function fetchLinkOptions(destinationId, type) {
    if (!destinationId || (type !== "landmark" && type !== "hotel")) return [];
    const { data } =
        type === "landmark"
            ? await apiClient.get(`/api/destinations/${destinationId}/landmarks/`)
            : await apiClient.get("/api/hotels/", { params: { destinationId, page: 1, limit: 100 } });
    return data.map((x) => ({ id: x.id, name: x.name }));
}
