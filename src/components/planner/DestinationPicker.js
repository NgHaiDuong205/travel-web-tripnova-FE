import { useEffect, useRef, useState } from "react";
import { fetchDestinationPage, findDestinationByName } from "../../services/destinationService";
import { useT } from "../../i18n/I18nContext";

/** Gợi ý nhanh: các điểm đến có nhiều địa danh + quán ăn có toạ độ nhất (lịch trình đầy đủ, bản đồ đẹp). */
const SUGGESTED = ["Hanoi", "Ho Chi Minh City", "Da Nang", "Hoi An", "Hue", "Nha Trang", "Da Lat", "Ha Long Bay", "Sa Pa", "Phu Quoc"];

/**
 * Ô chọn điểm đến có gợi ý (gõ ≥ 1 ký tự → /api/destinations/?q=, chờ 250ms) + chip điểm đến gợi ý.
 * value: { id, name, countryName } | null.
 */
function DestinationPicker({ value, onChange }) {
    const t = useT();
    const [query, setQuery] = useState(value?.name || "");
    const [options, setOptions] = useState(null); // null = đang tìm (chưa báo "không tìm thấy")
    const [open, setOpen] = useState(false);
    const [popular, setPopular] = useState([]);
    const boxRef = useRef(null);

    // Chỉ đồng bộ khi có giá trị (chọn từ ngoài / khôi phục); gõ chữ làm value = null nhưng phải giữ chữ đang gõ.
    useEffect(() => {
        if (value?.name) setQuery(value.name);
    }, [value]);

    useEffect(() => {
        let cancelled = false;
        Promise.all(SUGGESTED.map((name) => findDestinationByName(name).catch(() => null)))
            .then((found) => !cancelled && setPopular(found.filter(Boolean)));
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const q = query.trim();
        if (!open || !q || q === value?.name) {
            setOptions(null);
            return undefined;
        }
        let cancelled = false;
        setOptions(null);
        const timer = setTimeout(() => {
            fetchDestinationPage({ q, limit: 8 })
                .then(({ items }) => !cancelled && setOptions(items))
                .catch(() => !cancelled && setOptions([]));
        }, 250);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query, open, value]);

    useEffect(() => {
        const close = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const pick = (d) => {
        onChange({ id: d.id, name: d.name, countryName: d.countryName });
        setQuery(d.name);
        setOpen(false);
    };

    return (
        <div ref={boxRef} className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="planner-destination">
                {t("planner.form.destination")}
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">travel_explore</span>
                <input
                    id="planner-destination"
                    type="text"
                    autoComplete="off"
                    value={query}
                    placeholder={t("planner.form.destinationPlaceholder")}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                        if (value) onChange(null);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && options?.length > 0) {
                            e.preventDefault();
                            pick(options[0]);
                        }
                        if (e.key === "Escape") setOpen(false);
                    }}
                    className="w-full border-0 bg-transparent py-3 text-on-surface focus:ring-0"
                />
                {value && <span className="material-symbols-outlined text-green-600" aria-hidden="true">check_circle</span>}
            </div>
            {open && query.trim() && !value && (
                <ul className="absolute z-30 mt-1 w-full rounded-xl border border-outline-variant/30 bg-white shadow-xl max-h-72 overflow-auto">
                    {options === null ? (
                        <li className="px-4 py-3"><div className="h-4 w-1/2 rounded bg-surface-container-high animate-pulse" /></li>
                    ) : options.length === 0 ? (
                        <li className="px-4 py-3 text-sm text-on-surface-variant">{t("planner.form.noMatch")}</li>
                    ) : options.map((d) => (
                        <li key={d.id}>
                            <button type="button" onClick={() => pick(d)} className="w-full text-left px-4 py-2.5 hover:bg-surface-container-low flex items-center gap-3">
                                <span className="material-symbols-outlined text-on-surface-variant text-[20px]" aria-hidden="true">location_on</span>
                                <span className="min-w-0">
                                    <span className="block font-semibold text-on-surface truncate">{d.name}</span>
                                    {d.countryName && <span className="block text-xs text-on-surface-variant">{d.countryName}</span>}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {popular.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-on-surface-variant">{t("planner.form.popular")}</span>
                    {popular.map((d) => (
                        <button
                            key={d.id}
                            type="button"
                            onClick={() => pick(d)}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${value?.id === d.id
                                ? "border-primary bg-primary text-white"
                                : "border-outline-variant/50 text-on-surface hover:border-primary hover:text-primary"}`}
                        >
                            {d.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DestinationPicker;
