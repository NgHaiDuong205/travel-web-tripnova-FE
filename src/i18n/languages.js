/**
 * Ngôn ngữ giao diện (hiện: tiếng Anh + tiếng Việt). Thêm ngôn ngữ: thêm dòng ở đây, thư mục locales/<code>/
 * và loader trong I18nContext.js.
 * `locale` dùng cho Intl (ngày giờ, tiền tệ), `label` là tên bản địa hiển thị trong menu. */
export const LANGUAGES = [
    { code: "en", label: "English", short: "EN", locale: "en-US" },
    { code: "vi", label: "Tiếng Việt", short: "VI", locale: "vi-VN" },
];

export const DEFAULT_LANGUAGE = "en";

export function findLanguage(code) {
    return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}

/** Chọn ngôn ngữ ban đầu: lựa chọn đã lưu → ngôn ngữ trình duyệt → tiếng Anh. */
export function detectLanguage(saved) {
    if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
    const candidates = typeof navigator !== "undefined" ? navigator.languages || [navigator.language] : [];
    for (const tag of candidates) {
        const base = String(tag || "").toLowerCase().split("-")[0];
        if (LANGUAGES.some((l) => l.code === base)) return base;
    }
    return DEFAULT_LANGUAGE;
}
