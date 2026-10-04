import { Link, Outlet } from "react-router-dom";
import Footer from "../client/Footer";
import LanguageSwitcher from "../common/LanguageSwitcher";
import ThemeToggle from "../common/ThemeToggle";

function AuthLayout() {
    return (
        <div className="flex flex-col min-h-screen">

            {/* Header tối giản — chỉ logo Tripnova */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-8 h-20 max-w-screen-2xl mx-auto">
                    <Link to="/" className="text-[28px] font-black text-[#003580] italic tracking-tighter">
                        Tripnova
                    </Link>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Nội dung trang (Login / Register) */}
            <main className="flex-grow pt-20">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default AuthLayout;
