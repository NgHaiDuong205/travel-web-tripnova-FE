/** Chuẩn hóa nhãn status từ BE (enum, string) */
export function formatRoomStatus(status) {
    if (status == null || status === "") return "";
    const raw = String(status).trim();
    if (!raw) return "";
    return raw
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

const STATUS_STYLES = {
    available: {
        badge: "bg-emerald-600 text-white",
        pill: "bg-emerald-50 text-emerald-800 border-emerald-200",
        dot: "bg-emerald-500",
    },
    vacant: {
        badge: "bg-emerald-600 text-white",
        pill: "bg-emerald-50 text-emerald-800 border-emerald-200",
        dot: "bg-emerald-500",
    },
    occupied: {
        badge: "bg-red-600 text-white",
        pill: "bg-red-50 text-red-800 border-red-200",
        dot: "bg-red-500",
    },
    booked: {
        badge: "bg-red-600 text-white",
        pill: "bg-red-50 text-red-800 border-red-200",
        dot: "bg-red-500",
    },
    reserved: {
        badge: "bg-amber-600 text-white",
        pill: "bg-amber-50 text-amber-900 border-amber-200",
        dot: "bg-amber-500",
    },
    maintenance: {
        badge: "bg-slate-600 text-white",
        pill: "bg-slate-100 text-slate-800 border-slate-200",
        dot: "bg-slate-500",
    },
    cleaning: {
        badge: "bg-sky-600 text-white",
        pill: "bg-sky-50 text-sky-900 border-sky-200",
        dot: "bg-sky-500",
    },
    unavailable: {
        badge: "bg-red-600 text-white",
        pill: "bg-red-50 text-red-800 border-red-200",
        dot: "bg-red-500",
    },
};

const DEFAULT_STYLE = {
    badge: "bg-primary text-on-primary",
    pill: "bg-surface-container-low text-on-surface-variant border-outline-variant/30",
    dot: "bg-on-surface-variant",
};

export function getRoomStatusStyle(status) {
    const key = String(status ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
    return STATUS_STYLES[key] ?? DEFAULT_STYLE;
}
