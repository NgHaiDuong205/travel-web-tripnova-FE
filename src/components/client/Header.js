import { Link, useLocation, useNavigate } from "react-router-dom";
import NavigationMenu from "./NavigationMenu";
import { useAuth } from "../../context/AuthContext";
import { useT } from "../../i18n/I18nContext";
import LanguageSwitcher from "../common/LanguageSwitcher";
import ThemeToggle from "../common/ThemeToggle";
import { withRedirect } from "../../utils/authRedirect";

function Header(){
    const { isLoggedIn, user, hasRole, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const t = useT();
    // Đăng nhập / đăng ký xong quay lại đúng trang đang xem
    const here = location.pathname + location.search;

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return(
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="flex justify-between items-center px-8 h-20 max-w-screen-2xl mx-auto">
                
                {/* Logo */}
                <div className="text-[28px] font-black text-[#003580] italic tracking-tighter">
                    Tripnova
                </div>
                
                {/* Thanh Menu ngang */}
                <NavigationMenu />
                
                {/* Cụm chức năng */}
                <div className="flex items-center space-x-3">
                    <LanguageSwitcher compact />
                    <ThemeToggle />
                    {isLoggedIn ? (
                        <div className="flex items-center space-x-4">
                            {hasRole("ADMIN") && (
                                <Link to="/admin" className="text-[#434651] font-bold tracking-tight hover:text-[#003580] transition-colors">
                                    {t("nav.admin")}
                                </Link>
                            )}
                            <Link to="/cart" aria-label={t("nav.cart")} title={t("nav.cart")} className="w-9 h-9 flex items-center justify-center rounded-lg text-[#434651] hover:text-[#003580] hover:bg-blue-50 transition-colors">
                                <span className="material-symbols-outlined">shopping_cart</span>
                            </Link>
                            <Link to="/profile" className="flex items-center gap-2 cursor-pointer font-bold text-[#003580] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center border border-blue-200">
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                </div>
                                <span>{user?.fullName || t("nav.myProfile")}</span>
                            </Link>
                            <button onClick={handleLogout} className="text-[#434651] font-bold tracking-tight hover:text-red-600 transition-colors px-4">
                                {t("nav.logout")}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to={withRedirect("/login", here)} className="text-[#434651] font-bold tracking-tight hover:text-[#003580] transition-colors px-4">
                                {t("nav.login")}
                            </Link>
                            <Link to={withRedirect("/register", here)} className="bg-[#003580] text-white px-6 py-2.5 rounded-lg font-bold tracking-tight shadow-md hover:bg-blue-800 transition-all active:scale-95">
                                {t("nav.register")}
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </nav>
    )
}

export default Header;
