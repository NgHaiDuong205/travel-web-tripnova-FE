import { useCallback, useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import {
    deleteAdminRole,
    fetchAdminPermissions,
    fetchAdminRoles,
    saveAdminRole,
    updateAdminRolePermissions,
} from "../../../services/adminService";

const EMPTY = { name: "", description: "" };
const inputClass = "rounded-lg border-gray-200 text-sm";

function RoleForm({ initial, isSystem, onSave, onCancel }) {
    const [form, setForm] = useState(initial);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await onSave({ ...form, name: form.name.trim().toUpperCase(), description: form.description?.trim() });
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 bg-blue-50/40 border border-blue-100 rounded-xl p-3">
            <label className="text-xs font-bold text-gray-600">
                Name *
                <input
                    required
                    disabled={isSystem}
                    pattern="[A-Za-z][A-Za-z0-9_]{1,49}"
                    title="Chữ, số, dấu _ (2-50 ký tự), bắt đầu bằng chữ"
                    value={form.name}
                    onChange={set("name")}
                    className={`${inputClass} block w-56 uppercase disabled:bg-gray-100`}
                />
            </label>
            <label className="text-xs font-bold text-gray-600 flex-1 min-w-[220px]">
                Description
                <input maxLength={500} value={form.description || ""} onChange={set("description")} className={`${inputClass} block w-full`} />
            </label>
            <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg text-xs font-bold text-gray-500">Cancel</button>
            {error && <div className="w-full"><FormAlert>{error}</FormAlert></div>}
        </form>
    );
}

function PermissionEditor({ role, permissions, onSave, onCancel }) {
    const [selected, setSelected] = useState(role.permissionIds);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            await onSave(selected);
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <div className="mt-3 border-t border-gray-100 pt-3 space-y-3">
            <div className="grid sm:grid-cols-2 gap-2">
                {permissions.map((p) => (
                    <label key={p.id} className="flex items-start gap-2 text-sm">
                        <input type="checkbox" className="mt-1" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
                        <span>
                            <span className="font-semibold">{p.name}</span>
                            <span className="block text-xs text-gray-500 font-mono">{p.code}</span>
                        </span>
                    </label>
                ))}
            </div>
            <FormAlert>{error}</FormAlert>
            <div className="flex gap-2 justify-end">
                <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500">Cancel</button>
                <button type="button" disabled={saving} onClick={handleSave} className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50">
                    {saving ? "Saving..." : "Save permissions"}
                </button>
            </div>
        </div>
    );
}

function AdminRoles() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(null); // null | "new" | roleId
    const [permissionRoleId, setPermissionRoleId] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [roleList, permissionList] = await Promise.all([fetchAdminRoles(), fetchAdminPermissions()]);
            setRoles(roleList);
            setPermissions(permissionList);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const replaceRole = (updated) => setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));

    const handleSave = async (form) => {
        const saved = await saveAdminRole(form);
        if (form.id) {
            replaceRole(saved);
        } else {
            setRoles((prev) => [...prev, saved]);
        }
        setEditing(null);
    };

    const handleSavePermissions = async (role, permissionIds) => {
        replaceRole(await updateAdminRolePermissions(role.id, permissionIds));
        setPermissionRoleId(null);
    };

    const handleDelete = async (role) => {
        if (!window.confirm(`Xoá role ${role.name}?`)) return;
        setBusyId(role.id);
        setError("");
        try {
            await deleteAdminRole(role.id);
            setRoles((prev) => prev.filter((r) => r.id !== role.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const permissionName = (id) => permissions.find((p) => p.id === id)?.name || id;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-3xl font-extrabold text-primary">Roles &amp; permissions</h1>
                {editing !== "new" && (
                    <button type="button" onClick={() => setEditing("new")} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">
                        + New role
                    </button>
                )}
            </div>
            <p className="text-xs text-gray-500">
                Quyền truy cập API hiện dựa trên role hệ thống (USER, ADMIN, HOTEL_MANAGER). Danh mục permission dùng để mô tả / chuẩn bị
                phân quyền chi tiết. Gán role cho người dùng tại trang Users.
            </p>

            <FormAlert>{error}</FormAlert>
            {editing === "new" && <RoleForm initial={EMPTY} onSave={handleSave} onCancel={() => setEditing(null)} />}
            {loading && <p className="text-gray-500">Đang tải...</p>}

            <div className="space-y-4">
                {!loading &&
                    roles.map((role) => (
                        <article key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            {editing === role.id ? (
                                <RoleForm
                                    initial={{ id: role.id, name: role.name, description: role.description || "" }}
                                    isSystem={role.system}
                                    onSave={handleSave}
                                    onCancel={() => setEditing(null)}
                                />
                            ) : (
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 font-mono">
                                            {role.name}
                                            {role.system && (
                                                <span className="ml-2 text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded align-middle">SYSTEM</span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-500">{role.description || "—"}</p>
                                        <p className="text-xs text-gray-500 mt-1">{role.userCount} users</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setEditing(role.id)} className="px-3 py-1 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">
                                            Edit
                                        </button>
                                        {permissionRoleId !== role.id && (
                                            <button type="button" onClick={() => setPermissionRoleId(role.id)} className="px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 text-primary hover:bg-blue-50">
                                                Permissions
                                            </button>
                                        )}
                                        {!role.system && (
                                            <button
                                                type="button"
                                                disabled={busyId === role.id || role.userCount > 0}
                                                title={role.userCount > 0 ? "Role đang được gán cho người dùng" : ""}
                                                onClick={() => handleDelete(role)}
                                                className="px-3 py-1 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {permissionRoleId === role.id ? (
                                <PermissionEditor
                                    role={role}
                                    permissions={permissions}
                                    onSave={(ids) => handleSavePermissions(role, ids)}
                                    onCancel={() => setPermissionRoleId(null)}
                                />
                            ) : (
                                <div className="flex flex-wrap gap-1 mt-3">
                                    {role.permissionIds.length === 0 && <span className="text-xs text-gray-400">No permissions</span>}
                                    {role.permissionIds.map((id) => (
                                        <span key={id} className="text-[11px] font-semibold bg-blue-50 text-primary px-2 py-0.5 rounded">
                                            {permissionName(id)}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </article>
                    ))}
            </div>
        </div>
    );
}

export default AdminRoles;
