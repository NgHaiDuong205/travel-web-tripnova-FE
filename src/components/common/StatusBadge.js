/** Nhãn trạng thái dùng chung (booking, payment...). `labels` map status -> {label, className}. */
function StatusBadge({ status, labels }) {
    const config = labels?.[status] ?? {
        label: status,
        className: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${config.className}`}>
            {config.label}
        </span>
    );
}

export default StatusBadge;
