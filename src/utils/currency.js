import { getCurrentLocale } from "../i18n/currentLocale";

/**
 * Tiền hiển thị theo ngôn ngữ: BE lưu & thanh toán bằng USD (app.booking.currency);
 * giao diện tiếng Việt quy đổi sang VND chỉ để hiển thị / nhập bộ lọc.
 * Tỷ giá phải khớp VND_PER_USD trong BE db/import/import_vn_hotels.py.
 */
export const USD_TO_VND = Number(process.env.REACT_APP_USD_VND_RATE) || 26000;

export function displayCurrency() {
    return getCurrentLocale().startsWith("vi") ? "VND" : "USD";
}

/** Số tiền từ API (đơn vị `currency`) -> { amount, currency } để hiển thị. */
export function toDisplay(amount, currency = "USD") {
    const value = Number(amount ?? 0);
    if (currency === "USD" && displayCurrency() === "VND") {
        return { amount: Math.round((value * USD_TO_VND) / 1000) * 1000, currency: "VND" };
    }
    return { amount: value, currency };
}

/** Số người dùng nhập theo tiền hiển thị -> USD để so với giá từ API. */
export function fromDisplayToUsd(value) {
    const n = Number(value);
    return displayCurrency() === "VND" ? n / USD_TO_VND : n;
}
