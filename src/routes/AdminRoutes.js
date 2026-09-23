import { Route, Routes, Outlet } from "react-router-dom";
// import AdminLayout from "../components/layouts/AdminLayout";

function AdminLayoutShell() {
    return (
        <div className="bg-gray-100 min-h-screen p-5 border-l-4 border-red-500">
            <h1 className="font-bold text-red-500 mb-4">GIAO DIỆN QUẢN TRỊ ADMIN (Khung tạm)</h1>
            <hr />
            <br />
            <Outlet />
        </div>
    );
}

function AdminRoutes() {
    return (
        <Routes>
            <Route element={<AdminLayoutShell />}>
                <Route path="/" element={<h2>Trang Thống kê (Dashboard)</h2>} />
                <Route path="/users" element={<h2>Màn hình Quản lý Người dùng</h2>} />
                <Route path="*" element={<h2>404 - Admin không có trang này</h2>} />
            </Route>
        </Routes>
    );
}

export default AdminRoutes;
