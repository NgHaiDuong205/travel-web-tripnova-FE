import { Fragment, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import UserAvatar from "../../../components/common/UserAvatar";
import { useAuth } from "../../../context/AuthContext";
import {
    ALL_ROLES,
    deleteAdminUser,
    fetchAdminRoles,
    fetchAdminUsers,
    updateAdminUser,
    updateAdminUserRoles,
    updateAdminUserStatus,
} from "../../../services/adminService";
import { formatDateTime } from "../../../utils/formatters";
import AdminStatsPanel from "../../../components/admin/AdminStatsPanel";
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 20;
const inputClass = "rounded-lg border-gray-200 text-sm";

function RoleEditor({ user, roleNames, onSave, onCancel, saving }) {
    const t = useT();
    const [roles, setRoles] = useState(user.roles);
    const toggle = (role) =>
        setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
    return (
        <div className="flex flex-wrap items-center gap-3">
            {roleNames.map((role) => (
                <label key={role} className="flex items-center gap-1 text-xs font-semibold">
                    <input type="checkbox" checked={roles.includes(role)} onChange={() => toggle(role)} />
                    {role}
                </label>
            ))}
            <button type="button" disabled={saving || roles.length === 0} onClick={() => onSave(roles)} className="px-3 py-1 rounded-lg text-xs font-bold bg-primary text-white disabled:opacity-50">
                {t("common.actions.save")}
            </button>
            <button type="button" onClick={onCancel} className="px-3 py-1 rounded-lg text-xs font-bold text-gray-500">
                {t("common.actions.cancel")}
            </button>
        </div>
    );
}

function ProfileEditor({ user, onSave, onCancel, saving }) {
    const t = useT();
    const [form, setForm] = useState({
        fullName: user.fullName || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
    });
    const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));
    const handleSubmit = (e) => {
        e.preventDefault();
        // PUT ghi đè toàn bộ hồ sơ -> giữ nguyên avatar hiện tại
        onSave({ ...form, fullName: form.fullName.trim(), dateOfBirth: form.dateOfBirth || null, avatarUrl: user.avatarUrl });
    };
    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 bg-blue-50/40 border border-blue-100 rounded-xl p-3">
            <label className="text-xs font-bold text-gray-600 flex-1 min-w-[180px]">
                {t("common.fields.fullName")} *
                <input required maxLength={150} value={form.fullName} onChange={set("fullName")} className={`${inputClass} block w-full`} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("common.fields.phone")}
                <input maxLength={20} value={form.phone} onChange={set("phone")} className={`${inputClass} block w-40`} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("admin.users.dateOfBirth")}
                <input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} className={`${inputClass} block`} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("admin.users.gender")}
                <select value={form.gender} onChange={set("gender")} className={`${inputClass} block`}>
                    <option value="">—</option>
                    <option value="male">{t("admin.users.male")}</option>
                    <option value="female">{t("admin.users.female")}</option>
                    <option value="other">{t("admin.users.other")}</option>
                </select>
            </label>
            <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                {saving ? t("common.state.saving") : t("common.actions.save")}
            </button>
            <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg text-xs font-bold text-gray-500">{t("common.actions.cancel")}</button>
        </form>
    );
}

