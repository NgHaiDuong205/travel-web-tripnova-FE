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
import { useT } from "../../../i18n/I18nContext";

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
    const t = useT();
    return (
        <InlineForm initial={initial} onSave={(f) => onSave(toPayload(f))} onCancel={onCancel}>
            {(form, set) => (
                <div className="grid md:grid-cols-3 gap-3">
                    <Field label={`${t("admin.geography.name")} *`}>
                        <input required maxLength={100} value={form.name} onChange={set("name")} className={inputClass} />
                    </Field>
                    <Field label={t("admin.geography.countryCode")}>
                        <input required maxLength={3} value={form.countryCode} onChange={set("countryCode")} className={`${inputClass} uppercase`} />
                    </Field>
                    <Field label={`${t("admin.geography.continent")} *`}>
                        <select required value={form.continentId} onChange={set("continentId")} className={inputClass}>
                            <option value="">—</option>
                            {continents.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </Field>
                    <Field label={t("admin.geography.slug")}>
                        <input maxLength={150} value={form.slug || ""} onChange={set("slug")} placeholder={t("admin.geography.slugPlaceholder")} className={inputClass} />
                    </Field>
                    <Field label={t("admin.geography.latitude")}>
                        <input type="number" step="any" min={-90} max={90} value={form.latitude ?? ""} onChange={set("latitude")} className={inputClass} />
                    </Field>
                    <Field label={t("admin.geography.longitude")}>
                        <input type="number" step="any" min={-180} max={180} value={form.longitude ?? ""} onChange={set("longitude")} className={inputClass} />
                    </Field>
                    <Field label={t("admin.geography.imageUrl")} className="md:col-span-3">
                        <input type="url" maxLength={255} value={form.imageUrl || ""} onChange={set("imageUrl")} className={inputClass} />
                    </Field>
                    <Field label={t("admin.geography.description")} className="md:col-span-3">
                        <textarea rows={2} value={form.description || ""} onChange={set("description")} className={inputClass} />
                    </Field>
                </div>
            )}
        </InlineForm>
    );
}

function CountriesTab() {
    const t = useT();
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
        if (!window.confirm(t("admin.geography.confirmDeleteCountry", { name: country.name }))) return;
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
                <SearchBox placeholder={t("admin.geography.countrySearchPlaceholder")} onSearch={(q) => setFilters((f) => ({ ...f, q }))} />
                <select value={filters.continentId} onChange={(e) => setFilters((f) => ({ ...f, continentId: e.target.value }))} className="rounded-lg border-gray-200 text-sm">
                    <option value="">{t("admin.geography.allContinents")}</option>
                    {continents.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <span className="text-sm text-gray-500">{t("admin.geography.countryCount", { count: countries.length })}</span>
                {editing !== "new" && <div className="ml-auto"><AddButton onClick={() => setEditing("new")}>{t("admin.geography.newCountry")}</AddButton></div>}
            </div>
            <p className="text-xs text-gray-500">{t("admin.geography.deleteCountryNote")}</p>
            <FormAlert>{error}</FormAlert>
            {editing === "new" && (
                <CountryForm initial={{ ...EMPTY, continentId: filters.continentId }} continents={continents} onSave={(p) => handleSave(null, p)} onCancel={() => setEditing(null)} />
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[720px]">
                    <thead className="bg-gray-50">
                        <tr className="text-xs uppercase text-gray-500">
                            <th className="px-4 py-3">{t("admin.geography.country")}</th><th className="px-4 py-3">{t("admin.geography.code")}</th><th className="px-4 py-3">{t("admin.geography.continent")}</th><th className="px-4 py-3">{t("admin.geography.destinations")}</th><th className="px-4 py-3 text-right">{t("admin.geography.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">{t("common.state.loading")}</td></tr>}
                        {!loading && countries.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">{t("admin.geography.emptyCountries")}</td></tr>
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
                                                    <ActionButton onClick={() => setEditing(c.id)}>{t("common.actions.edit")}</ActionButton>
                                                    <ActionButton tone="danger" disabled={busyId === c.id} onClick={() => handleDelete(c)}>{t("common.actions.delete")}</ActionButton>
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
