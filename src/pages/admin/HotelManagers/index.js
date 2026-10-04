import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import { assignHotelManagerHotels, createHotelManager, fetchHotelManagers } from "../../../services/adminService";
import { fetchAdminHotels } from "../../../services/adminHotelService";
import { formatDateTime } from "../../../utils/formatters";
import { useT } from "../../../i18n/I18nContext";

const inputClass = "block mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm";
const EMPTY_FORM = { email: "", fullName: "", phone: "", password: "" };

/**
 * Chọn nhiều khách sạn (tìm theo tên). Hiện người đang quản lý để admin biết khách sạn nào sẽ bị chuyển quản lý.
 * value: [{id, name}]
 */
function HotelPicker({ value, onChange, currentManagerId }) {
    const t = useT();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return undefined;
        }
        let cancelled = false;
        setSearching(true);
        const timer = setTimeout(() => {
            fetchAdminHotels({ q: query.trim(), page: 1, limit: 8 })
                .then((data) => !cancelled && setResults(data.items))
                .catch(() => !cancelled && setResults([]))
                .finally(() => !cancelled && setSearching(false));
        }, 250);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query]);

    const selectedIds = new Set(value.map((h) => h.id));
    const add = (hotel) => {
        if (!selectedIds.has(hotel.id)) onChange([...value, { id: hotel.id, name: hotel.name }]);
        setQuery("");
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {value.length === 0 && <span className="text-xs text-gray-400">{t("admin.hotelManagers.noHotelsSelected")}</span>}
                {value.map((h) => (
                    <span
                        key={h.id}
                        className="inline-flex items-center gap-1 bg-blue-50 text-primary text-xs font-bold px-2 py-1 rounded-full"
                    >
                        {h.name}
                        <button
                            type="button"
                            aria-label={t("admin.hotelManagers.removeHotel", { name: h.name })}
                            onClick={() => onChange(value.filter((x) => x.id !== h.id))}
                            className="hover:text-red-600"
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>
            <div className="relative">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("admin.hotelManagers.searchHotelsPlaceholder")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                {query.trim() && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                        {searching && <li className="px-3 py-2 text-sm text-gray-500">{t("admin.hotelManagers.searching")}</li>}
                        {!searching && results.length === 0 && (
                            <li className="px-3 py-2 text-sm text-gray-500">{t("common.state.noResults")}</li>
                        )}
                        {!searching &&
                            results.map((h) => {
                                const otherManager = h.managedById && h.managedById !== currentManagerId;
                                return (
                                    <li key={h.id}>
                                        <button
                                            type="button"
                                            disabled={selectedIds.has(h.id)}
                                            onClick={() => add(h)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40"
                                        >
                                            <span className="font-semibold">{h.name}</span>
                                            <span className="text-gray-500"> · {h.destinationName}</span>
                                            {!h.isActive && <span className="text-gray-400">{t("admin.hotelManagers.hidden")}</span>}
                                            {otherManager && (
                                                <span className="block text-xs text-amber-700">
                                                    {t("admin.hotelManagers.managedBy", { name: h.managedByName || t("admin.hotelManagers.anotherManager") })}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                    </ul>
                )}
            </div>
        </div>
    );
}

function CreateManagerForm({ onCreated }) {
    const t = useT();
    const [form, setForm] = useState(EMPTY_FORM);
    const [hotels, setHotels] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const created = await createHotelManager({
                email: form.email.trim(),
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                password: form.password,
                hotelIds: hotels.map((h) => h.id),
            });
            setForm(EMPTY_FORM);
            setHotels([]);
            onCreated(created);
        } catch (err) {
            setError(err.details?.length ? err.details.join(" · ") : err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">{t("admin.hotelManagers.createTitle")}</h2>
            <div className="grid md:grid-cols-2 gap-4">
                <label className="text-xs font-semibold text-gray-500">
                    {t("common.fields.email")} *
                    <input type="email" required value={form.email} onChange={set("email")} className={inputClass} />
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    {t("common.fields.fullName")} *
                    <input required value={form.fullName} onChange={set("fullName")} className={inputClass} />
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    {t("common.fields.phone")}
                    <input value={form.phone} onChange={set("phone")} maxLength={20} className={inputClass} />
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    {t("common.fields.password")}
                    <input
                        type="text"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={set("password")}
                        placeholder={t("admin.hotelManagers.passwordPlaceholder")}
                        minLength={8}
                        maxLength={100}
                        className={inputClass}
                    />
                </label>
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">{t("admin.hotelManagers.managedHotels")}</p>
                <HotelPicker value={hotels} onChange={setHotels} />
            </div>
            <FormAlert>{error}</FormAlert>
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                >
                    {saving ? t("admin.hotelManagers.creating") : t("admin.hotelManagers.createAccount")}
                </button>
            </div>
        </form>
    );
}

function ManagerRow({ manager, onUpdated }) {
    const t = useT();
    const [editing, setEditing] = useState(false);
    const [hotels, setHotels] = useState(manager.hotels);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const save = async () => {
        setSaving(true);
        setError("");
        try {
            onUpdated(
                await assignHotelManagerHotels(
                    manager.id,
                    hotels.map((h) => h.id),
                ),
            );
            setEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <tr className="border-t border-gray-100 align-top">
            <td className="px-4 py-3">
                <p className="font-semibold text-gray-900">{manager.fullName}</p>
                <p className="text-xs text-gray-500">{manager.email}</p>
                {manager.phone && <p className="text-xs text-gray-500">{manager.phone}</p>}
            </td>
            <td className="px-4 py-3">
                <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                        manager.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                >
                    {manager.isActive ? t("common.status.active") : t("admin.hotelManagers.locked")}
                </span>
            </td>
            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                {manager.lastLoginAt ? formatDateTime(manager.lastLoginAt) : t("admin.hotelManagers.neverLoggedIn")}
            </td>
            <td className="px-4 py-3 min-w-[320px]">
                {editing ? (
                    <div className="space-y-2">
                        <HotelPicker value={hotels} onChange={setHotels} currentManagerId={manager.id} />
                        <FormAlert>{error}</FormAlert>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={save}
                                disabled={saving}
                                className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                            >
                                {saving ? t("common.state.saving") : t("common.actions.save")}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setHotels(manager.hotels);
                                    setEditing(false);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100"
                            >
                                {t("common.actions.cancel")}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {manager.hotels.length === 0 && <span className="text-xs text-gray-400">{t("admin.hotelManagers.noHotelsAssigned")}</span>}
                        {manager.hotels.map((h) => (
                            <Link
                                key={h.id}
                                to={`/admin/hotels/${h.id}`}
                                className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    h.isActive ? "bg-blue-50 text-primary" : "bg-gray-100 text-gray-500 line-through"
                                }`}
                                title={h.destinationName || ""}
                            >
                                {h.name}
                            </Link>
                        ))}
                    </div>
                )}
            </td>
            <td className="px-4 py-3 text-right whitespace-nowrap">
                {!editing && (
                    <button type="button" onClick={() => setEditing(true)} className="text-primary text-xs font-bold mr-3">
                        {t("admin.hotelManagers.editHotels")}
                    </button>
                )}
                <Link
                    to={`/admin/users?q=${encodeURIComponent(manager.email)}`}
                    className="text-gray-500 text-xs font-bold hover:text-primary"
                >
                    {t("admin.hotelManagers.account")}
                </Link>
            </td>
        </tr>
    );
}

/** Admin tạo tài khoản quản lý khách sạn (role HOTEL_MANAGER) và gán khách sạn; khoá / xoá tài khoản ở trang Users. */
function AdminHotelManagers() {
    const t = useT();
    const [managers, setManagers] = useState(null);
    const [error, setError] = useState("");
    const [created, setCreated] = useState(null);

    const load = useCallback(() => {
        fetchHotelManagers()
            .then(setManagers)
            .catch((err) => {
                setError(err.message);
                setManagers([]);
            });
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleCreated = (manager) => {
        setCreated(manager);
        setManagers((prev) => [manager, ...(prev || [])]);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">{t("admin.hotelManagers.title")}</h1>
            <p className="text-sm text-gray-600 -mt-4">
                {t("admin.hotelManagers.description")} <span className="font-mono">/manager</span>.
            </p>

            {created && (
                <div
                    className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 space-y-1"
                    role="status"
                >
                    <p className="font-bold">{t("admin.hotelManagers.created", { email: created.email })}</p>
                    {created.temporaryPassword ? (
                        <p>
                            {t("admin.hotelManagers.temporaryPassword")}{" "}
                            <code
                                className="bg-white px-2 py-0.5 rounded border border-green-200 font-bold select-all"
                                data-testid="temporary-password"
                            >
                                {created.temporaryPassword}
                            </code>{" "}
                            {t("admin.hotelManagers.temporaryPasswordNote")}
                        </p>
                    ) : (
                        <p>{t("admin.hotelManagers.setPasswordNote")}</p>
                    )}
                    <button type="button" onClick={() => setCreated(null)} className="text-xs font-bold underline">
                        {t("admin.hotelManagers.dismissNotice")}
                    </button>
                </div>
            )}

            <CreateManagerForm onCreated={handleCreated} />

            <FormAlert>{error}</FormAlert>
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm min-w-[860px]">
                    <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-4 py-3">{t("admin.hotelManagers.manager")}</th>
                            <th className="px-4 py-3">{t("common.fields.status")}</th>
                            <th className="px-4 py-3">{t("admin.hotelManagers.lastLogin")}</th>
                            <th className="px-4 py-3">{t("admin.hotelManagers.hotels")}</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {managers === null && (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                                    {t("common.state.loading")}
                                </td>
                            </tr>
                        )}
                        {managers?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                                    {t("admin.hotelManagers.empty")}
                                </td>
                            </tr>
                        )}
                        {managers?.map((m) => (
                            <ManagerRow
                                key={m.id}
                                manager={m}
                                onUpdated={(updated) =>
                                    setManagers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                                }
                            />
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default AdminHotelManagers;
