import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Tài khoản khách sạn = có HOTEL_MANAGER, không có ADMIN (chỉ admin tạo ở trang Hotel Managers). */
export function isHotelAccount(hasRole) {
    return hasRole("HOTEL_MANAGER") && !hasRole("ADMIN");
}

/**
 * Tài khoản khách sạn chỉ dùng trang quản lý: mọi trang khác (site khách, admin) chuyển về /manager.
 * BE cũng chặn các API của khách với tài khoản này (SecurityConfig.notHotelAccount).
 */
function HotelAccountGuard({ children }) {
    const { isLoggedIn, initializing, hasRole } = useAuth();
    if (!initializing && isLoggedIn && isHotelAccount(hasRole)) {
        return <Navigate to="/manager" replace />;
    }
    return children;
}

export default HotelAccountGuard;
