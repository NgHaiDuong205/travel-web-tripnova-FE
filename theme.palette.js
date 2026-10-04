/**
 * Bảng màu sáng / tối cho Tailwind.
 *
 * Mọi màu (token thiết kế + bảng màu mặc định của Tailwind) được khai báo bằng biến CSS
 * dạng "r g b" → class cũ (bg-white, text-gray-500, text-primary...) tự đổi màu khi <html> có class `dark`,
 * không phải sửa từng trang. Modifier độ trong (bg-primary/20) vẫn dùng được nhờ `<alpha-value>`.
 *
 * Nguyên tắc dark mode:
 *  - Nền / viền (shade nhạt 50–300, surface-*) chuyển thành tông tối.
 *  - Chữ đậm (shade 600–900, on-surface, primary) chuyển thành tông sáng.
 *  - Nền đậm (bg-*-500..900, bg-primary) giữ độ đậm để chữ trắng trên nút vẫn đọc được,
 *    nên backgroundColor có bộ biến riêng (`--bg-*`).
 */
const twColors = require("tailwindcss/colors");

// Token thiết kế (Material 3) — [sáng, tối]
const TOKENS = {
    "surface-tint": ["#375ca8", "#b0c6ff"],
    "on-secondary-container": ["#002a52", "#d4e3ff"],
    "on-primary-fixed": ["#001945", "#d9e2ff"],
    "on-secondary": ["#ffffff", "#ffffff"],
    "inverse-on-surface": ["#f2f0f0", "#2e3036"],
    "tertiary-container": ["#493700", "#3d2e00"],
    "surface-container-high": ["#eae8e7", "#272a30"],
    "tertiary-fixed-dim": ["#f5bf00", "#f5bf00"],
    "error-container": ["#ffdad6", "#5c1a16"],
    "surface-bright": ["#fbf9f8", "#373a40"],
    "surface-dim": ["#dcd9d9", "#111318"],
    "on-secondary-fixed-variant": ["#004784", "#a4c8ff"],
    "on-error-container": ["#93000a", "#ffdad6"],
    "surface-container": ["#f0eded", "#1d2025"],
    "secondary-container": ["#1f92ff", "#004784"],
    "outline": ["#747782", "#8e9099"],
    "on-primary-fixed-variant": ["#1a438e", "#b0c6ff"],
    "surface-container-low": ["#f5f3f3", "#191c21"],
    "secondary-fixed-dim": ["#a4c8ff", "#3c6aa8"],
    "on-secondary-fixed": ["#001c3a", "#d4e3ff"],
    "outline-variant": ["#c4c6d3", "#43474e"],
    "on-tertiary-fixed-variant": ["#594400", "#f5bf00"],
    "surface-container-highest": ["#e4e2e1", "#32353b"],
    "tertiary-fixed": ["#ffdf95", "#4a3800"],
    "on-error": ["#ffffff", "#690005"],
    "primary-fixed": ["#d9e2ff", "#243e70"],
    "on-tertiary": ["#ffffff", "#3f2e00"],
    "on-surface-variant": ["#434651", "#c4c6d0"],
    "primary-fixed-dim": ["#b0c6ff", "#3a5a99"],
    "background": ["#fbf9f8", "#111318"],
    "tertiary": ["#2f2200", "#f5bf00"],
    "on-primary": ["#ffffff", "#ffffff"],
    "on-tertiary-container": ["#ca9d00", "#ffdf95"],
    "on-primary-container": ["#7fa1f2", "#d9e2ff"],
    "surface-container-lowest": ["#ffffff", "#0c0e13"],
    "error": ["#ba1a1a", "#ffb4ab"],
    "on-background": ["#1b1c1c", "#e2e2e9"],
    "secondary-fixed": ["#d4e3ff", "#1d3b63"],
    "primary": ["#002155", "#b0c6ff"],
    "surface": ["#fbf9f8", "#111318"],
    "primary-container": ["#003580", "#d9e2ff"],
    "on-surface": ["#1b1c1c", "#e2e2e9"],
    "inverse-surface": ["#303030", "#e2e2e9"],
    "on-tertiary-fixed": ["#251a00", "#ffdf95"],
    "surface-variant": ["#e4e2e1", "#43474e"],
    "secondary": ["#005fad", "#a4c8ff"],
    "inverse-primary": ["#b0c6ff", "#375ca8"],
};

// Token dùng làm NỀN cần giữ đậm trong dark mode (chữ trắng / on-primary nằm trên)
const TOKEN_BG_OVERRIDES = {
    "primary": ["#002155", "#2f5fb8"],
    "primary-container": ["#003580", "#1a438e"],
    "secondary": ["#005fad", "#2a6fc0"],
    "tertiary": ["#2f2200", "#5c4600"],
    "error": ["#ba1a1a", "#b3261e"],
    "inverse-surface": ["#303030", "#e2e2e9"],
};

