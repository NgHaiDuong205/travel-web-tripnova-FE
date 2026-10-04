import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import FormAlert from "../../../components/common/FormAlert";
import StatusBadge from "../../../components/common/StatusBadge";
import { fetchDestinations } from "../../../services/destinationService";
import {
    addItineraryItem,
    deleteItinerary,
    deleteItineraryItem,
    fetchItinerary,
    fetchLinkOptions,
    LINKABLE_TYPES,
    updateItinerary,
    updateItineraryItem,
} from "../../../services/itineraryService";
import { formatDate, formatMoney } from "../../../utils/formatters";
import { ItineraryFields, toItineraryBody } from "../Itineraries";
import { useT } from "../../../i18n/I18nContext";

const TripMap = lazy(() => import("../../../components/planner/TripMap"));
const MAX_DAYS = 60; // khớp ItineraryServiceImpl.MAX_DAYS
const inputClass = "w-full rounded-lg border-outline-variant/40 bg-surface-container-lowest text-sm";
const EMPTY_ITEM = { entityType: "activity", entityId: "", title: "", startTime: "", endTime: "", estimatedCost: "", notes: "" };
const ITEM_TYPES = [
    { value: "landmark", labelKey: "trips.itineraryDetail.itemTypes.sightseeing", icon: "photo_camera" },
    { value: "hotel", labelKey: "trips.itineraryDetail.itemTypes.hotel", icon: "hotel" },
    { value: "restaurant", labelKey: "trips.itineraryDetail.itemTypes.foodAndDrink", icon: "restaurant" },
    { value: "activity", labelKey: "trips.itineraryDetail.itemTypes.activity", icon: "hiking" },
    { value: "transport", labelKey: "trips.itineraryDetail.itemTypes.transport", icon: "directions_car" },
    { value: "destination", labelKey: "trips.itineraryDetail.itemTypes.destination", icon: "location_on" },
    { value: "other", labelKey: "trips.itineraryDetail.itemTypes.other", icon: "more_horiz" },
];
const TYPE_BY_VALUE = Object.fromEntries(ITEM_TYPES.map((itemType) => [itemType.value, itemType]));

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

function itemToForm(item) {
    return {
        entityType: item.entityType || "other",
        entityId: item.entityId || "",
        title: item.title || "",
        startTime: item.startTime ? item.startTime.slice(0, 5) : "",
        endTime: item.endTime ? item.endTime.slice(0, 5) : "",
        estimatedCost: item.estimatedCost ?? "",
        notes: item.notes || "",
        dayNumber: item.dayNumber,
    };
}

