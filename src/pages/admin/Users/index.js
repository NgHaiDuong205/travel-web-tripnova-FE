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

const PAGE_SIZE = 20;
const inputClass = "rounded-lg border-gray-200 text-sm";

function RoleEditor({ user, roleNames, onSave, onCancel, saving }) {
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
                Save
            </button>
            <button type="button" onClick={onCancel} className="px-3 py-1 rounded-lg text-xs font-bold text-gray-500">
                Cancel
            </button>
        </div>
    );
}

function ProfileEditor({ user, onSave, onCancel, saving }) {
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
                Full name *
                <input required maxLength={150} value={form.fullName} onChange={set("fullName")} className={`${inputClass} block w-full`} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Phone
                <input maxLength={20} value={form.phone} onChange={set("phone")} className={`${inputClass} block w-40`} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Date of birth
                <input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} className={`${inputClass} block`} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Gender
                <select value={form.gender} onChange={set("gender")} className={`${inputClass} block`}>
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </label>
            <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg text-xs font-bold text-gray-500">Cancel</button>
        </form>
    );
}

function AdminUsers() {
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
        if (u.isActive && !window.confirm(`Khoá tài khoản ${u.email}? Người dùng sẽ bị đăng xuất khỏi mọi thiết bị.`)) return;
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
        if (!window.confirm(`Xoá tài khoản ${u.email}? Tài khoản bị khoá vĩnh viễn, lịch sử đơn hàng được giữ lại.`)) return;
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
            <h1 className="text-3xl font-extrabold text-primary">Users</h1>
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
                        placeholder="Email, name, phone..."
                        className="rounded-lg border-gray-200 text-sm w-64"
                    />
                    <button type="submit" className="bg-primary text-white px-4 rounded-lg text-sm font-bold">Search</button>
                </form>
                <select value={filters.role} onChange={(e) => changeFilter("role", e.target.value)} className="rounded-lg border-gray-200 text-sm">
                    <option value="all">All roles</option>
                    {roleNames.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={filters.status} onChange={(e) => changeFilter("status", e.target.value)} className="rounded-lg border-gray-200 text-sm">
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="locked">Locked</option>
                </select>
                <span className="ml-auto text-sm text-gray-500">{result.total.toLocaleString()} users</span>
            </div>

            <p className="text-xs text-gray-500">Đổi quyền hoặc khoá tài khoản sẽ buộc người dùng đăng nhập lại để có hiệu lực.</p>
            <FormAlert>{error}</FormAlert>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[900px]">
                    <thead className="bg-gray-50">
                        <tr className="text-xs uppercase text-gray-500">
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Roles</th>
                            <th className="px-4 py-3">Last login</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>}
                        {!loading && result.items.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Không có người dùng nào.</td></tr>
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
                                                    <p className="font-semibold truncate">{u.fullName}{isMe ? " (you)" : ""}</p>
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
                                                {u.isActive ? "Active" : "Locked"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                {editingId !== u.id && (
                                                    <button type="button" onClick={() => setEditingId(u.id)} className="px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 text-primary hover:bg-blue-50">
                                                        Roles
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
                                                        {u.isActive ? "Lock" : "Unlock"}
                                                    </button>
                                                )}
                                                {profileEditingId !== u.id && (
                                                    <button type="button" onClick={() => setProfileEditingId(u.id)} className="px-3 py-1 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">
                                                        Edit
                                                    </button>
                                                )}
                                                {!isMe && (
                                                    <button
                                                        type="button"
                                                        disabled={busyId === u.id}
                                                        onClick={() => handleDelete(u)}
                                                        className="px-3 py-1 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        Delete
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
