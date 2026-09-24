import { useCallback, useEffect, useState } from "react";
import FormAlert from "../common/FormAlert";
import { fetchRoomAvailability, updateRoomAvailability } from "../../services/adminHotelService";
import { formatDate, isoDateFromToday } from "../../utils/formatters";

const inputClass = "rounded-lg border-gray-200 text-sm";

/** Xem & khoá/mở ngày của 1 phòng. Ngày booked do khách đặt, không khoá/mở được ở đây. */
function RoomAvailabilityPanel({ room }) {
    const [range, setRange] = useState({ from: isoDateFromToday(0), to: isoDateFromToday(60) });
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ from: isoDateFromToday(1), to: isoDateFromToday(1), reason: "" });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setDays(await fetchRoomAvailability(room.id, range.from, range.to));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [room.id, range]);

    useEffect(() => {
        load();
    }, [load]);

    const apply = async (status) => {
        setBusy(true);
        setError("");
        try {
            await updateRoomAvailability(room.id, { from: form.from, to: form.to, status, reason: form.reason || undefined });
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap items-end gap-3">
                <p className="font-bold text-sm mr-auto">Lịch phòng {room.roomNumber}</p>
                <label className="text-xs font-bold text-gray-600">
                    Xem từ <input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} className={inputClass} />
                </label>
                <label className="text-xs font-bold text-gray-600">
                    đến <input type="date" value={range.to} min={range.from} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} className={inputClass} />
                </label>
            </div>

            {loading ? (
                <p className="text-sm text-gray-500">Đang tải...</p>
            ) : days.length === 0 ? (
                <p className="text-sm text-gray-500">Phòng trống toàn bộ khoảng này.</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {days.map((d) => (
                        <span
                            key={d.date}
                            title={d.reason || ""}
                            className={`text-xs font-bold px-2 py-1 rounded border ${
                                d.status === "booked" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-red-50 text-red-600 border-red-200"
                            }`}
                        >
                            {formatDate(d.date)} · {d.status}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-end gap-3 border-t border-gray-200 pt-4">
                <label className="text-xs font-bold text-gray-600">
                    Từ <input type="date" value={form.from} onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))} className={inputClass} />
                </label>
                <label className="text-xs font-bold text-gray-600">
                    Đến (tính cả ngày này) <input type="date" value={form.to} min={form.from} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} className={inputClass} />
                </label>
                <input
                    value={form.reason}
                    maxLength={200}
                    onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                    placeholder="Lý do (tuỳ chọn)"
                    className={`${inputClass} flex-1 min-w-[160px]`}
                />
                <button type="button" disabled={busy} onClick={() => apply("blocked")} className="px-3 py-2 rounded-lg text-xs font-bold bg-red-600 text-white disabled:opacity-50">
                    Block
                </button>
                <button type="button" disabled={busy} onClick={() => apply("available")} className="px-3 py-2 rounded-lg text-xs font-bold border border-green-300 text-green-700 disabled:opacity-50">
                    Unblock
                </button>
            </div>
            <FormAlert>{error}</FormAlert>
        </div>
    );
}

export default RoomAvailabilityPanel;