/** Form thêm hoạt động vào `dayNumber`, hoặc sửa `item` (khi sửa có thể chuyển sang ngày khác trong `dayCount` ngày). */
function ItemForm({ itinerary, dayNumber, item, dayCount, onSaved, onCancel }) {
    const t = useT();
    const [form, setForm] = useState(() => (item ? itemToForm(item) : { ...EMPTY_ITEM, dayNumber }));
    const [options, setOptions] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));
    const linkable = itinerary.destinationId && LINKABLE_TYPES.includes(form.entityType);

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
            setError(t("trips.itineraryDetail.validation.titleOrPlaceRequired"));
            return;
        }
        if (form.startTime && form.endTime && form.endTime <= form.startTime) {
            setError(t("trips.itineraryDetail.validation.endTimeAfterStartTime"));
            return;
        }
        setSaving(true);
        setError("");
        try {
            const body = {
                dayNumber: Number(form.dayNumber),
                entityType: form.entityType,
                // Hoạt động "điểm đến" (không chọn lại được trong form) giữ nguyên liên kết cũ
                entityId: (linkable || form.entityType === "destination") && form.entityId ? form.entityId : null,
                title: form.title.trim() || null,
                startTime: form.startTime || null,
                endTime: form.endTime || null,
                estimatedCost: form.estimatedCost === "" ? null : Number(form.estimatedCost),
                notes: form.notes.trim() || null,
            };
            const updated = item
                ? await updateItineraryItem(itinerary.id, item.id, body)
                : await addItineraryItem(itinerary.id, body);
            onSaved(updated);
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 bg-surface-container-low rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {item && (
                    <label className="text-xs font-bold text-on-surface-variant">
                        {t("trips.itineraryDetail.dayField")}
                        <select value={form.dayNumber} onChange={set("dayNumber")} className={`${inputClass} mt-1`}>
                            {Array.from({ length: Math.max(dayCount, item.dayNumber) }, (_, i) => i + 1).map((d) => (
                                <option key={d} value={d}>{t("trips.itineraryDetail.day", { day: d })}</option>
                            ))}
                        </select>
                    </label>
                )}
                <label className="text-xs font-bold text-on-surface-variant">
                    {t("trips.itineraryDetail.type")}
                    <select value={form.entityType} onChange={(e) => setForm((prev) => ({ ...prev, entityType: e.target.value, entityId: "" }))} className={`${inputClass} mt-1`}>
                        {ITEM_TYPES.filter((itemType) => itemType.value !== "destination" || form.entityType === "destination").map((itemType) => (
                            <option key={itemType.value} value={itemType.value}>{t(itemType.labelKey)}</option>
                        ))}
                    </select>
                </label>
                {linkable && (
                    <label className="md:col-span-2 text-xs font-bold text-on-surface-variant">
                        {t(form.entityType === "hotel" ? "trips.itineraryDetail.hotelInDestinationOptional" : "trips.itineraryDetail.landmarkInDestinationOptional", { destination: itinerary.destinationName })}
                        <select value={form.entityId} onChange={set("entityId")} className={`${inputClass} mt-1`}>
                            <option value="">{t("trips.itineraryDetail.none")}</option>
                            {options.map((o) => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                    </label>
                )}
                <label className={`${linkable ? "md:col-span-3" : "md:col-span-2"} text-xs font-bold text-on-surface-variant`}>
                    {t(form.entityId ? "trips.itineraryDetail.titleOptionalPlaceName" : "trips.itineraryDetail.titleRequired")}
                    <input maxLength={255} value={form.title} onChange={set("title")} className={`${inputClass} mt-1`} />
                </label>
                <label className="text-xs font-bold text-on-surface-variant">
                    {t("common.fields.from")}
                    <input type="time" value={form.startTime} onChange={set("startTime")} className={`${inputClass} mt-1`} />
                </label>
                <label className="text-xs font-bold text-on-surface-variant">
                    {t("common.fields.to")}
                    <input type="time" value={form.endTime} onChange={set("endTime")} className={`${inputClass} mt-1`} />
                </label>
                <label className="text-xs font-bold text-on-surface-variant">
                    {t("trips.itineraryDetail.estimatedCostUsd")}
                    <input type="number" min={0} step="0.01" value={form.estimatedCost} onChange={set("estimatedCost")} className={`${inputClass} mt-1`} />
                </label>
                <label className="md:col-span-3 text-xs font-bold text-on-surface-variant">
                    {t("common.fields.notes")}
                    <textarea rows={2} maxLength={2000} value={form.notes} onChange={set("notes")} className={`${inputClass} mt-1`} />
                </label>
            </div>
            <FormAlert>{error}</FormAlert>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant">{t("common.actions.cancel")}</button>
                <button type="submit" disabled={saving} className="primary-gradient text-white px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                    {item
                        ? saving ? t("common.state.saving") : t("common.actions.save")
                        : saving ? t("trips.itineraryDetail.adding") : t("trips.itineraryDetail.addActivity")}
                </button>
            </div>
        </form>
    );
}

