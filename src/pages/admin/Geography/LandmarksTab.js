import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import { fetchDestinationOptions } from "../../../services/adminHotelService";
import {
    LANDMARK_CATEGORIES,
    deactivateAdminLandmark,
    fetchAdminLandmarks,
    saveAdminLandmark,
    toNumberOrNull,
} from "../../../services/adminGeographyService";
import { formatMoney } from "../../../utils/formatters";
import { ActionButton, AddButton, Field, InlineForm, SearchBox, StatusLabel, Thumbnail, inputClass } from "./shared";

const PAGE_SIZE = 20;
const EMPTY = { destinationId: "", name: "", description: "", category: "other", coverImageUrl: "", openingHours: "", entryFee: "", isActive: true };

function toPayload(form) {
    return {
        destinationId: form.destinationId,
        name: form.name.trim(),
        description: form.description || null,
        category: form.category || "other",
        coverImageUrl: form.coverImageUrl || null,
        openingHours: form.openingHours || null,
        entryFee: toNumberOrNull(form.entryFee),
        isActive: !!form.isActive,
    };
}

/** Ô chọn điểm đến nhóm theo quốc gia (~570 điểm đến). */
function DestinationSelect({ groups, value, onChange, required, allLabel }) {
    return (
        <select required={required} value={value} onChange={onChange} className={allLabel ? "rounded-lg border-gray-200 text-sm max-w-xs" : inputClass}>
            <option value="">{allLabel || "—"}</option>
            {groups.map(([country, items]) => (
                <optgroup key={country} label={country || "Khác"}>
                    {items.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </optgroup>
            ))}
        </select>
    );
}

function LandmarkForm({ initial, destinationGroups, onSave, onCancel }) {
    return (
        <InlineForm initial={initial} onSave={(f) => onSave(toPayload(f))} onCancel={onCancel}>
            {(form, set) => (
                <>
                    <div className="grid md:grid-cols-3 gap-3">
                        <Field label="Name *">
                            <input required maxLength={200} value={form.name} onChange={set("name")} className={inputClass} />
                        </Field>
                        <Field label="Destination *">
                            <DestinationSelect required groups={destinationGroups} value={form.destinationId} onChange={set("destinationId")} />
                        </Field>
                        <Field label="Category">
                            <select value={form.category} onChange={set("category")} className={inputClass}>
                                {LANDMARK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </Field>
                        <Field label="Opening hours">
                            <input maxLength={200} value={form.openingHours || ""} onChange={set("openingHours")} className={inputClass} />
                        </Field>
                        <Field label="Entry fee (USD)">
                            <input type="number" min={0} step="0.01" value={form.entryFee ?? ""} onChange={set("entryFee")} className={inputClass} />
                        </Field>
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 text-sm font-semibold">
                                <input type="checkbox" checked={!!form.isActive} onChange={set("isActive")} /> Active
                            </label>
                        </div>
                        <Field label="Cover image URL" className="md:col-span-3">
                            <input type="url" value={form.coverImageUrl || ""} onChange={set("coverImageUrl")} className={inputClass} />
                        </Field>
                    </div>
                    <Field label="Description">
                        <textarea rows={2} value={form.description || ""} onChange={set("description")} className={inputClass} />
                    </Field>
                </>
            )}
        </InlineForm>
    );
}

function LandmarksTab() {
    const [filters, setFilters] = useState({ q: "", destinationId: "", category: "all", status: "all" });
    const [page, setPage] = useState(1);
    const [destinations, setDestinations] = useState([]);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDestinationOptions().then(setDestinations).catch((err) => setError(err.message));
    }, []);

    const destinationGroups = useMemo(() => {
        const groups = {};
        for (const d of destinations) {
            (groups[d.countryName] = groups[d.countryName] || []).push(d);
        }
        return Object.entries(groups);
    }, [destinations]);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setResult(await fetchAdminLandmarks({ ...filters, page, limit: PAGE_SIZE }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        load();
    }, [load]);

    const changeFilter = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleSave = async (id, payload) => {
        await saveAdminLandmark(id, payload);
        setEditing(null);
        await load();
    };

    const handleToggleActive = async (l) => {
        if (l.isActive && !window.confirm(`Ẩn địa danh "${l.name}"? Địa danh sẽ không hiện ở trang public.`)) return;
        setBusyId(l.id);
        setError("");
        try {
            if (l.isActive) {
                await deactivateAdminLandmark(l.id);
            } else {
                await saveAdminLandmark(l.id, { ...toPayload(l), isActive: true });
            }
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
                <SearchBox placeholder="Landmark name..." onSearch={(q) => changeFilter("q", q)} />
                <DestinationSelect groups={destinationGroups} value={filters.destinationId} onChange={(e) => changeFilter("destinationId", e.target.value)} allLabel="All destinations" />
                <select value={filters.category} onChange={(e) => changeFilter("category", e.target.value)} className="rounded-lg border-gray-200 text-sm">
                    <option value="all">All categories</option>
                    {LANDMARK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filters.status} onChange={(e) => changeFilter("status", e.target.value)} className="rounded-lg border-gray-200 text-sm">
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Hidden</option>
                </select>
                <span className="text-sm text-gray-500">{result.total.toLocaleString()} landmarks</span>
                {editing !== "new" && <div className="ml-auto"><AddButton onClick={() => setEditing("new")}>New landmark</AddButton></div>}
            </div>
            <FormAlert>{error}</FormAlert>
            {editing === "new" && (
                <LandmarkForm
                    initial={{ ...EMPTY, destinationId: filters.destinationId }}
                    destinationGroups={destinationGroups}
                    onSave={(p) => handleSave(null, p)}
                    onCancel={() => setEditing(null)}
                />
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[860px]">
                    <thead className="bg-gray-50">
                        <tr className="text-xs uppercase text-gray-500">
                            <th className="px-4 py-3">Landmark</th>
                            <th className="px-4 py-3">Destination</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Entry fee</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>}
                        {!loading && result.items.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Không có địa danh nào.</td></tr>
                        )}
                        {!loading &&
                            result.items.map((l) => (
                                <Fragment key={l.id}>
                                    {editing === l.id ? (
                                        <tr className="border-t border-gray-100">
                                            <td colSpan={6} className="px-4 py-3">
                                                <LandmarkForm
                                                    initial={{ ...EMPTY, ...l }}
                                                    destinationGroups={destinationGroups}
                                                    onSave={(p) => handleSave(l.id, p)}
                                                    onCancel={() => setEditing(null)}
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr className="border-t border-gray-100">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Thumbnail url={l.coverImageUrl} icon="photo_camera" />
                                                    <span className="font-semibold">{l.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{l.destinationName}</td>
                                            <td className="px-4 py-3 capitalize">{l.category}</td>
                                            <td className="px-4 py-3">{l.entryFee == null ? "—" : l.entryFee === 0 ? "Free" : formatMoney(l.entryFee)}</td>
                                            <td className="px-4 py-3"><StatusLabel active={l.isActive} /></td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <ActionButton onClick={() => setEditing(l.id)}>Edit</ActionButton>
                                                    <ActionButton tone={l.isActive ? "danger" : "success"} disabled={busyId === l.id} onClick={() => handleToggleActive(l)}>
                                                        {l.isActive ? "Hide" : "Restore"}
                                                    </ActionButton>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                    </tbody>
                </table>
            </div>

            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

export default LandmarksTab;
