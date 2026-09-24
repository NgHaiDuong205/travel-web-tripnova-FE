import { Fragment, useCallback, useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import {
    deleteAdminCountry,
    fetchAdminContinents,
    fetchAdminCountries,
    saveAdminCountry,
    toNumberOrNull,
} from "../../../services/adminGeographyService";
import { ActionButton, AddButton, Field, InlineForm, SearchBox, inputClass } from "./shared";

const EMPTY = { continentId: "", countryCode: "", name: "", slug: "", imageUrl: "", description: "", latitude: "", longitude: "" };

function toPayload(form) {
    return {
        continentId: form.continentId,
        countryCode: form.countryCode.trim(),
        name: form.name.trim(),
        slug: form.slug?.trim() || null,
        imageUrl: form.imageUrl || null,
        description: form.description || null,
        latitude: toNumberOrNull(form.latitude),
        longitude: toNumberOrNull(form.longitude),
    };
}

function CountryForm({ initial, continents, onSave, onCancel }) {
    return (
        <InlineForm initial={initial} onSave={(f) => onSave(toPayload(f))} onCancel={onCancel}>
            {(form, set) => (
                <div className="grid md:grid-cols-3 gap-3">
                    <Field label="Name *">
                        <input required maxLength={100} value={form.name} onChange={set("name")} className={inputClass} />
                    </Field>
                    <Field label="Code * (ISO 3 chữ cái)">
                        <input required maxLength={3} value={form.countryCode} onChange={set("countryCode")} className={`${inputClass} uppercase`} />
                    </Field>
                    <Field label="Continent *">
                        <select required value={form.continentId} onChange={set("continentId")} className={inputClass}>
                            <option value="">—</option>
                            {continents.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Slug">
                        <input maxLength={150} value={form.slug || ""} onChange={set("slug")} placeholder="tự sinh từ tên nếu để trống" className={inputClass} />
                    </Field>
                    <Field label="Latitude">
                        <input type="number" step="any" min={-90} max={90} value={form.latitude ?? ""} onChange={set("latitude")} className={inputClass} />
                    </Field>
                    <Field label="Longitude">
                        <input type="number" step="any" min={-180} max={180} value={form.longitude ?? ""} onChange={set("longitude")} className={inputClass} />
                    </Field>
                    <Field label="Image URL" className="md:col-span-3">
                        <input type="url" maxLength={255} value={form.imageUrl || ""} onChange={set("imageUrl")} className={inputClass} />
                    </Field>
                    <Field label="Description" className="md:col-span-3">
                        <textarea rows={2} value={form.description || ""} onChange={set("description")} className={inputClass} />
                    </Field>
                </div>
            )}
        </InlineForm>
    );
}

function CountriesTab() {
    const [filters, setFilters] = useState({ q: "", continentId: "" });
    const [continents, setContinents] = useState([]);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAdminContinents().then(setContinents).catch((err) => setError(err.message));
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setCountries(await fetchAdminCountries(filters));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSave = async (id, payload) => {
        await saveAdminCountry(id, payload);
        setEditing(null);
        await load();
    };

    const handleDelete = async (country) => {
        if (!window.confirm(`Xoá quốc gia "${country.name}"?`)) return;
        setBusyId(country.id);
        setError("");
        try {
            await deleteAdminCountry(country.id);
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
                <SearchBox placeholder="Name or code..." onSearch={(q) => setFilters((f) => ({ ...f, q }))} />
                <select value={filters.continentId} onChange={(e) => setFilters((f) => ({ ...f, continentId: e.target.value }))} className="rounded-lg border-gray-200 text-sm">
                    <option value="">All continents</option>
                    {continents.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <span className="text-sm text-gray-500">{countries.length} countries</span>
                {editing !== "new" && <div className="ml-auto"><AddButton onClick={() => setEditing("new")}>New country</AddButton></div>}
            </div>
            <p className="text-xs text-gray-500">Chỉ xoá được quốc gia không còn điểm đến nào.</p>
            <FormAlert>{error}</FormAlert>
            {editing === "new" && (
                <CountryForm initial={{ ...EMPTY, continentId: filters.continentId }} continents={continents} onSave={(p) => handleSave(null, p)} onCancel={() => setEditing(null)} />
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[720px]">
                    <thead className="bg-gray-50">
                        <tr className="text-xs uppercase text-gray-500">
                            <th className="px-4 py-3">Country</th>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Continent</th>
                            <th className="px-4 py-3">Destinations</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>}
                        {!loading && countries.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Không có quốc gia nào.</td></tr>
                        )}
                        {!loading &&
                            countries.map((c) => (
                                <Fragment key={c.id}>
                                    {editing === c.id ? (
                                        <tr className="border-t border-gray-100">
                                            <td colSpan={5} className="px-4 py-3">
                                                <CountryForm initial={{ ...EMPTY, ...c }} continents={continents} onSave={(p) => handleSave(c.id, p)} onCancel={() => setEditing(null)} />
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr className="border-t border-gray-100">
                                            <td className="px-4 py-3">
                                                <p className="font-semibold">{c.name}</p>
                                                <p className="text-xs text-gray-400">{c.slug}</p>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-gray-600">{c.countryCode}</td>
                                            <td className="px-4 py-3">{c.continentName}</td>
                                            <td className="px-4 py-3">{c.destinationCount}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <ActionButton onClick={() => setEditing(c.id)}>Edit</ActionButton>
                                                    <ActionButton tone="danger" disabled={busyId === c.id} onClick={() => handleDelete(c)}>Delete</ActionButton>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CountriesTab;
