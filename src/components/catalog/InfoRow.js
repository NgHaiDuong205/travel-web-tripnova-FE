/** Hàng thông tin có biểu tượng trên trang chi tiết. */
function InfoRow({ icon, title, children }) {
    return (
        <div className="flex items-start gap-4">
            <div className="bg-primary-fixed-dim/30 p-2 rounded-lg">
                <span className="material-symbols-outlined text-primary">{icon}</span>
            </div>
            <div>
                <h4 className="font-bold text-on-surface text-sm">{title}</h4>
                <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">{children}</p>
            </div>
        </div>
    );
}

export default InfoRow;
