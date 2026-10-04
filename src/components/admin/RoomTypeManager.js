import { useEffect, useState } from "react";
import FormAlert from "../common/FormAlert";
import { AmenityPicker } from "./HotelForm";
import { fetchAmenities } from "../../services/lookupService";
import { roomTypeToPayload } from "../../services/adminHotelService";
import { useHotelApi } from "../../context/HotelApiContext";
import { formatMoney } from "../../utils/formatters";
import { useT } from "../../i18n/I18nContext";

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

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";

function RoomTypeForm({ initial, amenities, onSave, onCancel }) {
    const t = useT();
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
                    <span className="block text-xs font-bold text-gray-600 mb-1">{t("admin.roomTypes.name")} *</span>
                    <input required maxLength={100} value={form.name} onChange={set("name")} className={inputClass} />
                </label>
                <label className="block">
                    <span className="block text-xs font-bold text-gray-600 mb-1">{t("admin.roomTypes.pricePerNight")} *</span>
                    <input required type="number" min="0.01" step="0.01" value={form.pricePerNight ?? ""} onChange={set("pricePerNight")} className={inputClass} />
                </label>
                <label className="block">
                    <span className="block text-xs font-bold text-gray-600 mb-1">{t("admin.roomTypes.maxGuests")}</span>
                    <input type="number" min={1} max={20} value={form.maxOccupancy ?? ""} onChange={set("maxOccupancy")} className={inputClass} />
                </label>
                <label className="block">
                    <span className="block text-xs font-bold text-gray-600 mb-1">{t("admin.roomTypes.bedType")}</span>
                    <input maxLength={60} value={form.bedType || ""} onChange={set("bedType")} className={inputClass} />
                </label>
                <label className="block">
                    <span className="block text-xs font-bold text-gray-600 mb-1">{t("admin.roomTypes.area")}</span>
                    <input type="number" min="0.01" step="0.01" value={form.areaSqM ?? ""} onChange={set("areaSqM")} className={inputClass} />
                </label>
                <label className="block md:col-span-3">
                    <span className="block text-xs font-bold text-gray-600 mb-1">{t("admin.hotelForm.coverImageUrl")}</span>
                    <input type="url" value={form.coverImageUrl || ""} onChange={set("coverImageUrl")} className={inputClass} />
                </label>
                <label className="block md:col-span-3">
                    <span className="block text-xs font-bold text-gray-600 mb-1">{t("admin.hotelForm.description")}</span>
                    <textarea rows={2} value={form.description || ""} onChange={set("description")} className={inputClass} />
                </label>
            </div>
            <div>
                <p className="text-xs font-bold text-gray-600 mb-1">{t("admin.roomTypes.amenities")}</p>
                <AmenityPicker
                    amenities={amenities}
                    selected={form.amenityIds || []}
                    onChange={(ids) => setForm((prev) => ({ ...prev, amenityIds: ids }))}
                />
            </div>
            <FormAlert>{error}</FormAlert>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500">{t("common.actions.cancel")}</button>
                <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                    {saving ? t("common.state.saving") : t("admin.roomTypes.save")}
                </button>
            </div>
        </form>
    );
}

/** Danh sách + thêm/sửa/ẩn hạng phòng của 1 khách sạn. */
function RoomTypeManager({ hotelId, roomTypes, onChanged }) {
    const t = useT();
    const api = useHotelApi();
    const [amenities, setAmenities] = useState([]);
    const [editing, setEditing] = useState(null); // null | "new" | roomTypeId
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAmenities("room").then(setAmenities).catch((err) => setError(err.message));
    }, []);

    const handleSave = async (roomTypeId, payload) => {
        await api.saveRoomType(hotelId, roomTypeId, payload);
        setEditing(null);
        await onChanged();
    };

    const handleToggleActive = async (rt) => {
        if (rt.isActive && !window.confirm(t("admin.roomTypes.confirmHide", { name: rt.name }))) return;
        setBusyId(rt.id);
        setError("");
        try {
            if (rt.isActive) {
                await api.deactivateRoomType(hotelId, rt.id);
            } else {
                await api.saveRoomType(hotelId, rt.id, { ...roomTypeToPayload(rt), isActive: true });
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
                <h2 className="text-xl font-extrabold text-primary">{t("admin.roomTypes.title")}</h2>
                {editing !== "new" && (
                    <button type="button" onClick={() => setEditing("new")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-200 text-primary hover:bg-blue-50">
                        <span className="material-symbols-outlined text-base">add</span>
                        {t("admin.roomTypes.add")}
                    </button>
                )}
            </div>
            <FormAlert>{error}</FormAlert>

            {editing === "new" && (
                <RoomTypeForm initial={EMPTY_ROOM_TYPE} amenities={amenities} onSave={(p) => handleSave(null, p)} onCancel={() => setEditing(null)} />
            )}

            {roomTypes.length === 0 && editing !== "new" && (
                <p className="text-sm text-gray-500">{t("admin.roomTypes.empty")}</p>
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
                                    {!rt.isActive && <span className="ml-2 text-xs font-bold text-gray-500">{t("admin.rooms.hiddenSuffix")}</span>}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {t("admin.roomTypes.summary", { guests: rt.maxOccupancy, bedType: rt.bedType ? ` · ${rt.bedType}` : "", area: rt.areaSqM ? ` · ${rt.areaSqM} m²` : "", rooms: rt.totalRooms })}
                                </p>
                                {rt.amenities?.length > 0 && <p className="text-xs text-gray-400 mt-1">{rt.amenities.join(", ")}</p>}
                            </div>
                            <p className="font-extrabold text-primary">{formatMoney(rt.pricePerNight)}<span className="text-xs font-semibold text-gray-500">{t("common.units.perNight")}</span></p>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setEditing(rt.id)} className="px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 text-primary hover:bg-blue-50">{t("common.actions.edit")}</button>
                                <button
                                    type="button"
                                    disabled={busyId === rt.id}
                                    onClick={() => handleToggleActive(rt)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold border disabled:opacity-50 ${
                                        rt.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-700 hover:bg-green-50"
                                    }`}
                                >
                                    {t(rt.isActive ? "admin.roomTypes.hide" : "admin.roomTypes.restore")}
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
