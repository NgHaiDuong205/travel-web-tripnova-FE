/** Phân trang đơn giản: « 1 2 3 » (page bắt đầu từ 1). */
function Pagination({ page, total, limit, onChange }) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    if (totalPages <= 1) return null;

    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);

    const buttonClass = "w-10 h-10 rounded-lg text-sm font-bold transition-colors";
    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => onChange(page - 1)}
                className={`${buttonClass} hover:bg-surface-container-low disabled:opacity-30`}
                aria-label="Previous page"
            >
                <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {pages.map((p) => (
                <button
                    key={p}
                    type="button"
                    onClick={() => onChange(p)}
                    className={`${buttonClass} ${p === page ? "bg-primary text-on-primary" : "hover:bg-surface-container-low"}`}
                >
                    {p}
                </button>
            ))}
            <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onChange(page + 1)}
                className={`${buttonClass} hover:bg-surface-container-low disabled:opacity-30`}
                aria-label="Next page"
            >
                <span className="material-symbols-outlined">chevron_right</span>
            </button>
        </div>
    );
}

export default Pagination;
