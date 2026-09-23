import { Link, useLocation } from "react-router-dom";
import NavigationMenu from "../client/NavigationMenu";

function DashboardLayout({ children }) {
    const location = useLocation();

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
                        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container">
                            <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEjBxUulnzYst6plIj4x_sHZAQLrEA7P-MTI60oFnqoqr1XjhZ7UhpCyfyiqvY1Wcpn2S_LHOFwWvY0KOTKmk8KyBeGmiffuyujtJ0uvTrpxiYRNJCV5KiNPJ_4EKutYYUr6cap0yQKvgWVQozGzdT6ZHV8huUH6T_bxnRlWGzdQmirjShuhmG5MPAmQv_LefR4t-v5WtxZKx6i-B_buQ5GYOuzO3YEV2rrp14Rn_2lTpp-maL8UaCY50k8XbVTSjjGDvpOtFCKZ4"/>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex pt-20">
                {/* Sidebar Navigation */}
                <aside className="hidden lg:flex flex-col gap-2 px-6 h-[calc(100vh-5rem)] w-72 fixed left-0 top-20 pt-8 pb-8 bg-surface-container-low">
                    <div className="mb-10 px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-on-primary">
                                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>diamond</span>
                            </div>
                            <div>
                                <h3 className="font-headline font-bold text-on-surface">Alex Morgan</h3>
                                <p className="text-xs text-on-surface-variant tracking-wide">ELITE VOYAGER</p>
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
                        <Link to="/saved-trips" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform duration-200 hover:translate-x-1 ${location.pathname === '/saved-trips' ? 'sidebar-active text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}>
                            <span className="material-symbols-outlined">favorite</span>
                            <span className="font-medium text-sm tracking-wide">Saved Trips</span>
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
                        <Link to="/" className="flex items-center gap-3 px-4 py-2 rounded-lg text-error hover:bg-error-container/10 text-sm">
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            Sign Out
                        </Link>
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
