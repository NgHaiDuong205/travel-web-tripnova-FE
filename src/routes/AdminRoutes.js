import { Route, Routes } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminBookings from "../pages/admin/Bookings";
import AdminUsers from "../pages/admin/Users";
import AdminPayments from "../pages/admin/Payments";
import AdminMessages from "../pages/admin/Messages";
import AdminHotels from "../pages/admin/Hotels";
import AdminHotelEdit from "../pages/admin/HotelEdit";

/** Đã được bọc bởi <PrivateRoute role="ADMIN"> trong AppRouter. */
function AdminRoutes() {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/hotels" element={<AdminHotels />} />
                <Route path="/hotels/new" element={<AdminHotelEdit />} />
                <Route path="/hotels/:hotelId" element={<AdminHotelEdit />} />
                <Route path="/bookings" element={<AdminBookings />} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/payments" element={<AdminPayments />} />
                <Route path="/messages" element={<AdminMessages />} />
                <Route path="*" element={<h2 className="text-xl font-bold text-gray-500">404 - Admin không có trang này</h2>} />
            </Route>
        </Routes>
    );
}

export default AdminRoutes;
