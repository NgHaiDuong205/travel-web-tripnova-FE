import { Fragment, useCallback, useEffect, useState } from "react";
import FormAlert from "../common/FormAlert";
import RoomAvailabilityPanel from "./RoomAvailabilityPanel";
import { ROOM_STATUSES, deleteAdminRoom, fetchAdminRooms, saveAdminRoom } from "../../services/adminHotelService";

const inputClass = "rounded-lg border-gray-200 text-sm";

const STATUS_STYLES = {
    available: "text-green-700",
    occupied: "text-blue-700",
    maintenance: "text-amber-600",
};

function RoomRowForm({ initial, roomTypes, onSave, onCancel }) {
    const [form, setForm] = useState(initial);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await onSave({ ...form, floor: form.floor === "" || form.floor === null ? null : Number(form.floor) });
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 bg-blue-50/40 border border-blue-100 rounded-xl p-3">
            <label className="text-xs font-bold text-gray-600">
                Room no. *
                <input required maxLength={10} value={form.roomNumber} onChange={set("roomNumber")} className={`${inputClass} block w-24`} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Floor
                <input type="number" min={-5} max={200} value={form.floor ?? ""} onChange={set("floor")} className={`${inputClass} block w-20`} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Room type *
                <select required value={form.roomTypeId} onChange={set("roomTypeId")} className={`${inputClass} block`}>
                    <option value="">—</option>
                    {roomTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>{rt.name}{rt.isActive ? "" : " (hidden)"}</option>
                    ))}
                </select>
            </label>
            <label className="text-xs font-bold text-gray-600">
                Status
                <select value={form.status} onChange={set("status")} className={`${inputClass} block`}>
                    {ROOM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </label>
            <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg text-xs font-bold text-gray-500">Cancel</button>
            {error && <div className="w-full"><FormAlert>{error}</FormAlert></div>}
        </form>
    );
}

/** Danh sách + thêm/sửa/xoá phòng, mở lịch khoá ngày cho từng phòng. */
function RoomManager({ hotelId, roomTypes, onChanged }) {
    const [filterType, setFilterType] = useState("");
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // null | "new" | roomId
    const [calendarId, setCalendarId] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setRooms(await fetchAdminRooms(hotelId, filterType));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [hotelId, filterType]);

    useEffect(() => {
        load();
    }, [load, roomTypes]);

    const handleSave = async (roomId, payload) => {
        await saveAdminRoom(hotelId, roomId, payload);
        setEditing(null);
        await load();
        await onChanged();
    };

    const handleDelete = async (room) => {
        if (!window.confirm(`Xoá phòng ${room.roomNumber}? Chỉ xoá được phòng chưa từng được đặt.`)) return;
        setBusyId(room.id);
        setError("");
        try {
            await deleteAdminRoom(hotelId, room.id);
            await load();
            await onChanged();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const newRoom = { roomNumber: "", floor: "", roomTypeId: filterType || roomTypes.find((rt) => rt.isActive)?.id || "", status: "available" };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-extrabold text-primary mr-auto">Rooms</h2>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={inputClass}>
                    <option value="">All room types</option>
                    {roomTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                </select>
                {editing !== "new" && roomTypes.length > 0 && (
                    <button type="button" onClick={() => setEditing("new")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-200 text-primary hover:bg-blue-50">
                        <span className="material-symbols-outlined text-base">add</span>
                        Add room
                    </button>
                )}
            </div>
            <p className="text-xs text-gray-500">Phòng đã từng có booking không xoá được — chuyển sang <b>maintenance</b> để ngừng cho đặt.</p>
            <FormAlert>{error}</FormAlert>

            {editing === "new" && (
                <RoomRowForm initial={newRoom} roomTypes={roomTypes} onSave={(p) => handleSave(null, p)} onCancel={() => setEditing(null)} />
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[640px]">
                    <thead className="bg-gray-50">
                        <tr className="text-xs uppercase text-gray-500">
                            <th className="px-3 py-2">Room</th>
                            <th className="px-3 py-2">Floor</th>
                            <th className="px-3 py-2">Room type</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">Đang tải...</td></tr>}
                        {!loading && rooms.length === 0 && (
                            <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">Chưa có phòng nào.</td></tr>
                        )}
                        {!loading &&
                            rooms.map((room) => (
                                <Fragment key={room.id}>
                                    {editing === room.id ? (
                                        <tr className="border-t border-gray-100">
                                            <td colSpan={5} className="px-3 py-2">
                                                <RoomRowForm
                                                    initial={{ roomNumber: room.roomNumber, floor: room.floor ?? "", roomTypeId: room.roomTypeId, status: room.status }}
                                                    roomTypes={roomTypes}
                                                    onSave={(p) => handleSave(room.id, p)}
                                                    onCancel={() => setEditing(null)}
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr className="border-t border-gray-100">
                                            <td className="px-3 py-2 font-bold">{room.roomNumber}</td>
                                            <td className="px-3 py-2">{room.floor ?? "—"}</td>
                                            <td className="px-3 py-2">{room.roomTypeName}</td>
                                            <td className={`px-3 py-2 text-xs font-bold ${STATUS_STYLES[room.status] || ""}`}>{room.status}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCalendarId(calendarId === room.id ? null : room.id)}
                                                        className="px-3 py-1 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Calendar
                                                    </button>
                                                    <button type="button" onClick={() => setEditing(room.id)} className="px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 text-primary hover:bg-blue-50">
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={busyId === room.id}
                                                        onClick={() => handleDelete(room)}
                                                        className="px-3 py-1 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {calendarId === room.id && (
                                        <tr>
                                            <td colSpan={5} className="px-3 pb-3">
                                                <RoomAvailabilityPanel room={room} />
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default RoomManager;
