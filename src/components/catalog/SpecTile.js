/** Ô thông số nổi bật trên trang chi tiết. */
function SpecTile({ icon, label, value }) {
    return (
        <div className="bg-surface-container-low p-6 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-primary mb-3 text-3xl">{icon}</span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{label}</span>
            <span className="text-sm font-bold text-on-surface">{value}</span>
        </div>
    );
}

export default SpecTile;
