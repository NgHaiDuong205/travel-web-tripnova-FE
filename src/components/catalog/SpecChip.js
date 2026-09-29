/** Chip thông số nhỏ trên thẻ danh mục. */
function SpecChip({ icon, label }) {
    return (
        <div className="flex flex-col items-center p-2 bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant">{label}</span>
        </div>
    );
}

export default SpecChip;
