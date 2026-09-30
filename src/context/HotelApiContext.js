import { createContext, useContext } from "react";
import {
    deactivateAdminRoomType,
    deleteAdminRoom,
    fetchAdminRooms,
    fetchRoomAvailability,
    saveAdminRoom,
    saveAdminRoomType,
    updateRoomAvailability,
} from "../services/adminHotelService";
import { addHotelImage, deleteHotelImage, fetchHotelImages, setHotelCover, updateHotelImage } from "../services/adminLogService";

/** API admin (mặc định) cho các component quản lý hạng phòng / phòng / lịch / ảnh. */
export const adminHotelApi = {
    saveRoomType: saveAdminRoomType,
    deactivateRoomType: deactivateAdminRoomType,
    fetchRooms: fetchAdminRooms,
    saveRoom: saveAdminRoom,
    deleteRoom: deleteAdminRoom,
    fetchRoomAvailability,
    updateRoomAvailability,
    fetchHotelImages,
    addHotelImage,
    updateHotelImage,
    setHotelCover,
    deleteHotelImage,
};

/**
 * Cùng một bộ component dùng cho trang admin và trang quản lý khách sạn: trang manager bọc
 * <HotelApiContext.Provider value={managerHotelApi}> để mọi lời gọi đi qua /api/manager/**.
 */
export const HotelApiContext = createContext(adminHotelApi);

export function useHotelApi() {
    return useContext(HotelApiContext);
}
