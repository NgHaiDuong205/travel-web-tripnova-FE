import { useT } from "../../i18n/I18nContext";

/**
 * Nhãn trạng thái dùng chung (booking, payment...). `labels` map status -> {label, className}.
 * Không có trong `labels` → dịch theo common.status.<status> (không có bản dịch thì hiện nguyên mã).
 */
function StatusBadge({ status, labels }) {
    const t = useT();
    const config = labels?.[status] ?? {
        label: t(`common.status.${status}`, { defaultValue: status }),
        className: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${config.className}`}>
            {config.label}
        </span>
    );
}

export default StatusBadge;
