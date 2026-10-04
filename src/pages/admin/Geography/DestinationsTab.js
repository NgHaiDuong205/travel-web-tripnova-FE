import { Fragment, useCallback, useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import {
    deactivateAdminDestination,
    fetchAdminCountries,
    fetchAdminDestinations,
    saveAdminDestination,
    toNumberOrNull,
} from "../../../services/adminGeographyService";
import { ActionButton, AddButton, Field, InlineForm, SearchBox, StatusLabel, Thumbnail, inputClass } from "./shared";
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 20;
const EMPTY = { countryId: "", name: "", description: "", coverImageUrl: "", latitude: "", longitude: "", isPopular: false, isActive: true };

function toPayload(form) {
    return {
        countryId: form.countryId,
        name: form.name.trim(),
        description: form.description || null,
        coverImageUrl: form.coverImageUrl || null,
        latitude: toNumberOrNull(form.latitude),
        longitude: toNumberOrNull(form.longitude),
        isPopular: !!form.isPopular,
        isActive: !!form.isActive,
    };
}

function DestinationForm({ initial, countries, onSave, onCancel }) {
    const t = useT();
    return (
        <InlineForm initial={initial} onSave={(f) => onSave(toPayload(f))} onCancel={onCancel}>
            {(form, set) => (
                <>
                    <div className="grid md:grid-cols-3 gap-3">
                        <Field label={`${t("admin.geography.name")} *`}>
                            <input required maxLength={150} value={form.name} onChange={set("name")} className={inputClass} />
                        </Field>
                        <Field label={`${t("admin.geography.country")} *`}>
                            <select required value={form.countryId} onChange={set("countryId")} className={inputClass}>
                                <option value="">—</option>
                                {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </Field>
                        <Field label={t("admin.geography.coverImageUrl")}>
                            <input type="url" value={form.coverImageUrl || ""} onChange={set("coverImageUrl")} className={inputClass} />
                        </Field>
                        <Field label={t("admin.geography.latitude")}>
                            <input type="number" step="any" min={-90} max={90} value={form.latitude ?? ""} onChange={set("latitude")} className={inputClass} />
                        </Field>
                        <Field label={t("admin.geography.longitude")}>
                            <input type="number" step="any" min={-180} max={180} value={form.longitude ?? ""} onChange={set("longitude")} className={inputClass} />
                        </Field>
                        <div className="flex items-end gap-4 pb-2">
                            <label className="flex items-center gap-2 text-sm font-semibold">
                                <input type="checkbox" checked={!!form.isPopular} onChange={set("isPopular")} /> {t("admin.geography.popular")}
                            </label>
                            <label className="flex items-center gap-2 text-sm font-semibold">
                                <input type="checkbox" checked={!!form.isActive} onChange={set("isActive")} /> {t("common.status.active")}
                            </label>
                        </div>
                    </div>
                    <Field label={t("admin.geography.description")}>
                        <textarea rows={2} value={form.description || ""} onChange={set("description")} className={inputClass} />
                    </Field>
                </>
            )}
        </InlineForm>
    );
}

function DestinationsTab() {
    const t = useT();
    const [filters, setFilters] = useState({ q: "", countryId: "", status: "all" });
    const [page, setPage] = useState(1);
    const [countries, setCountries] = useState([]);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAdminCountries().then(setCountries).catch((err) => setError(err.message));
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setResult(await fetchAdminDestinations({ ...filters, page, limit: PAGE_SIZE }));
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
        await saveAdminDestination(id, payload);
        setEditing(null);
        await load();
    };

    const handleToggleActive = async (d) => {
        if (d.isActive && !window.confirm(t("admin.geography.confirmHideDestination", { name: d.name }))) return;
        setBusyId(d.id);
        setError("");
        try {
            if (d.isActive) {
                await deactivateAdminDestination(d.id);
            } else {
                await saveAdminDestination(d.id, { ...toPayload(d), isActive: true });
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
                <SearchBox placeholder={t("admin.geography.destinationSearchPlaceholder")} onSearch={(q) => changeFilter("q", q)} />
                <select value={filters.countryId} onChange={(e) => changeFilter("countryId", e.target.value)} className="rounded-lg border-gray-200 text-sm">
                    <option value="">{t("admin.geography.allCountries")}</option>
                    {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={filters.status} onChange={(e) => changeFilter("status", e.target.value)} className="rounded-lg border-gray-200 text-sm">
                    <option value="all">{t("common.status.all")}</option><option value="active">{t("common.status.active")}</option><option value="inactive">{t("admin.geography.hidden")}</option>
                </select>
                <span className="text-sm text-gray-500">{t("admin.geography.destinationCount", { count: result.total })}</span>
                {editing !== "new" && <div className="ml-auto"><AddButton onClick={() => setEditing("new")}>{t("admin.geography.newDestination")}</AddButton></div>}
            </div>
            <FormAlert>{error}</FormAlert>
            {editing === "new" && (
                <DestinationForm initial={{ ...EMPTY, countryId: filters.countryId }} countries={countries} onSave={(p) => handleSave(null, p)} onCancel={() => setEditing(null)} />
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[860px]">
                    <thead className="bg-gray-50">
                        <tr className="text-xs uppercase text-gray-500">
                            <th className="px-4 py-3">{t("admin.geography.destination")}</th><th className="px-4 py-3">{t("admin.geography.country")}</th><th className="px-4 py-3">{t("admin.geography.hotels")}</th><th className="px-4 py-3">{t("admin.geography.landmarks")}</th><th className="px-4 py-3">{t("admin.geography.popular")}</th><th className="px-4 py-3">{t("common.fields.status")}</th><th className="px-4 py-3 text-right">{t("admin.geography.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">{t("common.state.loading")}</td></tr>}
                        {!loading && result.items.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">{t("admin.geography.emptyDestinations")}</td></tr>
                        )}
                        {!loading &&
                            result.items.map((d) => (
                                <Fragment key={d.id}>
                                    {editing === d.id ? (
                                        <tr className="border-t border-gray-100">
                                            <td colSpan={7} className="px-4 py-3">
                                                <DestinationForm initial={{ ...EMPTY, ...d }} countries={countries} onSave={(p) => handleSave(d.id, p)} onCancel={() => setEditing(null)} />
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr className="border-t border-gray-100">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Thumbnail url={d.coverImageUrl} icon="location_city" />
                                                    <span className="font-semibold">{d.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{d.countryName}</td>
                                            <td className="px-4 py-3">{d.hotelCount}</td>
                                            <td className="px-4 py-3">{d.landmarkCount}</td>
                                            <td className="px-4 py-3 text-amber-500">{d.isPopular ? "★" : "—"}</td>
                                            <td className="px-4 py-3"><StatusLabel active={d.isActive} /></td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <ActionButton onClick={() => setEditing(d.id)}>{t("common.actions.edit")}</ActionButton>
                                                    <ActionButton tone={d.isActive ? "danger" : "success"} disabled={busyId === d.id} onClick={() => handleToggleActive(d)}>
                                                        {d.isActive ? t("admin.geography.hide") : t("admin.geography.restore")}
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

export default DestinationsTab;
