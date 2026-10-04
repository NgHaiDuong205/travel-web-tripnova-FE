import { useTheme } from "../../context/ThemeContext";
import { useT } from "../../i18n/I18nContext";

/** Nút chuyển sáng / tối. `tone="dark"` khi đặt trên nền tối. */
function ThemeToggle({ tone = "light" }) {
    const { isDark, toggle } = useTheme();
    const t = useT();
    const label = isDark ? t("common.theme.switchToLight") : t("common.theme.switchToDark");
    const toneClass = tone === "dark"
        ? "text-white/80 hover:text-white hover:bg-white/10"
        : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high";

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={label}
            title={label}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${toneClass}`}
        >
            <span className="material-symbols-outlined text-[22px]">{isDark ? "light_mode" : "dark_mode"}</span>
        </button>
    );
}

export default ThemeToggle;