function AdminUsers() {
    const t = useT();
    const { user: me } = useAuth();
    // ?q= cho phép trang khác (VD Hotel Managers) mở sẵn kết quả tìm một tài khoản.
    const [searchParams] = useSearchParams();
    const initialQ = searchParams.get("q") || "";
    const [filters, setFilters] = useState({ q: initialQ, role: "all", status: "all" });
    const [keyword, setKeyword] = useState(initialQ);
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [profileEditingId, setProfileEditingId] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [roleNames, setRoleNames] = useState(ALL_ROLES);

    useEffect(() => {
        fetchAdminRoles()
            .then((roles) => setRoleNames(roles.map((r) => r.name)))
            .catch(() => {}); // giữ danh sách role hệ thống mặc định
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setResult(await fetchAdminUsers({ ...filters, page, limit: PAGE_SIZE }));
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

    const replaceUser = (updated) =>
        setResult((prev) => ({ ...prev, items: prev.items.map((u) => (u.id === updated.id ? updated : u)) }));

    const handleToggleActive = async (u) => {
        if (u.isActive && !window.confirm(t("admin.users.confirmLock", { email: u.email }))) return;
        setBusyId(u.id);
        setError("");
        try {
            replaceUser(await updateAdminUserStatus(u.id, !u.isActive));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleSaveRoles = async (u, roles) => {
        setBusyId(u.id);
        setError("");
        try {
            replaceUser(await updateAdminUserRoles(u.id, roles));
            setEditingId(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleSaveProfile = async (u, profile) => {
        setBusyId(u.id);
        setError("");
        try {
            replaceUser(await updateAdminUser(u.id, profile));
            setProfileEditingId(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (u) => {
        if (!window.confirm(t("admin.users.confirmDelete", { email: u.email }))) return;
        setBusyId(u.id);
        setError("");
        try {
            await deleteAdminUser(u.id);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">{t("admin.users.title")}</h1>
            <AdminStatsPanel section="users" />

            <div className="flex flex-wrap gap-3 items-center">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        changeFilter("q", keyword.trim());
                    }}
                    className="flex gap-2"
                >
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder={t("admin.users.searchPlaceholder")}
                        className="rounded-lg border-gray-200 text-sm w-64"
                    />
                    <button type="submit" className="bg-primary text-white px-4 rounded-lg text-sm font-bold">{t("common.actions.search")}</button>
                </form>
                <select value={filters.role} onChange={(e) => changeFilter("role", e.target.value)} className="rounded-lg border-gray-200 text-sm">
                    <option value="all">{t("admin.users.allRoles")}</option>
                    {roleNames.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={filters.status} onChange={(e) => changeFilter("status", e.target.value)} className="rounded-lg border-gray-200 text-sm">
                    <option value="all">{t("common.status.all")}</option>
                    <option value="active">{t("admin.status.active")}</option>
                    <option value="locked">{t("admin.users.locked")}</option>
                </select>
                <span className="ml-auto text-sm text-gray-500">{t("admin.users.count", { count: result.total })}</span>
            </div>

            <p className="text-xs text-gray-500">{t("admin.users.statusNote")}</p>
            <FormAlert>{error}</FormAlert>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[900px]">
                    <thead className="bg-gray-50">
                        <tr className="text-xs uppercase text-gray-500">
                            <th className="px-4 py-3">{t("admin.users.user")}</th>
                            <th className="px-4 py-3">{t("common.fields.phone")}</th>
                            <th className="px-4 py-3">{t("admin.users.roles")}</th>
                            <th className="px-4 py-3">{t("admin.users.lastLogin")}</th>
                            <th className="px-4 py-3">{t("common.fields.status")}</th>
                            <th className="px-4 py-3 text-right">{t("admin.users.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{t("common.state.loading")}</td></tr>}
                        {!loading && result.items.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{t("admin.users.empty")}</td></tr>
                        )}
                        {!loading &&
                            result.items.map((u) => {
                                const isMe = u.id === me?.id;
                                return (
                                    <Fragment key={u.id}>
                                    <tr className="border-t border-gray-100">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar user={u} size="w-9 h-9" textSize="text-xs" />
                                                <div className="min-w-0">
                                                    <p className="font-semibold truncate">{u.fullName}{isMe ? t("admin.users.you") : ""}</p>
                                                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{u.phone || "—"}</td>
                                        <td className="px-4 py-3">
                                            {editingId === u.id ? (
                                                <RoleEditor
                                                    user={u}
                                                    roleNames={roleNames}
                                                    saving={busyId === u.id}
                                                    onSave={(roles) => handleSaveRoles(u, roles)}
                                                    onCancel={() => setEditingId(null)}
                                                />
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {u.roles.map((r) => (
                                                        <span key={r} className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{r}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 text-xs font-bold ${u.isActive ? "text-green-700" : "text-red-600"}`}>
                                                <span className="material-symbols-outlined text-sm">{u.isActive ? "check_circle" : "block"}</span>
                                                {u.isActive ? t("admin.status.active") : t("admin.users.locked")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                {editingId !== u.id && (
                                                    <button type="button" onClick={() => setEditingId(u.id)} className="px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 text-primary hover:bg-blue-50">
                                                        {t("admin.users.roles")}
                                                    </button>
                                                )}
                                                {!isMe && (
                                                    <button
                                                        type="button"
                                                        disabled={busyId === u.id}
                                                        onClick={() => handleToggleActive(u)}
                                                        className={`px-3 py-1 rounded-lg text-xs font-bold border disabled:opacity-50 ${
                                                            u.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-700 hover:bg-green-50"
                                                        }`}
                                                    >
                                                        {u.isActive ? t("admin.users.lock") : t("admin.users.unlock")}
                                                    </button>
                                                )}
                                                {profileEditingId !== u.id && (
                                                    <button type="button" onClick={() => setProfileEditingId(u.id)} className="px-3 py-1 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">
                                                        {t("common.actions.edit")}
                                                    </button>
                                                )}
                                                {!isMe && (
                                                    <button
                                                        type="button"
                                                        disabled={busyId === u.id}
                                                        onClick={() => handleDelete(u)}
                                                        className="px-3 py-1 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        {t("common.actions.delete")}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {profileEditingId === u.id && (
                                        <tr>
                                            <td colSpan={6} className="px-4 pb-4">
                                                <ProfileEditor
                                                    user={u}
                                                    saving={busyId === u.id}
                                                    onSave={(profile) => handleSaveProfile(u, profile)}
                                                    onCancel={() => setProfileEditingId(null)}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                    </Fragment>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

export default AdminUsers;
