import apiClient from "../config/axiosConfig";

/**
 * API trang quản lý khách sạn (role HOTEL_MANAGER) — cùng hình dạng dữ liệu với adminHotelService,
 * nhưng BE chỉ cho thao tác trên khách sạn mình quản lý (khách sạn khác → 404).
 */

export async function fetchManagerHotels() {
    const { data } = await apiClient.get("/api/manager/hotels/");
    return data;
}

export async function fetchManagerHotel(hotelId) {
    const { data } = await apiClient.get(`/api/manager/hotels/${hotelId}/`);
    return data;
}

/** managedById / isActive trong body bị BE bỏ qua (manager không đổi được). */
export async function updateManagerHotel(hotelId, payload) {
    const { data } = await apiClient.put(`/api/manager/hotels/${hotelId}/`, payload);
    return data;
}

/** Ẩn khách sạn (xoá mềm); chỉ admin bật lại được. */
export async function deactivateManagerHotel(hotelId) {
    await apiClient.delete(`/api/manager/hotels/${hotelId}/`);
}

export async function fetchManagerRoomTypes(hotelId) {
    const { data } = await apiClient.get(`/api/manager/hotels/${hotelId}/room-types/`);
    return data;
}

/** Thống kê khách sạn của mình; hotelId trống = gộp mọi khách sạn. */
export async function fetchManagerStats({ hotelId, from, to, granularity } = {}) {
    const { data } = await apiClient.get("/api/manager/stats/", {
        params: { hotelId: hotelId || undefined, from, to, granularity },
    });
    return data;
}

/** Bộ hàm cho HotelApiContext (hạng phòng / phòng / lịch / ảnh) — khớp tên với adminHotelApi. */
export const managerHotelApi = {
    async saveRoomType(hotelId, roomTypeId, payload) {
        const base = `/api/manager/hotels/${hotelId}/room-types/`;
        const { data } = roomTypeId ? await apiClient.put(`${base}${roomTypeId}/`, payload) : await apiClient.post(base, payload);
        return data;
    },
    async deactivateRoomType(hotelId, roomTypeId) {
        await apiClient.delete(`/api/manager/hotels/${hotelId}/room-types/${roomTypeId}/`);
    },
    async fetchRooms(hotelId, roomTypeId) {
        const { data } = await apiClient.get(`/api/manager/hotels/${hotelId}/rooms/`, {
            params: { roomTypeId: roomTypeId || undefined },
        });
        return data;
    },
    async saveRoom(hotelId, roomId, payload) {
        const base = `/api/manager/hotels/${hotelId}/rooms/`;
        const { data } = roomId ? await apiClient.put(`${base}${roomId}/`, payload) : await apiClient.post(base, payload);
        return data;
    },
    async deleteRoom(hotelId, roomId) {
        await apiClient.delete(`/api/manager/hotels/${hotelId}/rooms/${roomId}/`);
    },
    async fetchRoomAvailability(roomId, from, to) {
        const { data } = await apiClient.get(`/api/manager/rooms/${roomId}/availability/`, { params: { from, to } });
        return data;
    },
    async updateRoomAvailability(roomId, payload) {
        const { data } = await apiClient.put(`/api/manager/rooms/${roomId}/availability/`, payload);
        return data;
    },
    async fetchHotelImages(hotelId) {
        const { data } = await apiClient.get(`/api/manager/hotels/${hotelId}/images/`);
        return data;
    },
    async addHotelImage(hotelId, payload) {
        const { data } = await apiClient.post(`/api/manager/hotels/${hotelId}/images/`, payload);
        return data;
    },
    async updateHotelImage(hotelId, imageId, payload) {
        const { data } = await apiClient.put(`/api/manager/hotels/${hotelId}/images/${imageId}/`, payload);
        return data;
    },
    async setHotelCover(hotelId, imageId) {
        const { data } = await apiClient.post(`/api/manager/hotels/${hotelId}/images/${imageId}/cover/`);
        return data;
    },
    async deleteHotelImage(hotelId, imageId) {
        await apiClient.delete(`/api/manager/hotels/${hotelId}/images/${imageId}/`);
    },
};
