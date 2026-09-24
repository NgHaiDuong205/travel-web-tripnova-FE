import { useEffect, useMemo, useState } from "react";
import FormAlert from "../common/FormAlert";
import { fetchAmenities } from "../../services/lookupService";
import { CANCELLATION_POLICIES, fetchDestinationOptions, hotelToPayload } from "../../services/adminHotelService";

const EMPTY_HOTEL = {
    destinationId: "",
    name: "",
    description: "",
    address: "",
    starRating: 3,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    phone: "",
    email: "",
    cancellationPolicy: "free",
    cancellationHours: 24,
    breakfastIncluded: false,
    petFriendly: false,
    coverImageUrl: "",
    latitude: "",
    longitude: "",
    managedById: null,
    amenityIds: [],
    isActive: true,
};

const inputClass = "w-full rounded-lg border-gray-200 text-sm";

function Field({ label, children, className = "" }) {
    return (
        <label className={`block ${className}`}>
            <span className="block text-xs font-bold text-gray-600 mb-1">{label}</span>
            {children}
        </label>
    );
}

/** Nhóm tiện ích theo category để hiển thị checkbox. */
export function groupAmenities(amenities) {
    const groups = {};
    for (const a of amenities) {
        (groups[a.category] = groups[a.category] || []).push(a);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export function AmenityPicker({ amenities, selected, onChange }) {
    const toggle = (id) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
    return (
        <div className="space-y-3">
            {groupAmenities(amenities).map(([category, items]) => (
                <div key={category}>
                    <p className="text-[11px] uppercase font-bold text-gray-400 mb-1">{category}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {items.map((a) => (
                            <label key={a.id} className="flex items-center gap-1 text-sm">
                                <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggle(a.id)} />
                                {a.name}
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Form tạo / sửa thông tin khách sạn. hotel = null khi tạo mới. */
function HotelForm({ hotel, onSubmit }) {
    const [form, setForm] = useState(() => (hotel ? { ...EMPTY_HOTEL, ...hotelToPayload(hotel) } : EMPTY_HOTEL));
    const [destinations, setDestinations] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let cancelled = false;
        Promise.all([fetchDestinationOptions(), fetchAmenities()])
            .then(([destinationList, amenityList]) => {
                if (cancelled) return;
                setDestinations(destinationList);
                // Tiện ích "room" thuộc về hạng phòng, không gán cho khách sạn
                setAmenities(amenityList.filter((a) => a.category !== "room"));
            })
            .catch((err) => !cancelled && setError(err.message));
        return () => {
            cancelled = true;
        };
    }, []);

    const destinationGroups = useMemo(() => {
        const groups = {};
        for (const d of destinations) {
            (groups[d.countryName] = groups[d.countryName] || []).push(d);
        }
        return Object.entries(groups);
    }, [destinations]);

    const set = (name) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        const toNumber = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
        try {
            await onSubmit({
                ...form,
                starRating: Number(form.starRating),
                cancellationHours: toNumber(form.cancellationHours),
                latitude: toNumber(form.latitude),
                longitude: toNumber(form.longitude),
            });
            setSuccess("Đã lưu khách sạn.");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
                <Field label="Hotel name *">
                    <input required maxLength={200} value={form.name} onChange={set("name")} className={inputClass} />
                </Field>
                <Field label="Destination *">
                    <select required value={form.destinationId || ""} onChange={set("destinationId")} className={inputClass}>
                        <option value="">— Chọn điểm đến —</option>
                        {destinationGroups.map(([country, items]) => (
                            <optgroup key={country} label={country || "Khác"}>
                                {items.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </Field>
                <Field label="Address *" className="md:col-span-2">
                    <input required value={form.address} onChange={set("address")} className={inputClass} />
                </Field>
                <Field label="Description" className="md:col-span-2">
                    <textarea rows={3} value={form.description || ""} onChange={set("description")} className={inputClass} />
                </Field>
                <Field label="Star rating *">
                    <select value={form.starRating} onChange={set("starRating")} className={inputClass}>
                        {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s} ★</option>)}
                    </select>
                </Field>
                <Field label="Cover image URL">
                    <input type="url" value={form.coverImageUrl || ""} onChange={set("coverImageUrl")} className={inputClass} />
                </Field>
                <Field label="Phone">
                    <input maxLength={20} value={form.phone || ""} onChange={set("phone")} className={inputClass} />
                </Field>
                <Field label="Email">
                    <input type="email" value={form.email || ""} onChange={set("email")} className={inputClass} />
                </Field>
                <Field label="Check-in time">
                    <input type="time" value={form.checkInTime || ""} onChange={set("checkInTime")} className={inputClass} />
                </Field>
                <Field label="Check-out time">
                    <input type="time" value={form.checkOutTime || ""} onChange={set("checkOutTime")} className={inputClass} />
                </Field>
                <Field label="Cancellation policy">
                    <select value={form.cancellationPolicy} onChange={set("cancellationPolicy")} className={inputClass}>
                        {CANCELLATION_POLICIES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                </Field>
                <Field label="Free cancellation (hours before check-in)">
                    <input type="number" min={0} max={720} value={form.cancellationHours ?? ""} onChange={set("cancellationHours")} className={inputClass} />
                </Field>
                <Field label="Latitude">
                    <input type="number" step="any" min={-90} max={90} value={form.latitude ?? ""} onChange={set("latitude")} className={inputClass} />
                </Field>
                <Field label="Longitude">
                    <input type="number" step="any" min={-180} max={180} value={form.longitude ?? ""} onChange={set("longitude")} className={inputClass} />
                </Field>
            </div>

            <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={!!form.breakfastIncluded} onChange={set("breakfastIncluded")} />
                    Breakfast included
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={!!form.petFriendly} onChange={set("petFriendly")} />
                    Pet friendly
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={!!form.isActive} onChange={set("isActive")} />
                    Active (hiện ở trang public)
                </label>
            </div>

            <div>
                <p className="text-sm font-bold text-gray-700 mb-2">Hotel amenities</p>
                <AmenityPicker
                    amenities={amenities}
                    selected={form.amenityIds || []}
                    onChange={(ids) => setForm((prev) => ({ ...prev, amenityIds: ids }))}
                />
            </div>

            <FormAlert>{error}</FormAlert>
            <FormAlert type="success">{success}</FormAlert>
            <div className="flex justify-end">
                <button type="submit" disabled={saving} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                    {saving ? "Saving..." : hotel ? "Save changes" : "Create hotel"}
                </button>
            </div>
        </form>
    );
}

export default HotelForm;
