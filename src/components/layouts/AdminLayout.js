import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../common/UserAvatar";
import ThemeToggle from "../common/ThemeToggle";
import { useT } from "../../i18n/I18nContext";

const NAV_ITEMS = [
    { to: "/admin", labelKey: "admin.layout.dashboard", icon: "dashboard", end: true },
    { to: "/admin/hotels", labelKey: "admin.layout.hotels", icon: "apartment" },
    { to: "/admin/hotel-images", labelKey: "admin.layout.hotelImages", icon: "photo_library" },
    { to: "/admin/hotel-managers", labelKey: "admin.layout.hotelManagers", icon: "manage_accounts" },
    { to: "/admin/cars", labelKey: "admin.layout.cars", icon: "directions_car" },
    { to: "/admin/flights", labelKey: "admin.layout.flights", icon: "flight" },
    { to: "/admin/tours", labelKey: "admin.layout.tours", icon: "tour" },
    { to: "/admin/amenities", labelKey: "admin.layout.amenities", icon: "room_service" },
    { to: "/admin/geography", labelKey: "admin.layout.geography", icon: "public" },
    { to: "/admin/bookings", labelKey: "admin.layout.bookings", icon: "book_online" },
    { to: "/admin/users", labelKey: "admin.layout.users", icon: "group" },
    { to: "/admin/roles", labelKey: "admin.layout.roles", icon: "admin_panel_settings" },
    { to: "/admin/payments", labelKey: "admin.layout.payments", icon: "payments" },
    { to: "/admin/invoices", labelKey: "admin.layout.invoices", icon: "receipt_long" },
    { to: "/admin/messages", labelKey: "admin.layout.messages", icon: "mail" },
    { to: "/admin/posts", labelKey: "admin.layout.reviews", icon: "reviews" },
    { to: "/admin/ai-knowledge", labelKey: "admin.layout.aiKnowledge", icon: "menu_book" },
    { to: "/admin/ai-chats", labelKey: "admin.layout.aiChats", icon: "smart_toy" },
    { to: "/admin/search-queries", labelKey: "admin.layout.searchQueries", icon: "query_stats" },
    { to: "/admin/audit-logs", labelKey: "admin.layout.auditLogs", icon: "history_edu" },
];

/** Khung trang quản trị; ManagerLayout dùng lại với menu / nhãn / trang chủ riêng (siteLink = false: ẩn "View site"). */
function AdminLayout({ navItems = NAV_ITEMS, badge = "ADMIN", home = "/admin", siteLink = true }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const t = useT();

    const handleSignOut = async () => {
        await logout();
        navigate("/", { replace: true });
    };

    return (
        <div className="min-h-screen bg-surface-container-low text-on-surface">
            <aside className="fixed inset-y-0 left-0 w-64 bg-primary text-white flex flex-col">
                <Link to={home} className="px-6 h-20 flex items-center text-2xl font-black italic tracking-tight">
                    Tripnova <span className="ml-2 text-xs not-italic font-bold bg-white/15 px-2 py-0.5 rounded">{badge}</span>
                </Link>
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                                    isActive ? "bg-white text-primary" : "text-white/80 hover:bg-white/10"
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            {t(item.labelKey)}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{user?.fullName}</p>
                            <p className="text-xs text-white/60 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <ThemeToggle tone="dark" />
                        {siteLink && (
                            <Link to="/" className="flex-1 text-center text-xs font-bold py-2 rounded bg-white/10 hover:bg-white/20">
                                {t("admin.layout.viewSite")}
                            </Link>
                        )}
                        <button type="button" onClick={handleSignOut} className="flex-1 text-xs font-bold py-2 rounded bg-white/10 hover:bg-red-500">
                            {t("admin.layout.signOut")}
                        </button>
                    </div>
                </div>
            </aside>
            <main className="ml-64 p-10 max-w-[1400px]">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;
