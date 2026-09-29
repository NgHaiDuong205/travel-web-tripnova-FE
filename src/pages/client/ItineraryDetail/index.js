import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import FormAlert from "../../../components/common/FormAlert";
import StatusBadge from "../../../components/common/StatusBadge";
import { fetchDestinations } from "../../../services/destinationService";
import {
    ITEM_TYPES,
    ITINERARY_STATUS_LABELS,
    addItineraryItem,
    deleteItinerary,
    deleteItineraryItem,
    fetchItinerary,
    fetchLinkOptions,
    updateItinerary,
} from "../../../services/itineraryService";
import { formatDate, formatMoney } from "../../../utils/formatters";
import { ItineraryFields, toItineraryBody } from "../Itineraries";

const MAX_DAYS = 60; // khớp ItineraryServiceImpl.MAX_DAYS
const inputClass = "w-full rounded-lg border-outline-variant/40 bg-surface-container-lowest text-sm";
const EMPTY_ITEM = { entityType: "activity", entityId: "", title: "", startTime: "", endTime: "", estimatedCost: "", notes: "" };
const TYPE_BY_VALUE = Object.fromEntries(ITEM_TYPES.map((t) => [t.value, t]));

function toForm(itinerary) {
    return {
        title: itinerary.title || "",
        destinationId: itinerary.destinationId || "",
        startDate: itinerary.startDate || "",
        endDate: itinerary.endDate || "",
        partySize: itinerary.partySize ?? "",
        totalBudget: itinerary.totalBudget ?? "",
        status: itinerary.status || "draft",
    };
}

