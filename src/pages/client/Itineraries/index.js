import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../../components/common/StatusBadge";
import { fetchDestinations } from "../../../services/destinationService";
import { ITINERARY_STATUS_LABELS, createItinerary, fetchMyItineraries } from "../../../services/itineraryService";
import { formatDate, formatMoney } from "../../../utils/formatters";

const PAGE_SIZE = 9;
const inputClass = "w-full rounded-lg border-outline-variant/40 bg-surface-container-lowest text-sm";
const EMPTY_FORM = { title: "", destinationId: "", startDate: "", endDate: "", partySize: "", totalBudget: "" };

/** Chuyển form (chuỗi) sang body API: trường trống -> null. */
export function toItineraryBody(form) {
    return {
        title: form.title.trim(),
        destinationId: form.destinationId || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        partySize: form.partySize === "" ? null : Number(form.partySize),
        totalBudget: form.totalBudget === "" ? null : Number(form.totalBudget),
        status: form.status || undefined,
    };
}

export function ItineraryFields({ form, setForm, destinations }) {
    const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="md:col-span-2 text-xs font-bold text-on-surface-variant">
                Trip name *
                <input required maxLength={255} value={form.title} onChange={set("title")} placeholder="e.g. Da Nang 3 days" className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs font-bold text-on-surface-variant">
                Destination
                <select value={form.destinationId} onChange={set("destinationId")} className={`${inputClass} mt-1`}>
                    <option value="">— Not decided —</option>
                    {destinations.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-bold text-on-surface-variant">
                    Travellers
                    <input type="number" min={1} max={50} value={form.partySize} onChange={set("partySize")} className={`${inputClass} mt-1`} />
                </label>
                <label className="text-xs font-bold text-on-surface-variant">
                    Budget (USD)
                    <input type="number" min={0} step="0.01" value={form.totalBudget} onChange={set("totalBudget")} className={`${inputClass} mt-1`} />
                </label>
            </div>
            <label className="text-xs font-bold text-on-surface-variant">
                Start date
                <input type="date" value={form.startDate} onChange={set("startDate")} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs font-bold text-on-surface-variant">
                End date
                <input type="date" value={form.endDate} min={form.startDate || undefined} disabled={!form.startDate} onChange={set("endDate")} className={`${inputClass} mt-1 disabled:opacity-50`} />
            </label>
        </div>
    );
}

function Itineraries() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [destinations, setDestinations] = useState([]);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setResult(await fetchMyItineraries({ page, limit: PAGE_SIZE }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (showForm && destinations.length === 0) {
            fetchDestinations()
                .then((list) => setDestinations([...list].sort((a, b) => a.name.localeCompare(b.name))))
                .catch(() => {});
        }
    }, [showForm, destinations.length]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const created = await createItinerary(toItineraryBody(form));
            navigate(`/itineraries/${created.id}`);
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <section className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <span className="text-[0.75rem] uppercase tracking-[0.2em] text-on-tertiary-fixed-variant mb-2 block">Plan ahead</span>
                    <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-2">My Itineraries</h1>
                    <p className="text-on-surface-variant text-lg">Lên kế hoạch từng ngày cho chuyến đi của bạn.</p>
                </div>
                {!showForm && (
                    <button type="button" onClick={() => setShowForm(true)} className="primary-gradient text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">add</span>
                        New itinerary
                    </button>
                )}
            </section>

            <FormAlert>{error}</FormAlert>

            {showForm && (
                <form onSubmit={handleCreate} className="bg-surface-container-lowest rounded-xl p-6 mb-10 space-y-5 editorial-shadow">
                    <ItineraryFields form={form} setForm={setForm} destinations={destinations} />
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="primary-gradient text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                            {saving ? "Creating..." : "Create & add activities"}
                        </button>
                    </div>
                </form>
            )}

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="h-44 bg-surface-container-high rounded-xl animate-pulse" />
                    ))}
                </div>
            )}

            {!loading && result.items.length === 0 && !error && (
                <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-outline mb-3">map</span>
                    <p className="text-on-surface-variant">Bạn chưa có lịch trình nào. Tạo lịch trình đầu tiên nhé!</p>
                </div>
            )}

            {!loading && result.items.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {result.items.map((it) => (
                        <Link key={it.id} to={`/itineraries/${it.id}`} className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow hover:-translate-y-1 transition-transform flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="font-headline text-lg font-bold text-on-surface line-clamp-2">{it.title}</h2>
                                <StatusBadge status={it.status} labels={ITINERARY_STATUS_LABELS} />
                            </div>
                            <p className="text-sm text-on-surface-variant flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">location_on</span>
                                {it.destinationName ? `${it.destinationName}${it.countryName ? `, ${it.countryName}` : ""}` : "Destination not set"}
                            </p>
                            <p className="text-sm text-on-surface-variant flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">calendar_month</span>
                                {it.startDate ? `${formatDate(it.startDate)}${it.endDate ? ` – ${formatDate(it.endDate)}` : ""}` : "Dates not set"}
                                {it.days ? ` · ${it.days} days` : ""}
                            </p>
                            <div className="mt-auto pt-3 border-t border-outline-variant/20 flex justify-between text-sm">
                                <span className="text-on-surface-variant">{it.itemCount} activities</span>
                                <span className="font-bold text-on-surface">
                                    {formatMoney(it.estimatedTotal, "USD")}
                                    {it.totalBudget != null && <span className="font-normal text-on-surface-variant"> / {formatMoney(it.totalBudget, "USD")}</span>}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-8">
                <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
            </div>
        </DashboardLayout>
    );
}

export default Itineraries;
