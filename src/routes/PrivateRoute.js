import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useT } from "../i18n/I18nContext";

/**
 * Chặn route cần đăng nhập. Dùng làm layout route:
 *   <Route element={<PrivateRoute />}> ... </Route>
 *   <Route element={<PrivateRoute role="ADMIN" />}> ... </Route>
 */
function PrivateRoute({ role, children }) {
    const { isLoggedIn, initializing, hasRole } = useAuth();
    const location = useLocation();
    const t = useT();

    if (initializing) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-gray-500 font-medium">
                {t("common.state.loading")}
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
                {t("common.state.forbidden")}
            </div>
        );
    }

    return children ?? <Outlet />;
}

export default PrivateRoute;
