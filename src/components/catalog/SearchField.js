export const fieldInputClass = "bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline p-0";

/** Trường nhập liệu có biểu tượng cho bảng tìm kiếm. */
function SearchField({ label, icon, children }) {
    return (
        <div className="space-y-2">
            <label className="block text-[0.75rem] uppercase font-bold tracking-wider text-on-surface-variant">{label}</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg border-b-2 border-transparent focus-within:border-primary-fixed-dim transition-all">
                <span className="material-symbols-outlined text-primary-container">{icon}</span>
                {children}
            </div>
        </div>
    );
}

export default SearchField;
