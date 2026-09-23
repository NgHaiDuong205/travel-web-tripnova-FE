import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Chặn route cần đăng nhập. Dùng làm layout route:
 *   <Route element={<PrivateRoute />}> ... </Route>
 *   <Route element={<PrivateRoute role="ADMIN" />}> ... </Route>
 */
function PrivateRoute({ role, children }) {
    const { isLoggedIn, initializing, hasRole } = useAuth();
    const location = useLocation();

    if (initializing) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-gray-500 font-medium">
                Đang tải...
            </div>
        );
    }

    if (!isLoggedIn) {
        const redirect = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?redirect=${redirect}`} replace />;
    }

    if (role && !hasRole(role)) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-red-600 font-bold text-xl">
                Bạn không có quyền truy cập trang này.
            </div>
        );
    }

    return children ?? <Outlet />;
}

export default PrivateRoute;
