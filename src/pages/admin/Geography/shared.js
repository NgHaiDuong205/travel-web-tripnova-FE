import { useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import { useT } from "../../../i18n/I18nContext";

export const inputClass = "w-full rounded-lg border-gray-200 text-sm";

export function Field({ label, children, className = "" }) {
    return (
        <label className={`block ${className}`}>
            <span className="block text-xs font-bold text-gray-600 mb-1">{label}</span>
            {children}
        </label>
    );
}

/**
 * Khung form inline dùng chung: giữ state form, gọi onSave(form) và hiện lỗi.
 * children(form, set, setForm) render các ô nhập.
 */
export function InlineForm({ initial, onSave, onCancel, children }) {
    const t = useT();
    const [form, setForm] = useState(initial);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = (name) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await onSave(form);
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 space-y-3">
            {children(form, set, setForm)}
            <FormAlert>{error}</FormAlert>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500">{t("common.actions.cancel")}</button>
                <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                    {saving ? t("common.state.saving") : t("common.actions.save")}
                </button>
            </div>
        </form>
    );
}

export function StatusLabel({ active }) {
    const t = useT();
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold ${active ? "text-green-700" : "text-gray-500"}`}>
            <span className="material-symbols-outlined text-sm">{active ? "check_circle" : "visibility_off"}</span>
            {active ? t("common.status.active") : t("admin.geography.hidden")}
        </span>
    );
}

export function ActionButton({ tone = "primary", ...props }) {
    const tones = {
        primary: "border-blue-200 text-primary hover:bg-blue-50",
        danger: "border-red-200 text-red-600 hover:bg-red-50",
        success: "border-green-200 text-green-700 hover:bg-green-50",
    };
    return <button type="button" className={`px-3 py-1 rounded-lg text-xs font-bold border disabled:opacity-50 ${tones[tone]}`} {...props} />;
}

export function AddButton({ children, ...props }) {
    return (
        <button type="button" className="inline-flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold" {...props}>
            <span className="material-symbols-outlined text-base">add</span>
            {children}
        </button>
    );
}

export function Thumbnail({ url, icon }) {
    return url ? (
        <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
    ) : (
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
            <span className="material-symbols-outlined">{icon}</span>
        </div>
    );
}

/** Ô tìm kiếm + nút Search, gọi onSearch khi submit. */
export function SearchBox({ placeholder, onSearch }) {
    const t = useT();
    const [keyword, setKeyword] = useState("");
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSearch(keyword.trim());
            }}
            className="flex gap-2"
        >
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={placeholder} className="rounded-lg border-gray-200 text-sm w-56" />
            <button type="submit" className="bg-primary text-white px-4 rounded-lg text-sm font-bold">{t("common.actions.search")}</button>
        </form>
    );
}
