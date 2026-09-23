import { Route, Routes } from "react-router-dom";
import ClientLayout from "../components/layouts/ClientLayout";
import PrivateRoute from "./PrivateRoute";
import Home from "../pages/client/Home/index";
import Hotels from "../pages/client/Hotels/index";
import Destinations from "../pages/client/Destinations/index";
import DestinationDetail from "../pages/client/DestinationDetail/index";
import About from "../pages/client/About/index";
import HotelDetail from "../pages/client/HotelDetail/index";
import Rooms from "../pages/client/Rooms/index";
import RoomDetail from "../pages/client/RoomDetail/index";
import Profile from "../pages/client/Profile/index";
import BookingHistory from "../pages/client/BookingHistory/index";
import PaymentHistory from "../pages/client/PaymentHistory/index";
import SavedTrips from "../pages/client/SavedTrips/index";
import AccountSettings from "../pages/client/AccountSettings/index";
import Checkout from "../pages/client/Checkout/index";
import Payment from "../pages/client/Payment/index";
import BookingDetail from "../pages/client/BookingDetail/index";

function ClientRoutes() {
    return (
        <Routes>
            {/* Trang cá nhân — bắt buộc đăng nhập */}
            <Route element={<PrivateRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/booking-history" element={<BookingHistory />} />
                <Route path="/payment-history" element={<PaymentHistory />} />
                <Route path="/saved-trips" element={<SavedTrips />} />
                <Route path="/account-settings" element={<AccountSettings />} />
            </Route>
            <Route element={<ClientLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/destinations/:id" element={<DestinationDetail />} />
                <Route path="/abouts" element={<About />} />
                <Route path="/hotel/:id" element={<HotelDetail />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/hotel/:hotelId/room/:roomId" element={<RoomDetail />} />

                {/* Đặt phòng & thanh toán — bắt buộc đăng nhập */}
                <Route element={<PrivateRoute />}>
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment/:paymentId" element={<Payment />} />
                    <Route path="/bookings/:bookingId" element={<BookingDetail />} />
                </Route>

                
                {/* Lưới hứng dự phòng khi khách truy cập nhầm trang */}
                <Route path="*" element={<div className="p-10 text-center font-bold text-2xl text-gray-500">Trang này đang được xây dựng...</div>} />
            </Route>
        </Routes>
    );
}

export default ClientRoutes;
