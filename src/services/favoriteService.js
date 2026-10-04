import apiClient from "../config/axiosConfig";

/*
 * Kho trạng thái yêu thích dùng chung cho mọi FavoriteButton: cả trang chỉ gọi 1 lần
 * GET /api/favorites/ids/ (thay vì /check/ cho từng card). addFavorite/removeFavorite
 * cập nhật kho nên các nút của cùng một mục (và trang Saved Trips) luôn đồng bộ.
 * Đổi tài khoản → kho được làm mới.
 */
const store = { userId: null, request: null, byKey: new Map(), listeners: new Set() };

const keyOf = (itemType, itemId) => `${itemType}:${itemId}`;

function emit() {
    store.listeners.forEach((listener) => listener());
}

/** Tải (1 lần cho mỗi user) danh sách yêu thích rút gọn vào kho. */
export function loadFavoriteIds(userId) {
    if (store.userId !== userId) {
        store.userId = userId;
        store.request = null;
        store.byKey = new Map();
    }
    if (!store.request) {
        const request = apiClient
            .get("/api/favorites/ids/")
            .then(({ data }) => {
                if (store.request !== request) return;
                store.byKey = new Map(data.map((f) => [keyOf(f.itemType, f.itemId), f.id]));
                emit();
            })
            .catch(() => {
                // lỗi mạng: cho phép lần mount sau thử lại
                if (store.request === request) store.request = null;
            });
        store.request = request;
    }
    return store.request;
}

/** @returns {string|null} id bản ghi yêu thích của mục, null nếu chưa lưu */
export function getFavoriteId(itemType, itemId) {
    return store.byKey.get(keyOf(itemType, itemId)) ?? null;
}

export function subscribeFavorites(listener) {
    store.listeners.add(listener);
    return () => store.listeners.delete(listener);
}

/** @param {"all"|"hotel"|"tour"|"car"|"flight"} [type] */
export async function fetchFavorites(type = "all") {
    const { data } = await apiClient.get("/api/favorites/", { params: { type } });
    return data;
}

export async function addFavorite(itemType, itemId) {
    const { data } = await apiClient.post("/api/favorites/", { itemType, itemId });
    store.byKey = new Map(store.byKey).set(keyOf(data.itemType, data.itemId), data.id);
    emit();
    return data;
}

export async function removeFavorite(favoriteId) {
    await apiClient.delete(`/api/favorites/${favoriteId}/`);
    const next = new Map(store.byKey);
    for (const [key, id] of next) {
        if (id === favoriteId) next.delete(key);
    }
    store.byKey = next;
    emit();
}

/** @returns {Promise<{favorited: boolean, favoriteId: string|null}>} */
export async function checkFavorite(itemType, itemId) {
    const { data } = await apiClient.get("/api/favorites/check/", { params: { itemType, itemId } });
    return data;
}
