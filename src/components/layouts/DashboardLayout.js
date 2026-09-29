import { Link, useLocation, useNavigate } from "react-router-dom";
import NavigationMenu from "../client/NavigationMenu";
import UserAvatar from "../common/UserAvatar";
import NotificationBell from "../common/NotificationBell";
import { useAuth } from "../../context/AuthContext";

function DashboardLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleSignOut = async () => {
        await logout();
        navigate("/", { replace: true });
    };

    return (
        <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
            {/* Top Navigation Bar */}
            <header className="fixed top-0 w-full z-50 glass-nav h-20 shadow-[0_8px_32px_rgba(27,28,28,0.06)]">
                <div className="flex justify-between items-center px-8 h-full w-full max-w-[1440px] mx-auto">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-2xl font-black text-primary italic font-headline tracking-tight">TripNova</Link>
                    </div>
                    
                    <div className="hidden lg:flex flex-1 justify-center">
                        <NavigationMenu />
                    </div>

                    <div className="flex items-center gap-6">
                        <NotificationBell />
                        <Link to="/account-settings" className="overflow-hidden">
                            <UserAvatar user={user} />
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex pt-20">
                {/* Sidebar Navigation */}
                <aside className="hidden lg:flex flex-col gap-2 px-6 h-[calc(100vh-5rem)] overflow-y-auto w-72 fixed left-0 top-20 pt-8 pb-8 bg-surface-container-low">
                    <div className="mb-10 px-2">
                        <div className="flex items-center gap-3">
                            <UserAvatar user={user} size="w-12 h-12" rounded="rounded-xl" />
                            <div className="min-w-0">
                                <h3 className="font-headline font-bold text-on-surface truncate">{user?.fullName}</h3>
                                <p className="text-xs text-on-surface-variant tracking-wide">
                                    {(user?.loyaltyPoints ?? 0).toLocaleString()} POINTS
                                </p>
                            </div>
                        </div>
                    </div>
                    <nav className="flex-1 flex flex-col gap-1">
                        <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform duration-200 hover:translate-x-1 ${location.pathname === '/profile' ? 'sidebar-active text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}>
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="font-medium text-sm tracking-wide">Dashboard</span>
                        </Link>
                        <Link to="/booking-history" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform duration-200 hover:translate-x-1 ${location.pathname === '/booking-history' ? 'sidebar-active text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}>
                            <span className="material-symbols-outlined">history</span>
                            <span className="font-medium text-sm tracking-wide">Booking History</span>
                        </Link>
                        <Link to="/payment-history" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform duration-200 hover:translate-x-1 ${location.pathname === '/payment-history' ? 'sidebar-active text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}>
                            <span className="material-symbols-outlined">payments</span>
                            <span className="font-medium text-sm tracking-wide">Payment History</span>
                        </Link>
                        <Link to="/my-trips" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform duration-200 hover:translate-x-1 ${location.pathname === '/my-trips' ? 'sidebar-active text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}>
                            <span className="material-symbols-outlined">luggage</span>
                            <span className="font-medium text-sm tracking-wide">My Trips</span>
                        </Link>
                        <Link to="/invoices" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform duration-200 hover:translate-x-1 ${location.pathname === '/invoices' ? 'sidebar-active text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}>
                            <span className="material-symbols-outlined">receipt_long</span>
                            <span className="font-medium text-sm tracking-wide">Invoices</span>
                        </Link>
                        <Link to="/saved-trips" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform duration-200 hover:translate-x-1 ${location.pathname === '/saved-trips' ? 'sidebar-active text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}>
                            <span className="material-symbols-outlined">favorite</span>
                            <span className="font-medium text-sm tracking-wide">Saved Trips</span>
                        </Link>
                        <Link to="/trip-cart" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform duration-200 hover:translate-x-1 ${location.pathname === '/trip-cart' ? 'sidebar-active text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}>
                            <span className="material-symbols-outlined">shopping_bag</span>
                            <span className="font-medium text-sm tracking-wide">Trip Cart</span>
                        </Link>
                        <Link to="/itineraries" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform duration-200 hover:translate-x-1 ${location.pathname.startsWith('/itineraries') ? 'sidebar-active text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}>
                            <span className="material-symbols-outlined">map</span>
                            <span className="font-medium text-sm tracking-wide">My Itineraries</span>
                        </Link>
                        <Link to="/my-reviews" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform duration-200 hover:translate-x-1 ${location.pathname === '/my-reviews' ? 'sidebar-active text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}>
                            <span className="material-symbols-outlined">rate_review</span>
                            <span className="font-medium text-sm tracking-wide">My Reviews</span>
                        </Link>
                        <Link to="/notifications" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform duration-200 hover:translate-x-1 ${location.pathname === '/notifications' ? 'sidebar-active text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}>
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="font-medium text-sm tracking-wide">Notifications</span>
                        </Link>
                        <Link to="/account/security" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform duration-200 hover:translate-x-1 ${location.pathname === '/account/security' ? 'sidebar-active text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}>
                            <span className="material-symbols-outlined">shield_person</span>
                            <span className="font-medium text-sm tracking-wide">Login & Security</span>
                        </Link>
                        <Link to="/account-settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform duration-200 hover:translate-x-1 ${location.pathname === '/account-settings' ? 'sidebar-active text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}>
                            <span className="material-symbols-outlined">settings</span>
                            <span className="font-medium text-sm tracking-wide">Account Settings</span>
                        </Link>
                    </nav>
                    <Link to="/hotels" className="mt-4 w-full primary-gradient text-white py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 duration-150 flex items-center justify-center gap-2 block text-center">
                        <span className="material-symbols-outlined text-sm">add</span>
                        Book New Trip
                    </Link>
                    <div className="mt-8 pt-6 border-t border-outline-variant/20 flex flex-col gap-1">
                        <span className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant hover:bg-white/50 text-sm cursor-pointer">
                            <span className="material-symbols-outlined text-[20px]">help</span>
                            Help Center
                        </span>
                        <button type="button" onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2 rounded-lg text-error hover:bg-error-container/10 text-sm text-left">
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 ml-0 lg:ml-72 p-8 lg:p-12 max-w-[1150px]">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom NavBar (Visible on small screens) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-nav h-16 flex items-center justify-around px-4 z-50">
                <Link to="/profile" className={`flex flex-col items-center gap-1 ${location.pathname === '/profile' ? 'text-primary' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined" style={location.pathname === '/profile' ? {fontVariationSettings: "'FILL' 1"} : {}}>dashboard</span>
                    <span className="text-[10px] font-bold">Dashboard</span>
                </Link>
                <Link to="/booking-history" className={`flex flex-col items-center gap-1 ${location.pathname === '/booking-history' ? 'text-primary' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined" style={location.pathname === '/booking-history' ? {fontVariationSettings: "'FILL' 1"} : {}}>history</span>
                    <span className="text-[10px] font-medium">History</span>
                </Link>
                <span className="flex flex-col items-center gap-1 text-on-surface-variant cursor-pointer">
                    <span className="material-symbols-outlined">favorite</span>
                    <span className="text-[10px] font-medium">Saved</span>
                </span>
                <span className="flex flex-col items-center gap-1 text-on-surface-variant cursor-pointer">
                    <span className="material-symbols-outlined">account_circle</span>
                    <span className="text-[10px] font-medium">Account</span>
                </span>
            </nav>
        </div>
    );
}

export default DashboardLayout;