const HUES = ["slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow", "lime", "green",
    "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"];
const SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
const NEUTRALS = new Set(["slate", "gray", "zinc", "neutral", "stone"]);

const DARK_BASE = "#111318"; // = surface (tối)
const WHITE_BG_DARK = "#1b1e24"; // bg-white (thẻ, ô nhập) trong dark mode

function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const triplet = (hex) => hexToRgb(hex).join(" ");
function mix(hexA, hexB, weightA) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    return a.map((v, i) => Math.round(v * weightA + b[i] * (1 - weightA))).join(" ");
}

/** Màu của shade trong dark mode (dùng cho chữ / viền / nền nhạt). */
function darkShade(hue, shade) {
    const p = twColors[hue];
    if (NEUTRALS.has(hue)) {
        // Đảo thang xám, neo vào bề mặt tối của thiết kế
        const map = {
            "50": "#1a1d23", "100": "#23262d", "200": "#30343c", "300": "#454a54", "400": "#7c828d",
            "500": "#9aa0aa", "600": "#b3b8c1", "700": "#cdd1d8", "800": "#e1e4e9", "900": "#f1f3f5", "950": "#f8f9fa",
        };
        return triplet(map[shade]);
    }
    switch (shade) {
        case "50": return mix(p["500"], DARK_BASE, 0.12);
        case "100": return mix(p["500"], DARK_BASE, 0.2);
        case "200": return mix(p["500"], DARK_BASE, 0.32);
        case "300": return mix(p["500"], DARK_BASE, 0.45);
        case "600": return triplet(p["400"]);
        case "700": return triplet(p["300"]);
        case "800": return triplet(p["200"]);
        case "900": return triplet(p["100"]);
        case "950": return triplet(p["50"]);
        default: return triplet(p[shade]); // 400, 500 giữ nguyên
    }
}

/** Nền đậm (500+) giữ nguyên để nút chữ trắng vẫn đủ tương phản; nền nhạt dùng như chữ/viền. */
function darkBgShade(hue, shade) {
    if (["500", "600", "700", "800", "900", "950"].includes(shade)) {
        return NEUTRALS.has(hue) ? darkShade(hue, shade) : triplet(twColors[hue][shade]);
    }
    return darkShade(hue, shade);
}

const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

function buildTheme() {
    const colors = {};
    const backgroundColor = { white: v("bg-white") };
    Object.keys(TOKENS).forEach((token) => {
        colors[token] = v(`c-${token}`);
    });
    Object.keys(TOKEN_BG_OVERRIDES).forEach((token) => {
        backgroundColor[token] = v(`bg-${token}`);
    });
    HUES.forEach((hue) => {
        colors[hue] = {};
        backgroundColor[hue] = {};
        SHADES.forEach((shade) => {
            colors[hue][shade] = v(`tw-${hue}-${shade}`);
            backgroundColor[hue][shade] = v(`bg-${hue}-${shade}`);
        });
    });
    return { colors, backgroundColor };
}

function buildVars() {
    const light = { "--bg-white": "255 255 255" };
    const dark = { "--bg-white": triplet(WHITE_BG_DARK) };
    Object.entries(TOKENS).forEach(([token, [l, d]]) => {
        light[`--c-${token}`] = triplet(l);
        dark[`--c-${token}`] = triplet(d);
    });
    Object.entries(TOKEN_BG_OVERRIDES).forEach(([token, [l, d]]) => {
        light[`--bg-${token}`] = triplet(l);
        dark[`--bg-${token}`] = triplet(d);
    });
    HUES.forEach((hue) => {
        SHADES.forEach((shade) => {
            const lightValue = triplet(twColors[hue][shade]);
            light[`--tw-${hue}-${shade}`] = lightValue;
            light[`--bg-${hue}-${shade}`] = lightValue;
            dark[`--tw-${hue}-${shade}`] = darkShade(hue, shade);
            dark[`--bg-${hue}-${shade}`] = darkBgShade(hue, shade);
        });
    });
    return { light, dark };
}

/** Plugin Tailwind: khai báo biến màu cho :root (sáng) và html.dark (tối). */
function themeVarsPlugin({ addBase }) {
    const { light, dark } = buildVars();
    addBase({
        ":root": { ...light, colorScheme: "light" },
        "html.dark": { ...dark, colorScheme: "dark" },
    });
}

module.exports = { buildTheme, themeVarsPlugin };
