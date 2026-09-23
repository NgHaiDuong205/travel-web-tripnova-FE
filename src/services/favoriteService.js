import apiClient from "../config/axiosConfig";

/** @param {"all"|"hotel"|"tour"|"car"|"flight"} [type] */
export async function fetchFavorites(type = "all") {
    const { data } = await apiClient.get("/api/favorites/", { params: { type } });
    return data;
}

export async function addFavorite(itemType, itemId) {
    const { data } = await apiClient.post("/api/favorites/", { itemType, itemId });
    return data;
}

export async function removeFavorite(favoriteId) {
    await apiClient.delete(`/api/favorites/${favoriteId}/`);
}

/** @returns {Promise<{favorited: boolean, favoriteId: string|null}>} */
export async function checkFavorite(itemType, itemId) {
    const { data } = await apiClient.get("/api/favorites/check/", { params: { itemType, itemId } });
    return data;
}
