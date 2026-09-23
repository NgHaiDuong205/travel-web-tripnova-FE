import { formatRoomStatus, getRoomStatusStyle } from "../../utils/roomUtils";

function RoomStatusBadge({ status, variant = "badge", className = "" }) {
    if (status == null || status === "") return null;

    const label = formatRoomStatus(status);
    const styles = getRoomStatusStyle(status);

    if (variant === "pill") {
        return (
            <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${styles.pill} ${className}`}
            >
                <span className={`w-2 h-2 rounded-full shrink-0 ${styles.dot}`} />
                {label}
            </span>
        );
    }

    return (
        <span
            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md ${styles.badge} ${className}`}
        >
            {label}
        </span>
    );
}

export default RoomStatusBadge;
