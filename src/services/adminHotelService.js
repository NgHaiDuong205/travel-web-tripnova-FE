import apiClient from "../config/axiosConfig";

function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

// ---- Hotels ----

/** @param {{q?, destinationId?, status?: "all"|"active"|"inactive", page?, limit?}} filters */
export async function fetchAdminHotels({ q = "", destinationId = "", status = "all", page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/hotels/", {
        params: { q: q || undefined, destinationId: destinationId || undefined, status, page, limit },
    });
    return readList(response);
}

export async function fetchAdminHotel(hotelId) {
    const { data } = await apiClient.get(`/api/admin/hotels/${hotelId}/`);
    return data;
}

export async function createAdminHotel(payload) {
    const { data } = await apiClient.post("/api/admin/hotels/", payload);
    return data;
}

export async function updateAdminHotel(hotelId, payload) {
    const { data } = await apiClient.put(`/api/admin/hotels/${hotelId}/`, payload);
    return data;
}

/** Xoá mềm (is_active = false). Khôi phục bằng updateAdminHotel với isActive: true. */
export async function deactivateAdminHotel(hotelId) {
    await apiClient.delete(`/api/admin/hotels/${hotelId}/`);
}

// ---- Room types ----

export async function fetchAdminRoomTypes(hotelId) {
    const { data } = await apiClient.get(`/api/admin/hotels/${hotelId}/room-types/`);
    return data;
}

export async function saveAdminRoomType(hotelId, roomTypeId, payload) {
    const { data } = roomTypeId
        ? await apiClient.put(`/api/admin/hotels/${hotelId}/room-types/${roomTypeId}/`, payload)
        : await apiClient.post(`/api/admin/hotels/${hotelId}/room-types/`, payload);
    return data;
}

export async function deactivateAdminRoomType(hotelId, roomTypeId) {
    await apiClient.delete(`/api/admin/hotels/${hotelId}/room-types/${roomTypeId}/`);
}

// ---- Rooms ----

export async function fetchAdminRooms(hotelId, roomTypeId) {
    const { data } = await apiClient.get(`/api/admin/hotels/${hotelId}/rooms/`, {
        params: { roomTypeId: roomTypeId || undefined },
    });
    return data;
}

export async function saveAdminRoom(hotelId, roomId, payload) {
    const { data } = roomId
        ? await apiClient.put(`/api/admin/hotels/${hotelId}/rooms/${roomId}/`, payload)
        : await apiClient.post(`/api/admin/hotels/${hotelId}/rooms/`, payload);
    return data;
}

/** Chỉ xoá được phòng chưa từng được đặt (BE trả 409 nếu có lịch sử). */
export async function deleteAdminRoom(hotelId, roomId) {
    await apiClient.delete(`/api/admin/hotels/${hotelId}/rooms/${roomId}/`);
}

// ---- Room availability ----

/** Trả các ngày booked/blocked trong [from, to]; ngày không có trong danh sách là còn trống. */
export async function fetchRoomAvailability(roomId, from, to) {
    const { data } = await apiClient.get(`/api/admin/rooms/${roomId}/availability/`, { params: { from, to } });
    return data;
}

/** @param {{from, to, status: "blocked"|"available", reason?}} payload — from/to tính cả 2 đầu */
export async function updateRoomAvailability(roomId, payload) {
    const { data } = await apiClient.put(`/api/admin/rooms/${roomId}/availability/`, payload);
    return data;
}

// ---- Lookups cho form ----

/** Điểm đến kèm tên quốc gia (dùng cho ô chọn điểm đến). */
export async function fetchDestinationOptions() {
    const { data } = await apiClient.get("/api/destinations/");
    return data
        .map((d) => ({ id: d.id, name: d.name, countryName: d.countryName || "" }))
        .sort((a, b) => a.countryName.localeCompare(b.countryName) || a.name.localeCompare(b.name));
}

export const ROOM_STATUSES = ["available", "occupied", "maintenance"];
export const CANCELLATION_POLICIES = ["free", "partial", "strict"];

/** Body PUT đầy đủ từ AdminHotelDTO (PUT thay toàn bộ: trường nullable để trống sẽ bị xoá). */
export function hotelToPayload(hotel) {
    return {
        destinationId: hotel.destinationId,
        name: hotel.name,
        description: hotel.description,
        address: hotel.address,
        starRating: hotel.starRating,
        checkInTime: hotel.checkInTime?.slice(0, 5),
        checkOutTime: hotel.checkOutTime?.slice(0, 5),
        phone: hotel.phone,
        email: hotel.email,
        cancellationPolicy: hotel.cancellationPolicy,
        cancellationHours: hotel.cancellationHours,
        breakfastIncluded: hotel.breakfastIncluded,
        petFriendly: hotel.petFriendly,
        coverImageUrl: hotel.coverImageUrl,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        managedById: hotel.managedById,
        amenityIds: hotel.amenityIds,
        isActive: hotel.isActive,
    };
}

/** Body PUT đầy đủ từ RoomTypeDTO. */
export function roomTypeToPayload(roomType) {
    return {
        name: roomType.name,
        description: roomType.description,
        maxOccupancy: roomType.maxOccupancy,
        bedType: roomType.bedType,
        areaSqM: roomType.areaSqM,
        pricePerNight: roomType.pricePerNight,
        coverImageUrl: roomType.coverImageUrl,
        amenityIds: roomType.amenityIds,
        isActive: roomType.isActive,
    };
}
