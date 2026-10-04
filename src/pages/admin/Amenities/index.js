import { useCallback, useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import { groupAmenities } from "../../../components/admin/HotelForm";
import { AMENITY_CATEGORIES, deleteAdminAmenity, fetchAdminAmenities, saveAdminAmenity } from "../../../services/adminHotelService";
import { useT } from "../../../i18n/I18nContext";

const EMPTY = { name: "", category: "room", iconUrl: "" };
const inputClass = "rounded-lg border-gray-200 text-sm";

function AmenityForm({ initial, onSave, onCancel }) {
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
            await onSave({ ...form, name: form.name.trim(), category: form.category.trim().toLowerCase() });
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 bg-blue-50/40 border border-blue-100 rounded-xl p-3">
            <label className="text-xs font-bold text-gray-600 flex-1 min-w-[180px]">
                {t("admin.amenities.name")} *
                <input required maxLength={255} value={form.name} onChange={set("name")} className={`${inputClass} block w-full`} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("admin.amenities.category")} *
                <input required list="amenity-categories" value={form.category} onChange={set("category")} className={`${inputClass} block w-40`} />
            </label>
            <label className="text-xs font-bold text-gray-600 flex-1 min-w-[200px]">
                {t("admin.amenities.iconUrl")}
                <input type="url" value={form.iconUrl || ""} onChange={set("iconUrl")} className={`${inputClass} block w-full`} />
            </label>
            <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                {saving ? t("common.state.saving") : t("common.actions.save")}
            </button>
            <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg text-xs font-bold text-gray-500">{t("common.actions.cancel")}</button>
            {error && <div className="w-full"><FormAlert>{error}</FormAlert></div>}
        </form>
    );
}

function AdminAmenities() {
    const t = useT();
    const [category, setCategory] = useState("");
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // null | "new" | amenityId
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setAmenities(await fetchAdminAmenities(category));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSave = async (amenityId, payload) => {
        await saveAdminAmenity(amenityId, payload);
        setEditing(null);
        await load();
    };

    const handleDelete = async (amenity) => {
        if (!window.confirm(t("admin.amenities.confirmDelete", { name: amenity.name }))) return;
        setBusyId(amenity.id);
        setError("");
        try {
            try {
                await deleteAdminAmenity(amenity.id);
            } catch (err) {
                // Đang được dùng → BE trả 409 kèm số lượng; hỏi lại rồi xoá cưỡng bức
                if (err.status !== 409 || !window.confirm(`${err.message}\n\n${t("admin.amenities.confirmForceDelete")}`)) throw err;
                await deleteAdminAmenity(amenity.id, true);
            }
            await load();
        } catch (err) {
            if (err.status !== 409) setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold text-primary mr-auto">{t("admin.amenities.title")}</h1>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                    <option value="">{t("admin.amenities.allCategories")}</option>
                    {AMENITY_CATEGORIES.map((c) => <option key={c} value={c}>{t(`admin.amenities.categories.${c}`, { defaultValue: c })}</option>)}
                </select>
                {editing !== "new" && (
                    <button type="button" onClick={() => setEditing("new")} className="inline-flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">
                        <span className="material-symbols-outlined text-base">add</span>
                        {t("admin.amenities.newAmenity")}
                    </button>
                )}
            </div>
            <datalist id="amenity-categories">
                {AMENITY_CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
            <p className="text-xs text-gray-500">{t("admin.amenities.categoryNote")}</p>
            <FormAlert>{error}</FormAlert>

            {editing === "new" && (
                <AmenityForm initial={{ ...EMPTY, category: category || "room" }} onSave={(p) => handleSave(null, p)} onCancel={() => setEditing(null)} />
            )}

            {loading ? (
                <p className="text-gray-500">{t("common.state.loading")}</p>
            ) : (
                groupAmenities(amenities).map(([group, items]) => (
                    <section key={group} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <h2 className="text-xs uppercase font-bold text-gray-400 mb-2">{group}</h2>
                        <div className="divide-y divide-gray-100">
                            {items.map((a) =>
                                editing === a.id ? (
                                    <div key={a.id} className="py-2">
                                        <AmenityForm
                                            initial={{ name: a.name, category: a.category, iconUrl: a.iconUrl || "" }}
                                            onSave={(p) => handleSave(a.id, p)}
                                            onCancel={() => setEditing(null)}
                                        />
                                    </div>
                                ) : (
                                    <div key={a.id} className="flex items-center gap-3 py-2">
                                        {a.iconUrl ? <img src={a.iconUrl} alt="" className="w-6 h-6 object-contain" /> : <span className="w-6" />}
                                        <span className="font-semibold flex-1">{a.name}</span>
                                        <span className="text-xs text-gray-500">{t("admin.amenities.usage", { hotels: a.hotelCount, roomTypes: a.roomTypeCount })}</span>
                                        <button type="button" onClick={() => setEditing(a.id)} className="px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 text-primary hover:bg-blue-50">{t("common.actions.edit")}</button>
                                        <button
                                            type="button"
                                            disabled={busyId === a.id}
                                            onClick={() => handleDelete(a)}
                                            className="px-3 py-1 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                        >
                                            {t("common.actions.delete")}
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}

export default AdminAmenities;
