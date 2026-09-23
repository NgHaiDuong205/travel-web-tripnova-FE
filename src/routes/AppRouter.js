import { Routes, Route } from "react-router-dom";
import ClientRoutes from "./ClientRoutes";
import AdminRoutes from "./AdminRoutes";
import AuthLayout from "../components/layouts/AuthLayout";
import Login from "../pages/auth/Login"; // Trang đăng nhập
import Register from "../pages/auth/Register"; // Trang đăng ký

function AppRouter() {
    return (
        <Routes>
            <Route path="/admin/*" element={<AdminRoutes />} />
            {/* Auth pages dùng AuthLayout — chỉ hiện logo Tripnova, không có menu */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>
            <Route path="/*" element={<ClientRoutes />} />
        </Routes>
    );
}

export default AppRouter;
