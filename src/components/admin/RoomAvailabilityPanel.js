import { useCallback, useEffect, useState } from "react";
import FormAlert from "../common/FormAlert";
import { useHotelApi } from "../../context/HotelApiContext";
import { formatDate, isoDateFromToday } from "../../utils/formatters";
import { useT } from "../../i18n/I18nContext";

const inputClass = "rounded-lg border border-gray-300 px-2 py-1.5 text-sm";

/** Xem & khoá/mở ngày của 1 phòng. Ngày booked do khách đặt, không khoá/mở được ở đây. */
function RoomAvailabilityPanel({ room }) {
    const t = useT();
    const api = useHotelApi();
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
            setDays(await api.fetchRoomAvailability(room.id, range.from, range.to));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [api, room.id, range]);

    useEffect(() => {
        load();
    }, [load]);

    const apply = async (status) => {
        setBusy(true);
        setError("");
        try {
            await api.updateRoomAvailability(room.id, { from: form.from, to: form.to, status, reason: form.reason || undefined });
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
                <p className="font-bold text-sm mr-auto">{t("admin.availability.roomCalendar", { room: room.roomNumber })}</p>
                <label className="text-xs font-bold text-gray-600">
                    {t("admin.availability.viewFrom")} <input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} className={inputClass} />
                </label>
                <label className="text-xs font-bold text-gray-600">
                    {t("common.fields.to")} <input type="date" value={range.to} min={range.from} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} className={inputClass} />
                </label>
            </div>

            {loading ? (
                <p className="text-sm text-gray-500">{t("common.state.loading")}</p>
            ) : days.length === 0 ? (
                <p className="text-sm text-gray-500">{t("admin.availability.allAvailable")}</p>
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
                            {formatDate(d.date)} · {t(`admin.status.${d.status}`, { defaultValue: d.status })}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-end gap-3 border-t border-gray-200 pt-4">
                <label className="text-xs font-bold text-gray-600">
                    {t("common.fields.from")} <input type="date" value={form.from} onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))} className={inputClass} />
                </label>
                <label className="text-xs font-bold text-gray-600">
                    {t("admin.availability.toInclusive")} <input type="date" value={form.to} min={form.from} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} className={inputClass} />
                </label>
                <input
                    value={form.reason}
                    maxLength={200}
                    onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                    placeholder={t("admin.availability.reasonOptional")}
                    className={`${inputClass} flex-1 min-w-[160px]`}
                />
                <button type="button" disabled={busy} onClick={() => apply("blocked")} className="px-3 py-2 rounded-lg text-xs font-bold bg-red-600 text-white disabled:opacity-50">
                    {t("admin.availability.block")}
                </button>
                <button type="button" disabled={busy} onClick={() => apply("available")} className="px-3 py-2 rounded-lg text-xs font-bold border border-green-300 text-green-700 disabled:opacity-50">
                    {t("admin.availability.unblock")}
                </button>
            </div>
            <FormAlert>{error}</FormAlert>
        </div>
    );
}

export default RoomAvailabilityPanel;
