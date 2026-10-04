/**
 * Locale Intl đang dùng — tách khỏi React để các hàm thuần (utils/formatters) đọc được.
 * I18nProvider cập nhật giá trị này trước khi render lại cây component.
 */
let currentLocale = "en-US";

export function getCurrentLocale() {
    return currentLocale;
}

export function setCurrentLocale(locale) {
    currentLocale = locale;
}
