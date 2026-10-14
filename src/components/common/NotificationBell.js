import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NOTIFICATIONS_CHANGED_EVENT, fetchUnreadCount } from "../../services/notificationService";
import { useT } from "../../i18n/I18nContext";

const POLL_MS = 60000;

/** Chuông thông báo + số chưa đọc (hỏi lại mỗi phút, khi quay lại tab và khi trang Notifications đổi trạng thái). */
function NotificationBell({ className = "p-2 text-on-surface-variant hover:text-primary transition-colors" }) {
    const t = useT();
    const { isLoggedIn } = useAuth();
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isLoggedIn) {
            setCount(0);
            return undefined;
        }
        let cancelled = false;
        const load = () => {
            if (document.visibilityState === "hidden") return;
            fetchUnreadCount()
                .then((n) => !cancelled && setCount(n))
                .catch(() => {});
        };
        load();
        const timer = setInterval(load, POLL_MS);
        window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, load);
        document.addEventListener("visibilitychange", load);
        return () => {
            cancelled = true;
            clearInterval(timer);
            window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, load);
            document.removeEventListener("visibilitychange", load);
        };
    }, [isLoggedIn]);

    return (
        <Link
            to="/notifications"
            className={`relative ${className}`}
            aria-label={count ? t("account.bell.unreadNotifications", { count }) : t("nav.sidebar.notifications")}
        >
            <span className="material-symbols-outlined">notifications</span>
            {count > 0 && (
                <span className="tn-badge-pop absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold leading-[18px] text-center">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    );
}

export default NotificationBell;
