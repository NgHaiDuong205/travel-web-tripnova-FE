const FILLED = { fontVariationSettings: "'FILL' 1" };

/**
 * Hàng sao 1..5. Có `onChange` thì thành ô chọn điểm (bấm lại sao đang chọn để bỏ chọn).
 * `value` có thể lẻ (4.3) khi chỉ hiển thị: làm tròn tới nửa sao.
 */
function StarRating({ value = 0, onChange, size = "text-[18px]", className = "" }) {
    const rounded = Math.round((value || 0) * 2) / 2;
    return (
        <div className={`inline-flex items-center text-amber-500 ${className}`} aria-label={`${value || 0} out of 5`}>
            {[1, 2, 3, 4, 5].map((star) => {
                const icon = rounded >= star ? "star" : rounded >= star - 0.5 ? "star_half" : "star";
                const filled = rounded >= star - 0.5;
                const span = (
                    <span
                        className={`material-symbols-outlined ${size} ${filled ? "" : "text-outline-variant"}`}
                        style={filled ? FILLED : undefined}
                    >
                        {icon}
                    </span>
                );
                if (!onChange) return <span key={star}>{span}</span>;
                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(value === star ? null : star)}
                        className="hover:scale-110 transition-transform"
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    >
                        {span}
                    </button>
                );
            })}
        </div>
    );
}

export default StarRating;
