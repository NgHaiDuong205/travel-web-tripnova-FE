import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../common/UserAvatar";

const NAV_ITEMS = [
    { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
    { to: "/admin/hotels", label: "Hotels", icon: "apartment" },
    { to: "/admin/amenities", label: "Amenities", icon: "room_service" },
    { to: "/admin/geography", label: "Geography", icon: "public" },
    { to: "/admin/bookings", label: "Bookings", icon: "book_online" },
    { to: "/admin/users", label: "Users", icon: "group" },
    { to: "/admin/payments", label: "Payments", icon: "payments" },
    { to: "/admin/messages", label: "Messages", icon: "mail" },
];

function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await logout();
        navigate("/", { replace: true });
    };

    return (
        <div className="min-h-screen bg-surface-container-low text-on-surface">
            <aside className="fixed inset-y-0 left-0 w-64 bg-primary text-white flex flex-col">
                <Link to="/admin" className="px-6 h-20 flex items-center text-2xl font-black italic tracking-tight">
                    Tripnova <span className="ml-2 text-xs not-italic font-bold bg-white/15 px-2 py-0.5 rounded">ADMIN</span>
                </Link>
                <nav className="flex-1 px-3 space-y-1">
                    {NAV_ITEMS.map((item) => (
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
                            {item.label}
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
                        <Link to="/" className="flex-1 text-center text-xs font-bold py-2 rounded bg-white/10 hover:bg-white/20">
                            View site
                        </Link>
                        <button type="button" onClick={handleSignOut} className="flex-1 text-xs font-bold py-2 rounded bg-white/10 hover:bg-red-500">
                            Sign out
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
