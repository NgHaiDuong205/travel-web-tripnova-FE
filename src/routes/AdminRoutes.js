import { Route, Routes } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminBookings from "../pages/admin/Bookings";
import AdminUsers from "../pages/admin/Users";
import AdminPayments from "../pages/admin/Payments";
import AdminMessages from "../pages/admin/Messages";
import AdminHotels from "../pages/admin/Hotels";
import AdminHotelEdit from "../pages/admin/HotelEdit";
import AdminAmenities from "../pages/admin/Amenities";
import AdminGeography from "../pages/admin/Geography";
import AdminRoles from "../pages/admin/Roles";
import AdminPosts from "../pages/admin/Posts";
import AdminInvoices from "../pages/admin/Invoices";
import AdminCars from "../pages/admin/Cars";
import AdminFlights from "../pages/admin/Flights";
import AdminTours from "../pages/admin/Tours";
import AdminAuditLogs from "../pages/admin/AuditLogs";
import AdminSearchQueries from "../pages/admin/SearchQueries";
import AdminHotelImages from "../pages/admin/HotelImages";

/** Đã được bọc bởi <PrivateRoute role="ADMIN"> trong AppRouter. */
function AdminRoutes() {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/hotels" element={<AdminHotels />} />
                <Route path="/hotels/new" element={<AdminHotelEdit />} />
                <Route path="/hotels/:hotelId" element={<AdminHotelEdit />} />
                <Route path="/cars" element={<AdminCars />} />
                <Route path="/flights" element={<AdminFlights />} />
                <Route path="/tours" element={<AdminTours />} />
                <Route path="/amenities" element={<AdminAmenities />} />
                <Route path="/geography" element={<AdminGeography />} />
                <Route path="/bookings" element={<AdminBookings />} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/roles" element={<AdminRoles />} />
                <Route path="/payments" element={<AdminPayments />} />
                <Route path="/invoices" element={<AdminInvoices />} />
                <Route path="/messages" element={<AdminMessages />} />
                <Route path="/posts" element={<AdminPosts />} />
                <Route path="/hotel-images" element={<AdminHotelImages />} />
                <Route path="/audit-logs" element={<AdminAuditLogs />} />
                <Route path="/search-queries" element={<AdminSearchQueries />} />
                <Route path="*" element={<h2 className="text-xl font-bold text-gray-500">404 - Admin không có trang này</h2>} />
            </Route>
        </Routes>
    );
}

export default AdminRoutes;
