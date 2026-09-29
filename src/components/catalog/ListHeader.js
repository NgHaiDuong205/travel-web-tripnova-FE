/** Tiêu đề và điều khiển sắp xếp danh sách. */
function ListHeader({ eyebrow, title, sortOptions = [], sort, onSortChange }) {
    return (
        <div className="flex justify-between items-end mb-10">
            <div>
                {eyebrow && (
                    <p className="text-[0.75rem] uppercase font-extrabold tracking-widest text-on-surface-variant mb-2">
                        {eyebrow}
                    </p>
                )}
                <h2 className="font-headline text-3xl font-bold text-on-surface">{title}</h2>
            </div>
            <label className="flex items-center gap-2 text-sm font-bold text-primary">
                Sort by:
                <select
                    value={sort}
                    onChange={(e) => onSortChange?.(e.target.value)}
                    className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer"
                >
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
}

export default ListHeader;
