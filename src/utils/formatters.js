import { getCurrentLocale } from "../i18n/currentLocale";
import { toDisplay } from "./currency";

/** Định dạng tiền tệ theo mã ISO (USD, VND...); tiếng Việt hiển thị USD đã quy đổi sang VND. */
export function formatMoney(amount, sourceCurrency = "USD") {
    const { amount: value, currency } = toDisplay(amount, sourceCurrency || "USD");
    try {
        return new Intl.NumberFormat(getCurrentLocale(), {
            style: "currency",
            currency,
            maximumFractionDigits: currency === "VND" ? 0 : 2,
        }).format(value);
    } catch {
        return `${value.toLocaleString()} ${currency}`;
    }
}

/** "2027-01-10" -> "10 Jan 2027" (theo ngôn ngữ đang chọn) */
export function formatDate(value) {
    if (!value) return "";
    const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(getCurrentLocale(), { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(getCurrentLocale(), {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/** Ngày dạng YYYY-MM-DD theo giờ máy, cộng thêm `days` ngày. */
export function isoDateFromToday(days = 0) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function nightsBetween(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut) - new Date(checkIn);
    return diff > 0 ? Math.round(diff / 86400000) : 0;
}
