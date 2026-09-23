import { Routes, Route } from "react-router-dom";
import ClientRoutes from "./ClientRoutes";
import AdminRoutes from "./AdminRoutes";
import PrivateRoute from "./PrivateRoute";
import AuthLayout from "../components/layouts/AuthLayout";
import Login from "../pages/auth/Login"; // Trang đăng nhập
import Register from "../pages/auth/Register"; // Trang đăng ký
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

function AppRouter() {
    return (
        <Routes>
            <Route
                path="/admin/*"
                element={
                    <PrivateRoute role="ADMIN">
                        <AdminRoutes />
                    </PrivateRoute>
                }
            />
            {/* Auth pages dùng AuthLayout — chỉ hiện logo Tripnova, không có menu */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
            <Route path="/*" element={<ClientRoutes />} />
        </Routes>
    );
}

export default AppRouter;
