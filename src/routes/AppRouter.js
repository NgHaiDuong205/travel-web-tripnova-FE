import { Routes, Route } from "react-router-dom";
import ClientRoutes from "./ClientRoutes";
import AdminRoutes from "./AdminRoutes";
import ManagerRoutes from "./ManagerRoutes";
import PrivateRoute from "./PrivateRoute";
import HotelAccountGuard from "./HotelAccountGuard";
import AuthLayout from "../components/layouts/AuthLayout";
import Login from "../pages/auth/Login"; // Trang đăng nhập
import Register from "../pages/auth/Register"; // Trang đăng ký
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";
import OAuthCallback from "../pages/auth/OAuthCallback";
import ChatWidget from "../components/ai/ChatWidget";
import SiteEffects from "../components/common/SiteEffects";

function AppRouter() {
    return (
        <Routes>
            <Route
                path="/admin/*"
                element={
                    <HotelAccountGuard>
                        <PrivateRoute role="ADMIN">
                            <AdminRoutes />
                        </PrivateRoute>
                    </HotelAccountGuard>
                }
            />
            <Route
                path="/manager/*"
                element={
                    <PrivateRoute role="HOTEL_MANAGER">
                        <ManagerRoutes />
                    </PrivateRoute>
                }
            />
            {/* Auth pages dùng AuthLayout — chỉ hiện logo Tripnova, không có menu */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/oauth2/callback" element={<OAuthCallback />} />
            </Route>
            {/* Tài khoản khách sạn không dùng site khách: chuyển về /manager */}
            <Route
                path="/*"
                element={
                    <HotelAccountGuard>
                        <ClientRoutes />
                        {/* Trợ lý AI: nút tròn nổi trên mọi trang khách */}
                        <ChatWidget />
                        <SiteEffects />
                    </HotelAccountGuard>
                }
            />
        </Routes>
    );
}

export default AppRouter;
