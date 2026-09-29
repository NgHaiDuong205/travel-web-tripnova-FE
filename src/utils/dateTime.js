/** Date -> "yyyy-MM-ddTHH:mm" (giờ địa phương) cho <input type="datetime-local"> và gửi BE (LocalDateTime). */
export function toLocalInputValue(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Thời điểm sau `days` ngày, vào lúc `hour`:00 (mặc định 10:00). */
export function localDateTimeFromToday(days, hour = 10) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, 0, 0, 0);
    return toLocalInputValue(date);
}

/** Số ngày tính tiền thuê: làm tròn lên theo 24 giờ, tối thiểu 1 (khớp BE CarBookingServiceImpl.rentalDays). */
export function rentalDaysBetween(from, to) {
    const ms = new Date(to) - new Date(from);
    if (!(ms > 0)) return 0;
    return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

/** BE nhận LocalDateTime có giây. */
export function withSeconds(value) {
    return value && value.length === 16 ? `${value}:00` : value;
}
