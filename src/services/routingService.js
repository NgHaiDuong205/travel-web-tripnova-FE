import apiClient from "../config/axiosConfig";

/** Đường đi thật (BE → OSRM) cho bản đồ lịch trình. */

const cache = new Map(); // khoá toạ độ → Promise<RouteDTO>
const MAX_CACHE = 200;

/**
 * points: [[lat, lng], …] theo thứ tự đi (2–25 điểm).
 * @returns { source: "osrm" | "none", distanceKm, durationMinutes, geometry: [[lat, lng], …] } — lỗi mạng / 429 → source "none".
 */
export function fetchRoute(points) {
    const key = points.map(([lat, lng]) => `${lat.toFixed(5)},${lng.toFixed(5)}`).join(";");
    if (cache.has(key)) return cache.get(key);
    const request = apiClient.post("/api/routing/route/", { points }, { timeout: 20000 })
        .then(({ data }) => data)
        .catch(() => {
            cache.delete(key); // lỗi tạm thời: lần sau thử lại
            return { source: "none", geometry: [] };
        });
    cache.set(key, request);
    if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value);
    return request;
}
