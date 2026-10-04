import { Navigate, Route, Routes } from "react-router-dom";
import ClientLayout from "../components/layouts/ClientLayout";
import PrivateRoute from "./PrivateRoute";
import Home from "../pages/client/Home/index";
import Hotels from "../pages/client/Hotels/index";
import AiPlanner from "../pages/client/AiPlanner/index";
import Destinations from "../pages/client/Destinations/index";
import DestinationDetail from "../pages/client/DestinationDetail/index";
import LandmarkDetail from "../pages/client/LandmarkDetail/index";
import About from "../pages/client/About/index";
import HotelDetail from "../pages/client/HotelDetail/index";
import Rooms from "../pages/client/Rooms/index";
import RoomDetail from "../pages/client/RoomDetail/index";
import Profile from "../pages/client/Profile/index";
import PaymentHistory from "../pages/client/PaymentHistory/index";
import SavedTrips from "../pages/client/SavedTrips/index";
import Itineraries from "../pages/client/Itineraries/index";
import ItineraryDetail from "../pages/client/ItineraryDetail/index";
import TripBooking from "../pages/client/TripBooking/index";
import Invoices from "../pages/client/Invoices/index";
import MyTrips from "../pages/client/MyTrips/index";
import Cars from "../pages/client/Cars/index";
import CarDetail from "../pages/client/CarDetail/index";
import Flights from "../pages/client/Flights/index";
import FlightDetail from "../pages/client/FlightDetail/index";
import Tours from "../pages/client/Tours/index";
import TourDetail from "../pages/client/TourDetail/index";
import TripPayment from "../pages/client/TripPayment/index";
import MyReviews from "../pages/client/MyReviews/index";
import AccountSettings from "../pages/client/AccountSettings/index";
import Checkout from "../pages/client/Checkout/index";
import Cart from "../pages/client/Cart/index";
import Contact from "../pages/client/Contact/index";
import Payment from "../pages/client/Payment/index";
import BookingDetail from "../pages/client/BookingDetail/index";
import Notifications from "../pages/client/Notifications/index";
import LoginSecurity from "../pages/client/LoginSecurity/index";
import Search from "../pages/client/Search/index";
import { useT } from "../i18n/I18nContext";

function ClientRoutes() {
    const t = useT();
    return (
        <Routes>
            {/* Trang cá nhân — bắt buộc đăng nhập */}
            <Route element={<PrivateRoute />}>
                <Route path="/profile" element={<Profile />} />
                {/* Booking History đã gộp vào My Trips (tab Hotels) */}
                <Route path="/booking-history" element={<Navigate to="/my-trips?tab=hotels" replace />} />
                <Route path="/payment-history" element={<PaymentHistory />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/my-trips" element={<MyTrips />} />
                <Route path="/saved-trips" element={<SavedTrips />} />
                <Route path="/itineraries" element={<Itineraries />} />
                <Route path="/itineraries/:id" element={<ItineraryDetail />} />
                <Route path="/my-reviews" element={<MyReviews />} />
                <Route path="/account-settings" element={<AccountSettings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/account/security" element={<LoginSecurity />} />
            </Route>
            <Route element={<ClientLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/destinations/:id" element={<DestinationDetail />} />
                <Route path="/destinations/:id/landmarks/:landmarkId" element={<LandmarkDetail />} />
                <Route path="/abouts" element={<About />} />
                <Route path="/contacts" element={<Contact />} />
                <Route path="/hotel/:id" element={<HotelDetail />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/cars" element={<Cars />} />
                <Route path="/cars/:id" element={<CarDetail />} />
                <Route path="/flights" element={<Flights />} />
                <Route path="/flights/:id" element={<FlightDetail />} />
                <Route path="/tours" element={<Tours />} />
                <Route path="/tours/:id" element={<TourDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/ai-planner" element={<AiPlanner />} />
                <Route path="/hotel/:hotelId/room/:roomId" element={<RoomDetail />} />

                {/* Đặt phòng & thanh toán — bắt buộc đăng nhập */}
                <Route element={<PrivateRoute />}>
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/payment/:paymentId" element={<Payment />} />
                    <Route path="/trip-payment/:paymentId" element={<TripPayment />} />
                    <Route path="/trip-booking/:itineraryId" element={<TripBooking />} />
                    {/* Giỏ tour / xe / chuyến bay đã gộp vào /cart */}
                    <Route path="/trip-cart" element={<Navigate to="/cart" replace />} />
                    <Route path="/bookings/:bookingId" element={<BookingDetail />} />
                </Route>

                
                {/* Lưới hứng dự phòng khi khách truy cập nhầm trang */}
                <Route path="*" element={<div className="p-10 text-center font-bold text-2xl text-gray-500">{t("common.state.underConstruction")}</div>} />
            </Route>
        </Routes>
    );
}

export default ClientRoutes;
