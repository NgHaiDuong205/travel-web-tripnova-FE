import { Navigate, Route, Routes } from "react-router-dom";
import ManagerLayout from "../components/layouts/ManagerLayout";
import { HotelApiContext } from "../context/HotelApiContext";
import { managerHotelApi } from "../services/managerHotelService";
import ManagerDashboard from "../pages/manager/Dashboard";
import ManagerHotels from "../pages/manager/Hotels";
import ManagerHotelEdit from "../pages/manager/HotelEdit";
import ManagerAccount from "../pages/manager/Account";

/**
 * Trang quản lý khách sạn — đã được bọc bởi <PrivateRoute role="HOTEL_MANAGER"> trong AppRouter.
 * HotelApiContext: component dùng chung với admin (phòng, lịch, ảnh) gọi /api/manager/**.
 */
function ManagerRoutes() {
    return (
        <HotelApiContext.Provider value={managerHotelApi}>
            <Routes>
                <Route element={<ManagerLayout />}>
                    <Route path="/" element={<ManagerDashboard />} />
                    <Route path="/hotels" element={<ManagerHotels />} />
                    <Route path="/hotels/:hotelId" element={<ManagerHotelEdit />} />
                    <Route path="/account" element={<ManagerAccount />} />
                    <Route path="*" element={<Navigate to="/manager" replace />} />
                </Route>
            </Routes>
        </HotelApiContext.Provider>
    );
}

export default ManagerRoutes;
