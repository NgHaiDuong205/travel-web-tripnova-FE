import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { LANGUAGES } from "../../i18n/languages";

/**
 * Nút chọn ngôn ngữ (danh sách tên bản địa).
 * `tone="dark"`: dùng trên nền tối (footer, sidebar admin); `compact`: chỉ hiện mã ngắn.
 */
function LanguageSwitcher({ tone = "light", compact = false, placement = "down" }) {
    const { t, language, changeLanguage, loading } = useI18n();
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onPointer = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onPointer);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const select = async (code) => {
        setOpen(false);
        if (code !== language.code) await changeLanguage(code);
    };

    const buttonTone = tone === "dark"
        ? "text-white/80 hover:text-white hover:bg-white/10"
        : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high";

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={t("common.language.choose")}
                title={t("common.language.choose")}
                className={`h-9 flex items-center gap-1.5 px-2 rounded-lg font-bold text-sm transition-colors ${buttonTone}`}
            >
                <span className={`material-symbols-outlined text-[20px] ${loading ? "animate-spin" : ""}`}>
                    {loading ? "progress_activity" : "translate"}
                </span>
                <span>{compact ? language.short : language.label}</span>
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            {open && (
                <ul
                    role="listbox"
                    aria-label={t("common.language.choose")}
                    className={`absolute right-0 z-[60] w-48 py-1 rounded-xl border border-outline-variant/40 bg-white shadow-xl ${
                        placement === "up" ? "bottom-full mb-2" : "top-full mt-2"
                    }`}
                >
                    {LANGUAGES.map((l) => {
                        const active = l.code === language.code;
                        return (
                            <li key={l.code} role="option" aria-selected={active}>
                                <button
                                    type="button"
                                    lang={l.code}
                                    onClick={() => select(l.code)}
                                    className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                                        active ? "font-bold text-primary bg-primary-fixed/40" : "text-on-surface hover:bg-surface-container-low"
                                    }`}
                                >
                                    <span>{l.label}</span>
                                    {active && <span className="material-symbols-outlined text-[18px]">check</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default LanguageSwitcher;
