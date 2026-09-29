import { formatDuration } from "../../services/flightService";

const timeOf = (iso) => (iso ? iso.slice(11, 16) : "");
/** "Mon, 12 Oct" */
export const flightDateLabel = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }) : "";

/** Logo hãng bay; không có ảnh thì hiện 2 chữ cái đầu. */
export function AirlineLogo({ flight, size = "w-16 h-16" }) {
    if (flight.airlineLogoUrl) {
        return (
            <img src={flight.airlineLogoUrl} alt={flight.airline} className={`${size} object-contain rounded-lg bg-white p-2`} />
        );
    }
    // Mã hãng trong số hiệu chuyến (VN123 -> VN) phân biệt tốt hơn chữ cái đầu (Vietjet / Vietnam Airlines đều là "VA").
    const code = (flight.flightNumber || "").match(/^[A-Z0-9]{2}(?=\d)/)?.[0];
    const initials =
        code ||
        flight.airline
            .split(/\s+/)
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    return (
        <div
            className={`${size} rounded-lg editorial-gradient text-white font-headline font-bold flex items-center justify-center`}
        >
            {initials}
        </div>
    );
}

/** Dòng giờ đi — đường bay — giờ đến (dùng chung cho danh sách và trang chi tiết). */
export function FlightTimeline({ flight, compact = false }) {
    return (
        <div className="flex items-center gap-4 flex-1 min-w-0">
            <div>
                <div className={`font-headline font-extrabold text-on-surface ${compact ? "text-xl" : "text-3xl"}`}>
                    {timeOf(flight.departureTime)}
                </div>
                <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    {flight.departureAirportCode}
                    {!compact && flight.departureCity ? ` · ${flight.departureCity}` : ""}
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center min-w-[80px]">
                <div className="text-xs font-bold text-on-surface-variant">{formatDuration(flight.durationMinutes)}</div>
                <div className="relative w-full flex items-center my-1">
                    <div className="h-px flex-1 bg-outline-variant" />
                    <span className="material-symbols-outlined text-primary text-lg mx-1 rotate-90">flight</span>
                    <div className="h-px flex-1 bg-outline-variant" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-green-700">Non-stop</div>
            </div>
            <div className="text-right">
                <div className={`font-headline font-extrabold text-on-surface ${compact ? "text-xl" : "text-3xl"}`}>
                    {timeOf(flight.arrivalTime)}
                </div>
                <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    {flight.arrivalAirportCode}
                    {!compact && flight.arrivalCity ? ` · ${flight.arrivalCity}` : ""}
                </div>
            </div>
        </div>
    );
}
