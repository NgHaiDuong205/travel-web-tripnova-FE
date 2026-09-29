import { Link, useNavigate } from "react-router-dom";
import NavigationMenu from "./NavigationMenu";
import { useAuth } from "../../context/AuthContext";

function Header(){
    const { isLoggedIn, user, hasRole, logout } = useAuth();
    const navigate = useNavigate();

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
                <div className="flex items-center space-x-6">
                    {isLoggedIn ? (
                        <div className="flex items-center space-x-4">
                            {hasRole("ADMIN") && (
                                <Link to="/admin" className="text-[#434651] font-bold tracking-tight hover:text-[#003580] transition-colors">
                                    Admin
                                </Link>
                            )}
                            <Link to="/cart" aria-label="Cart" className="w-9 h-9 flex items-center justify-center rounded-lg text-[#434651] hover:text-[#003580] hover:bg-blue-50 transition-colors">
                                <span className="material-symbols-outlined">shopping_cart</span>
                            </Link>
                            <Link to="/profile" className="flex items-center gap-2 cursor-pointer font-bold text-[#003580] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center border border-blue-200">
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                </div>
                                <span>{user?.fullName || "My Profile"}</span>
                            </Link>
                            <button onClick={handleLogout} className="text-[#434651] font-bold tracking-tight hover:text-red-600 transition-colors px-4">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-[#434651] font-bold tracking-tight hover:text-[#003580] transition-colors px-4">
                                Login
                            </Link>
                            <Link to="/register" className="bg-[#003580] text-white px-6 py-2.5 rounded-lg font-bold tracking-tight shadow-md hover:bg-blue-800 transition-all active:scale-95">
                                Register
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </nav>
    )
}

export default Header;
