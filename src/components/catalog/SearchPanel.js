import { useT } from "../../i18n/I18nContext";

const columnClasses = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5" };

/** Bảng tìm kiếm dùng chung cho các danh mục. */
function SearchPanel({ columns = 4, onSubmit, submitLabel, submitIcon = "arrow_forward", children, footer }) {
    const t = useT();
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit?.();
            }}
            className="bg-surface p-8 rounded-xl shadow-2xl max-w-5xl w-full"
        >
            <div className={`grid grid-cols-1 gap-6 ${columnClasses[columns] || columnClasses[4]}`}>{children}</div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <div>{footer}</div>
                <button
                    type="submit"
                    className="editorial-gradient text-on-primary px-10 py-3.5 rounded-lg font-bold text-base hover:opacity-90 transition-all flex items-center gap-2"
                >
                    {submitLabel || t("common.actions.search")}
                    <span className="material-symbols-outlined">{submitIcon}</span>
                </button>
            </div>
        </form>
    );
}

export default SearchPanel;