function AddItemForm({ itinerary, dayNumber, onAdded, onCancel }) {
    const [form, setForm] = useState(EMPTY_ITEM);
    const [options, setOptions] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));
    const linkable = itinerary.destinationId && (form.entityType === "landmark" || form.entityType === "hotel");

    useEffect(() => {
        let cancelled = false;
        setOptions([]);
        if (linkable) {
            fetchLinkOptions(itinerary.destinationId, form.entityType)
                .then((list) => !cancelled && setOptions(list))
                .catch(() => {});
        }
        return () => {
            cancelled = true;
        };
    }, [linkable, itinerary.destinationId, form.entityType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() && !form.entityId) {
            setError("Nhập tiêu đề hoặc chọn một địa điểm");
            return;
        }
        if (form.startTime && form.endTime && form.endTime <= form.startTime) {
            setError("Giờ kết thúc phải sau giờ bắt đầu");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const updated = await addItineraryItem(itinerary.id, {
                dayNumber,
                entityType: form.entityType,
                entityId: linkable && form.entityId ? form.entityId : null,
                title: form.title.trim() || null,
                startTime: form.startTime || null,
                endTime: form.endTime || null,
                estimatedCost: form.estimatedCost === "" ? null : Number(form.estimatedCost),
                notes: form.notes.trim() || null,
            });
            onAdded(updated);
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 bg-surface-container-low rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="text-xs font-bold text-on-surface-variant">
                    Type
                    <select value={form.entityType} onChange={(e) => setForm((prev) => ({ ...prev, entityType: e.target.value, entityId: "" }))} className={`${inputClass} mt-1`}>
                        {ITEM_TYPES.filter((t) => t.value !== "destination").map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </label>
                {linkable && (
                    <label className="md:col-span-2 text-xs font-bold text-on-surface-variant">
                        {form.entityType === "hotel" ? "Hotel" : "Landmark"} in {itinerary.destinationName} (optional)
                        <select value={form.entityId} onChange={set("entityId")} className={`${inputClass} mt-1`}>
                            <option value="">— None —</option>
                            {options.map((o) => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                    </label>
                )}
                <label className={`${linkable ? "md:col-span-3" : "md:col-span-2"} text-xs font-bold text-on-surface-variant`}>
                    Title {form.entityId ? "(để trống = tên địa điểm)" : "*"}
                    <input maxLength={255} value={form.title} onChange={set("title")} className={`${inputClass} mt-1`} />
                </label>
                <label className="text-xs font-bold text-on-surface-variant">
                    From
                    <input type="time" value={form.startTime} onChange={set("startTime")} className={`${inputClass} mt-1`} />
                </label>
                <label className="text-xs font-bold text-on-surface-variant">
                    To
                    <input type="time" value={form.endTime} onChange={set("endTime")} className={`${inputClass} mt-1`} />
                </label>
                <label className="text-xs font-bold text-on-surface-variant">
                    Estimated cost (USD)
                    <input type="number" min={0} step="0.01" value={form.estimatedCost} onChange={set("estimatedCost")} className={`${inputClass} mt-1`} />
                </label>
                <label className="md:col-span-3 text-xs font-bold text-on-surface-variant">
                    Notes
                    <textarea rows={2} maxLength={2000} value={form.notes} onChange={set("notes")} className={`${inputClass} mt-1`} />
                </label>
            </div>
            <FormAlert>{error}</FormAlert>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant">Cancel</button>
                <button type="submit" disabled={saving} className="primary-gradient text-white px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                    {saving ? "Adding..." : "Add activity"}
                </button>
            </div>
        </form>
    );
}

function ItineraryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [itinerary, setItinerary] = useState(null);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(null);
    const [destinations, setDestinations] = useState([]);
    const [saving, setSaving] = useState(false);
    const [addingDay, setAddingDay] = useState(null);
    const [extraDays, setExtraDays] = useState(0);
    const [busyItemId, setBusyItemId] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetchItinerary(id)
            .then((data) => !cancelled && setItinerary(data))
            .catch((err) => !cancelled && setError(err.status === 404 ? "Không tìm thấy lịch trình" : err.message));
        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        if (editing && destinations.length === 0) {
            fetchDestinations()
                .then((list) => setDestinations([...list].sort((a, b) => a.name.localeCompare(b.name))))
                .catch(() => {});
        }
    }, [editing, destinations.length]);

    // Có ngày đi/về -> đúng số ngày; chưa có -> tới ngày lớn nhất đang dùng (+ ngày người dùng tự thêm).
    const dayCount = useMemo(() => {
        if (!itinerary) return 0;
        if (itinerary.days) return itinerary.days;
        const used = Math.max(0, ...itinerary.items.map((i) => i.dayNumber));
        return Math.min(MAX_DAYS, Math.max(used, 1) + extraDays);
    }, [itinerary, extraDays]);

    const itemsByDay = useMemo(() => {
        const map = {};
        (itinerary?.items || []).forEach((item) => {
            (map[item.dayNumber] ||= []).push(item);
        });
        return map;
    }, [itinerary]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            setItinerary(await updateItinerary(id, toItineraryBody(form)));
            setEditing(false);
            setExtraDays(0);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Xoá lịch trình "${itinerary.title}" và toàn bộ hoạt động?`)) return;
        try {
            await deleteItinerary(id);
            navigate("/itineraries");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteItem = async (item) => {
        setBusyItemId(item.id);
        setError("");
        try {
            await deleteItineraryItem(id, item.id);
            setItinerary(await fetchItinerary(id));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyItemId(null);
        }
    };

    if (!itinerary) {
        return (
            <DashboardLayout>
                {error ? <FormAlert>{error}</FormAlert> : <div className="h-40 bg-surface-container-high rounded-xl animate-pulse" />}
                <Link to="/itineraries" className="inline-block mt-6 text-primary font-bold text-sm">← Back to itineraries</Link>
            </DashboardLayout>
        );
    }

    const overBudget = itinerary.totalBudget != null && Number(itinerary.estimatedTotal) > Number(itinerary.totalBudget);

    return (
        <DashboardLayout>
            <Link to="/itineraries" className="text-primary font-bold text-sm">← My itineraries</Link>

            {editing ? (
                <form onSubmit={handleSave} className="bg-surface-container-lowest rounded-xl p-6 my-6 space-y-5 editorial-shadow">
                    <ItineraryFields form={form} setForm={setForm} destinations={destinations} />
                    <label className="block text-xs font-bold text-on-surface-variant max-w-xs">
                        Status
                        <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className={`${inputClass} mt-1`}>
                            {Object.entries(ITINERARY_STATUS_LABELS).map(([value, cfg]) => (
                                <option key={value} value={value}>{cfg.label}</option>
                            ))}
                        </select>
                    </label>
                    <FormAlert>{error}</FormAlert>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => { setEditing(false); setError(""); }} className="px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant">Cancel</button>
                        <button type="submit" disabled={saving} className="primary-gradient text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            ) : (
                <section className="my-6 flex flex-wrap items-start justify-between gap-6">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight">{itinerary.title}</h1>
                            <StatusBadge status={itinerary.status} labels={ITINERARY_STATUS_LABELS} />
                        </div>
                        <p className="text-on-surface-variant flex flex-wrap gap-x-5 gap-y-1 text-sm">
                            <span>{itinerary.destinationName ? `${itinerary.destinationName}${itinerary.countryName ? `, ${itinerary.countryName}` : ""}` : "Destination not set"}</span>
                            <span>{itinerary.startDate ? `${formatDate(itinerary.startDate)} – ${formatDate(itinerary.endDate || itinerary.startDate)}` : "Dates not set"}</span>
                            {itinerary.partySize && <span>{itinerary.partySize} travellers</span>}
                        </p>
                        <p className={`mt-2 text-sm font-semibold ${overBudget ? "text-error" : "text-on-surface"}`}>
                            Estimated {formatMoney(itinerary.estimatedTotal, "USD")}
                            {itinerary.totalBudget != null && ` of ${formatMoney(itinerary.totalBudget, "USD")} budget`}
                            {overBudget && " — over budget"}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => { setForm(toForm(itinerary)); setEditing(true); }} className="px-4 py-2 rounded-lg text-sm font-bold border border-outline-variant/40 text-on-surface hover:bg-surface-container-low">
                            Edit trip
                        </button>
                        <button type="button" onClick={handleDelete} className="px-4 py-2 rounded-lg text-sm font-bold border border-error/40 text-error hover:bg-error-container/10">
                            Delete
                        </button>
                    </div>
                </section>
            )}

            {!editing && <FormAlert>{error}</FormAlert>}

            <div className="space-y-6">
                {Array.from({ length: dayCount }, (_, i) => i + 1).map((day) => {
                    const items = itemsByDay[day] || [];
                    const date = itinerary.startDate ? items[0]?.date || addDays(itinerary.startDate, day - 1) : null;
                    return (
                        <section key={day} className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-headline text-lg font-bold text-on-surface">
                                    Day {day}
                                    {date && <span className="ml-2 text-sm font-normal text-on-surface-variant">{formatDate(date)}</span>}
                                </h2>
                                {addingDay !== day && (
                                    <button type="button" onClick={() => setAddingDay(day)} className="text-primary text-sm font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">add</span>
                                        Add activity
                                    </button>
                                )}
                            </div>
                            {items.length === 0 && addingDay !== day && <p className="text-sm text-on-surface-variant">Chưa có hoạt động.</p>}
                            <ol className="space-y-3">
                                {items.map((item) => {
                                    const type = TYPE_BY_VALUE[item.entityType] || TYPE_BY_VALUE.other;
                                    return (
                                        <li key={item.id} className="flex gap-4 items-start">
                                            <span className="w-24 shrink-0 text-xs font-semibold text-on-surface-variant pt-1">
                                                {item.startTime ? item.startTime.slice(0, 5) : "Anytime"}
                                                {item.endTime ? ` – ${item.endTime.slice(0, 5)}` : ""}
                                            </span>
                                            <span className="material-symbols-outlined text-primary" title={type.label}>{type.icon}</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-on-surface">{item.title}</p>
                                                {item.entityName && item.entityName !== item.title && (
                                                    <p className="text-xs text-on-surface-variant">{item.entityName}</p>
                                                )}
                                                {item.notes && <p className="text-sm text-on-surface-variant whitespace-pre-line mt-1">{item.notes}</p>}
                                            </div>
                                            {item.estimatedCost != null && (
                                                <span className="text-sm font-semibold text-on-surface whitespace-nowrap">{formatMoney(item.estimatedCost, "USD")}</span>
                                            )}
                                            <button
                                                type="button"
                                                disabled={busyItemId === item.id}
                                                onClick={() => handleDeleteItem(item)}
                                                aria-label={`Remove ${item.title}`}
                                                className="text-on-surface-variant hover:text-error disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-base">delete</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ol>
                            {addingDay === day && (
                                <AddItemForm
                                    itinerary={itinerary}
                                    dayNumber={day}
                                    onAdded={(updated) => {
                                        setItinerary(updated);
                                        setAddingDay(null);
                                    }}
                                    onCancel={() => setAddingDay(null)}
                                />
                            )}
                        </section>
                    );
                })}
            </div>

            {!itinerary.days && dayCount < MAX_DAYS && (
                <button type="button" onClick={() => setExtraDays((n) => n + 1)} className="mt-6 text-primary font-bold text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">add</span>
                    Add day
                </button>
            )}
        </DashboardLayout>
    );
}

/** yyyy-MM-dd + n ngày (tính theo giờ địa phương, tránh lệch múi giờ của toISOString). */
function addDays(isoDate, n) {
    const [y, m, d] = isoDate.split("-").map(Number);
    const date = new Date(y, m - 1, d + n);
    const pad = (v) => String(v).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default ItineraryDetail;
