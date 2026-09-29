import { Link } from "react-router-dom";

/** Liên kết quay lại danh sách từ trang chi tiết. */
function DetailBackLink({ to, label }) {
    return (
        <Link to={to} className="group flex items-center gap-2 mb-8 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="text-sm font-medium tracking-tight">{label}</span>
        </Link>
    );
}

export default DetailBackLink;
