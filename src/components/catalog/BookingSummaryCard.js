/** Thẻ tóm tắt đặt chỗ cố định trên trang chi tiết. */
function BookingSummaryCard({
    eyebrow = "Price",
    price,
    priceSuffix,
    badge,
    children,
    rows = [],
    totalLabel = "Total",
    total,
    ctaLabel,
    onCta,
    ctaDisabled,
    ctaBusy,
    footnote,
    footnoteIcon = "verified_user",
}) {
    return (
        <aside className="relative">
            <div className="sticky top-24 bg-surface-container-lowest rounded-xl p-8 shadow-[0_32px_48px_-12px_rgba(27,28,28,0.06)] border border-outline-variant/15">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <span className="block text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-1">
                            {eyebrow}
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-extrabold text-primary font-headline">{price}</span>
                            {priceSuffix && <span className="text-on-surface-variant font-medium">{priceSuffix}</span>}
                        </div>
                    </div>
                    {badge && <div className="text-right">{badge}</div>}
                </div>
                {children && <div className="space-y-4 mb-8">{children}</div>}
                <div className="space-y-3 mb-8">
                    {rows.map((row, index) => (
                        <div key={row.label || index} className="flex justify-between text-sm">
                            <span className="text-on-surface-variant">{row.label}</span>
                            <span className="font-bold">{row.value}</span>
                        </div>
                    ))}
                    {total != null && (
                        <div className="pt-4 border-t border-outline-variant/10 flex justify-between">
                            <span className="font-bold text-on-surface">{totalLabel}</span>
                            <span className="text-xl font-black text-primary font-headline">{total}</span>
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    disabled={ctaDisabled || ctaBusy}
                    onClick={onCta}
                    className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-lg font-bold font-headline shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mb-4 disabled:opacity-50"
                >
                    {ctaBusy ? "Processing..." : ctaLabel}
                </button>
                {footnote && (
                    <p className="text-center text-[10px] text-on-surface-variant font-medium uppercase tracking-tighter">
                        <span className="material-symbols-outlined text-[14px] align-text-top mr-1">{footnoteIcon}</span>
                        {footnote}
                    </p>
                )}
            </div>
        </aside>
    );
}

export default BookingSummaryCard;