function ItineraryDetail() {
    const t = useT();
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
    const [editingItemId, setEditingItemId] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetchItinerary(id)
            .then((data) => !cancelled && setItinerary(data))
            .catch((err) => !cancelled && setError(err.status === 404 ? t("trips.itineraryDetail.notFound") : err.message));
        return () => {
            cancelled = true;
        };
    }, [id, t]);

    const itineraryStatusLabels = useMemo(() => ({
        draft: { label: t("trips.itineraryDetail.status.draft"), className: "bg-gray-50 text-gray-700 border-gray-200" },
        saved: { label: t("trips.itineraryDetail.status.saved"), className: "bg-blue-50 text-blue-700 border-blue-200" },
        booked: { label: t("trips.itineraryDetail.status.booked"), className: "bg-green-50 text-green-700 border-green-200" },
    }), [t]);

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

    // Ghim bản đồ: hoạt động gắn khách sạn / địa danh có toạ độ, đánh số theo thứ tự trong ngày.
    const mapStops = useMemo(() => {
        const stops = [];
        Object.keys(itemsByDay).forEach((day) => {
            let n = 0;
            itemsByDay[day].forEach((item) => {
                if (item.latitude == null || item.longitude == null) return;
                const kind = item.entityType === "hotel" ? "hotel" : item.entityType === "restaurant" ? "lunch" : "sight";
                stops.push({
                    key: item.id,
                    day: Number(day),
                    kind, // "lunch" = ghim quán ăn (icon dao nĩa, không đánh số)
                    label: kind === "sight" ? ++n : null,
                    lat: item.latitude,
                    lng: item.longitude,
                    title: item.title,
                    subtitle: t("trips.itineraryDetail.day", { day }),
                });
            });
        });
        return stops;
    }, [itemsByDay, t]);
    const [activeStop, setActiveStop] = useState(null);

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
        if (!window.confirm(t("trips.itineraryDetail.confirmDelete", { title: itinerary.title }))) return;
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
                <Link to="/itineraries" className="inline-block mt-6 text-primary font-bold text-sm">{t("trips.itineraryDetail.backToItineraries")}</Link>
            </DashboardLayout>
        );
    }

    const overBudget = itinerary.totalBudget != null && Number(itinerary.estimatedTotal) > Number(itinerary.totalBudget);

    return (
        <DashboardLayout>
            <Link to="/itineraries" className="text-primary font-bold text-sm">{t("trips.itineraryDetail.myItineraries")}</Link>

            {editing ? (
                <form onSubmit={handleSave} className="bg-surface-container-lowest rounded-xl p-6 my-6 space-y-5 editorial-shadow">
                    <ItineraryFields form={form} setForm={setForm} destinations={destinations} />
                    <label className="block text-xs font-bold text-on-surface-variant max-w-xs">
                        {t("common.fields.status")}
                        <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className={`${inputClass} mt-1`}>
                            {Object.entries(itineraryStatusLabels).map(([value, cfg]) => (
                                <option key={value} value={value}>{cfg.label}</option>
                            ))}
                        </select>
                    </label>
                    <FormAlert>{error}</FormAlert>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => { setEditing(false); setError(""); }} className="px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant">{t("common.actions.cancel")}</button>
                        <button type="submit" disabled={saving} className="primary-gradient text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                            {saving ? t("common.state.saving") : t("common.actions.save")}
                        </button>
                    </div>
                </form>
            ) : (
                <section className="my-6 flex flex-wrap items-start justify-between gap-6">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight">{itinerary.title}</h1>
                            <StatusBadge status={itinerary.status} labels={itineraryStatusLabels} />
                        </div>
                        <p className="text-on-surface-variant flex flex-wrap gap-x-5 gap-y-1 text-sm">
                            <span>{itinerary.destinationName ? `${itinerary.destinationName}${itinerary.countryName ? `, ${itinerary.countryName}` : ""}` : t("trips.itineraryDetail.destinationNotSet")}</span>
                            <span>{itinerary.startDate ? t("trips.itineraryDetail.dateRange", { startDate: formatDate(itinerary.startDate), endDate: formatDate(itinerary.endDate || itinerary.startDate) }) : t("trips.itineraryDetail.datesNotSet")}</span>
                            {itinerary.partySize && <span>{t("trips.itineraryDetail.travellers", { count: itinerary.partySize })}</span>}
                        </p>
                        <p className={`mt-2 text-sm font-semibold ${overBudget ? "text-error" : "text-on-surface"}`}>
                            {t(overBudget ? "trips.itineraryDetail.estimatedOverBudget" : itinerary.totalBudget != null ? "trips.itineraryDetail.estimatedWithBudget" : "trips.itineraryDetail.estimated", {
                                estimated: formatMoney(itinerary.estimatedTotal, "USD"),
                                budget: itinerary.totalBudget != null ? formatMoney(itinerary.totalBudget, "USD") : undefined,
                            })}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {itinerary.destinationId && itinerary.startDate && (
                            <Link to={`/trip-booking/${itinerary.id}`} className="primary-gradient text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
                                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
                                {t(itinerary.status === "booked" ? "planner.booking.viewBooking" : "planner.booking.bookHotelCar")}
                            </Link>
                        )}
                        <button type="button" onClick={() => { setForm(toForm(itinerary)); setEditing(true); }} className="px-4 py-2 rounded-lg text-sm font-bold border border-outline-variant/40 text-on-surface hover:bg-surface-container-low">
                            {t("trips.itineraryDetail.editTrip")}
                        </button>
                        <button type="button" onClick={handleDelete} className="px-4 py-2 rounded-lg text-sm font-bold border border-error/40 text-error hover:bg-error-container/10">
                            {t("common.actions.delete")}
                        </button>
                    </div>
                </section>
            )}

            {!editing && <FormAlert>{error}</FormAlert>}

            {mapStops.length > 0 && (
                <section className="mb-6">
                    <h2 className="font-headline text-lg font-bold text-on-surface mb-3">{t("planner.map.title")}</h2>
                    <Suspense fallback={<div className="h-[380px] rounded-2xl bg-surface-container-high animate-pulse" />}>
                    <TripMap
                        stops={mapStops}
                        activeKey={activeStop}
                        onSelect={(key) => {
                            setActiveStop(key);
                            document.getElementById(`itinerary-item-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        className="h-[380px]"
                    />
                    </Suspense>
                </section>
            )}

            <div className="space-y-6">
                {Array.from({ length: dayCount }, (_, i) => i + 1).map((day) => {
                    const items = itemsByDay[day] || [];
                    const date = itinerary.startDate ? items[0]?.date || addDays(itinerary.startDate, day - 1) : null;
                    return (
                        <section key={day} className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-headline text-lg font-bold text-on-surface">
                                    {t("trips.itineraryDetail.day", { day })}
                                    {date && <span className="ml-2 text-sm font-normal text-on-surface-variant">{formatDate(date)}</span>}
                                </h2>
                                {addingDay !== day && (
                                    <button type="button" onClick={() => { setEditingItemId(null); setAddingDay(day); }} className="text-primary text-sm font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">add</span>
                                        {t("trips.itineraryDetail.addActivity")}
                                    </button>
                                )}
                            </div>
                            {items.length === 0 && addingDay !== day && <p className="text-sm text-on-surface-variant">{t("trips.itineraryDetail.noActivities")}</p>}
                            <ol className="space-y-3">
                                {items.map((item) => {
                                    const type = TYPE_BY_VALUE[item.entityType] || TYPE_BY_VALUE.other;
                                    if (editingItemId === item.id) {
                                        return (
                                            <li key={item.id}>
                                                <ItemForm
                                                    itinerary={itinerary}
                                                    item={item}
                                                    dayCount={dayCount}
                                                    onSaved={(updated) => {
                                                        setItinerary(updated);
                                                        setEditingItemId(null);
                                                    }}
                                                    onCancel={() => setEditingItemId(null)}
                                                />
                                            </li>
                                        );
                                    }
                                    return (
                                        <li
                                            key={item.id}
                                            id={`itinerary-item-${item.id}`}
                                            className={`flex gap-4 items-start rounded-lg ${activeStop === item.id ? "ring-2 ring-primary/40 bg-primary/5" : ""}`}
                                        >
                                            <span className="w-24 shrink-0 text-xs font-semibold text-on-surface-variant pt-1">
                                                {item.startTime ? item.startTime.slice(0, 5) : t("trips.itineraryDetail.anytime")}
                                                {item.endTime ? ` – ${item.endTime.slice(0, 5)}` : ""}
                                            </span>
                                            <span className="material-symbols-outlined text-primary" title={t(type.labelKey)}>{type.icon}</span>
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
                                                onClick={() => {
                                                    setAddingDay(null);
                                                    setEditingItemId(item.id);
                                                }}
                                                aria-label={t("trips.itineraryDetail.editItem", { title: item.title })}
                                                title={t("trips.itineraryDetail.editItem", { title: item.title })}
                                                className="text-on-surface-variant hover:text-primary"
                                            >
                                                <span className="material-symbols-outlined text-base">edit</span>
                                            </button>
                                            <button
                                                type="button"
                                                disabled={busyItemId === item.id}
                                                onClick={() => handleDeleteItem(item)}
                                                aria-label={t("trips.itineraryDetail.removeItem", { title: item.title })}
                                                className="text-on-surface-variant hover:text-error disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-base">delete</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ol>
                            {addingDay === day && (
                                <ItemForm
                                    itinerary={itinerary}
                                    dayNumber={day}
                                    onSaved={(updated) => {
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
                    {t("trips.itineraryDetail.addDay")}
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
