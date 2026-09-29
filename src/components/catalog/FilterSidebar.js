/** Thanh bộ lọc cho danh mục. */
function FilterSidebar({ title = "Refine Selection", onReset, children }) {
    return (
        <aside className="w-full md:w-72 flex-shrink-0 space-y-10">
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-headline font-bold text-xl text-primary">{title}</h3>
                    {onReset && (
                        <button type="button" onClick={onReset} className="text-xs font-bold text-primary hover:underline">
                            Reset
                        </button>
                    )}
                </div>
                <div className="space-y-8">{children}</div>
            </div>
        </aside>
    );
}

/** Nhóm lựa chọn trong thanh bộ lọc. */
export function FilterGroup({ title, children }) {
    return (
        <div className="space-y-4">
            <h4 className="text-[0.75rem] uppercase font-extrabold tracking-widest text-on-surface-variant">{title}</h4>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

/** Ô chọn trong thanh bộ lọc. */
export function FilterCheckbox({ label, checked, onChange }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <input
                checked={checked}
                onChange={(e) => onChange?.(e.target.checked)}
                className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary-fixed-dim"
                type="checkbox"
            />
            <span className="text-sm font-medium group-hover:text-primary transition-colors">{label}</span>
        </label>
    );
}

/** Nút chip trong thanh bộ lọc. */
export function FilterChip({ label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-4 py-2 rounded-full border border-outline-variant text-sm font-bold hover:border-primary hover:text-primary transition-all ${active ? "border-primary text-primary bg-primary-fixed/40" : ""}`}
        >
            {label}
        </button>
    );
}

export default FilterSidebar;
