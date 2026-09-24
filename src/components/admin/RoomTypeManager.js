import { useEffect, useState } from "react";
import FormAlert from "../common/FormAlert";
import { AmenityPicker } from "./HotelForm";
import { fetchAmenities } from "../../services/lookupService";
import { deactivateAdminRoomType, roomTypeToPayload, saveAdminRoomType } from "../../services/adminHotelService";
import { formatMoney } from "../../utils/formatters";

const EMPTY_ROOM_TYPE = {
    name: "",
    description: "",
    maxOccupancy: 2,
    bedType: "",
    areaSqM: "",
    pricePerNight: "",
    coverImageUrl: "",
    amenityIds: [],
    isActive: true,
};

const inputClass = "w-full rounded-lg border-gray-200 text-sm";

function RoomTypeForm({ initial, amenities, onSave, onCancel }) {
    const [form, setForm] = useState(initial);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await onSave({
                ...form,
                maxOccupancy: Number(form.maxOccupancy),
                pricePerNight: Number(form.pricePerNight),
                areaSqM: form.areaSqM === "" || form.areaSqM === null ? null : Number(form.areaSqM),
            });
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border border-blue-100 bg-blue-50/40 rounded-xl p-4 space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
                <label className="block md:col-span-2">
                    <span className="block text-xs font-bold text-gray-600 mb-1">Name *</span>
                    <input required maxLength={100} value={form.name} onChange={set("name")} className={inputClass} />
                </label>
                <label className="block">
                    <span className="block text-xs font-bold text-gray-600 mb-1">Price / night (USD) *</span>
                    <input required type="number" min="0.01" step="0.01" value={form.pricePerNight ?? ""} onChange={set("pricePerNight")} className={inputClass} />
                </label>
                <label className="block">
                    <span className="block text-xs font-bold text-gray-600 mb-1">Max guests</span>
                    <input type="number" min={1} max={20} value={form.maxOccupancy ?? ""} onChange={set("maxOccupancy")} className={inputClass} />
                </label>
                <label className="block">
                    <span className="block text-xs font-bold text-gray-600 mb-1">Bed type</span>
                    <input maxLength={60} value={form.bedType || ""} onChange={set("bedType")} className={inputClass} />
                </label>
                <label className="block">
                    <span className="block text-xs font-bold text-gray-600 mb-1">Area (m²)</span>
                    <input type="number" min="0.01" step="0.01" value={form.areaSqM ?? ""} onChange={set("areaSqM")} className={inputClass} />
                </label>
                <label className="block md:col-span-3">
                    <span className="block text-xs font-bold text-gray-600 mb-1">Cover image URL</span>
                    <input type="url" value={form.coverImageUrl || ""} onChange={set("coverImageUrl")} className={inputClass} />
                </label>
                <label className="block md:col-span-3">
                    <span className="block text-xs font-bold text-gray-600 mb-1">Description</span>
                    <textarea rows={2} value={form.description || ""} onChange={set("description")} className={inputClass} />
                </label>
            </div>
            <div>
                <p className="text-xs font-bold text-gray-600 mb-1">Room amenities</p>
                <AmenityPicker
                    amenities={amenities}
                    selected={form.amenityIds || []}
                    onChange={(ids) => setForm((prev) => ({ ...prev, amenityIds: ids }))}
                />
            </div>
            <FormAlert>{error}</FormAlert>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500">Cancel</button>
                <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                    {saving ? "Saving..." : "Save room type"}
                </button>
            </div>
        </form>
    );
}

/** Danh sách + thêm/sửa/ẩn hạng phòng của 1 khách sạn. */
function RoomTypeManager({ hotelId, roomTypes, onChanged }) {
    const [amenities, setAmenities] = useState([]);
    const [editing, setEditing] = useState(null); // null | "new" | roomTypeId
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAmenities("room").then(setAmenities).catch((err) => setError(err.message));
    }, []);

    const handleSave = async (roomTypeId, payload) => {
        await saveAdminRoomType(hotelId, roomTypeId, payload);
        setEditing(null);
        await onChanged();
    };

    const handleToggleActive = async (rt) => {
        if (rt.isActive && !window.confirm(`Ẩn hạng phòng "${rt.name}"? Khách sẽ không đặt được hạng này nữa.`)) return;
        setBusyId(rt.id);
        setError("");
        try {
            if (rt.isActive) {
                await deactivateAdminRoomType(hotelId, rt.id);
            } else {
                await saveAdminRoomType(hotelId, rt.id, { ...roomTypeToPayload(rt), isActive: true });
            }
            await onChanged();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-primary">Room types</h2>
                {editing !== "new" && (
                    <button type="button" onClick={() => setEditing("new")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-200 text-primary hover:bg-blue-50">
                        <span className="material-symbols-outlined text-base">add</span>
                        Add room type
                    </button>
                )}
            </div>
            <FormAlert>{error}</FormAlert>

            {editing === "new" && (
                <RoomTypeForm initial={EMPTY_ROOM_TYPE} amenities={amenities} onSave={(p) => handleSave(null, p)} onCancel={() => setEditing(null)} />
            )}

            {roomTypes.length === 0 && editing !== "new" && (
                <p className="text-sm text-gray-500">Chưa có hạng phòng nào. Thêm hạng phòng trước rồi mới tạo phòng.</p>
            )}

            <div className="space-y-3">
                {roomTypes.map((rt) =>
                    editing === rt.id ? (
                        <RoomTypeForm
                            key={rt.id}
                            initial={{ ...EMPTY_ROOM_TYPE, ...roomTypeToPayload(rt) }}
                            amenities={amenities}
                            onSave={(p) => handleSave(rt.id, p)}
                            onCancel={() => setEditing(null)}
                        />
                    ) : (
                        <div key={rt.id} className={`flex flex-wrap items-center gap-4 border rounded-xl p-4 ${rt.isActive ? "border-gray-100" : "border-dashed border-gray-200 opacity-60"}`}>
                            <div className="flex-1 min-w-[200px]">
                                <p className="font-bold">
                                    {rt.name}
                                    {!rt.isActive && <span className="ml-2 text-xs font-bold text-gray-500">(hidden)</span>}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {rt.maxOccupancy} guests{rt.bedType ? ` · ${rt.bedType}` : ""}{rt.areaSqM ? ` · ${rt.areaSqM} m²` : ""} · {rt.totalRooms} rooms
                                </p>
                                {rt.amenities?.length > 0 && <p className="text-xs text-gray-400 mt-1">{rt.amenities.join(", ")}</p>}
                            </div>
                            <p className="font-extrabold text-primary">{formatMoney(rt.pricePerNight)}<span className="text-xs font-semibold text-gray-500"> / night</span></p>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setEditing(rt.id)} className="px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 text-primary hover:bg-blue-50">Edit</button>
                                <button
                                    type="button"
                                    disabled={busyId === rt.id}
                                    onClick={() => handleToggleActive(rt)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold border disabled:opacity-50 ${
                                        rt.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-700 hover:bg-green-50"
                                    }`}
                                >
                                    {rt.isActive ? "Hide" : "Restore"}
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>
        </section>
    );
}

export default RoomTypeManager;
