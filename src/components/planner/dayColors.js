/** Màu theo ngày (lặp lại sau 7 ngày). Hex viết cứng vì còn dùng trong HTML ghim Leaflet, không qua Tailwind. */
export const DAY_COLORS = ["#2563eb", "#db2777", "#16a34a", "#ea580c", "#7c3aed", "#0891b2", "#ca8a04"];

export function dayColor(day) {
    return DAY_COLORS[(Math.max(1, day) - 1) % DAY_COLORS.length];
}
