import { useCallback, useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import { deleteAdminContinent, fetchAdminContinents, saveAdminContinent } from "../../../services/adminGeographyService";
import { ActionButton, AddButton, Field, InlineForm, inputClass } from "./shared";
import { useT } from "../../../i18n/I18nContext";

function ContinentForm({ initial, onSave, onCancel }) {
    const t = useT();
    return (
        <InlineForm initial={initial} onSave={(f) => onSave({ code: f.code.trim(), name: f.name.trim() })} onCancel={onCancel}>
            {(form, set) => (
                <div className="grid sm:grid-cols-3 gap-3">
                    <Field label={t("admin.geography.continentCode")}>
                        <input required maxLength={2} value={form.code} onChange={set("code")} className={`${inputClass} uppercase`} />
                    </Field>
                    <Field label={`${t("admin.geography.name")} *`} className="sm:col-span-2">
                        <input required maxLength={100} value={form.name} onChange={set("name")} className={inputClass} />
                    </Field>
                </div>
            )}
        </InlineForm>
    );
}

function ContinentsTab() {
    const t = useT();
    const [continents, setContinents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // null | "new" | id
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setContinents(await fetchAdminContinents());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleSave = async (id, payload) => {
        await saveAdminContinent(id, payload);
        setEditing(null);
        await load();
    };

    const handleDelete = async (continent) => {
        if (!window.confirm(t("admin.geography.confirmDeleteContinent", { name: continent.name }))) return;
        setBusyId(continent.id);
        setError("");
        try {
            await deleteAdminContinent(continent.id);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{t("admin.geography.deleteContinentNote")}</p>
                {editing !== "new" && <AddButton onClick={() => setEditing("new")}>{t("admin.geography.newContinent")}</AddButton>}
            </div>
            <FormAlert>{error}</FormAlert>
            {editing === "new" && <ContinentForm initial={{ code: "", name: "" }} onSave={(p) => handleSave(null, p)} onCancel={() => setEditing(null)} />}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                {loading && <p className="p-6 text-center text-gray-500">{t("common.state.loading")}</p>}
                {!loading &&
                    continents.map((c) =>
                        editing === c.id ? (
                            <div key={c.id} className="p-3">
                                <ContinentForm initial={{ code: c.code, name: c.name }} onSave={(p) => handleSave(c.id, p)} onCancel={() => setEditing(null)} />
                            </div>
                        ) : (
                            <div key={c.id} className="flex items-center gap-4 px-4 py-3">
                                <span className="w-10 text-xs font-black text-gray-400">{c.code}</span>
                                <span className="font-semibold flex-1">{c.name}</span>
                                <span className="text-xs text-gray-500">{t("admin.geography.countryCount", { count: c.countryCount })}</span>
                                <ActionButton onClick={() => setEditing(c.id)}>{t("common.actions.edit")}</ActionButton>
                                <ActionButton tone="danger" disabled={busyId === c.id} onClick={() => handleDelete(c)}>{t("common.actions.delete")}</ActionButton>
                            </div>
                        )
                    )}
            </div>
        </div>
    );
}

export default ContinentsTab;
