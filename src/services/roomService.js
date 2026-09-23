import apiClient from "../config/axiosConfig";
import { pickField, unwrapListResponse } from "../utils/apiHelpers";

export function normalizeRoom(raw) {
    const amenities = raw.amenities ?? raw.amenityList ?? raw.amenityIds ?? [];
    const amenityIds = Array.isArray(amenities)
        ? amenities.map((a) =>
              typeof a === "string" ? a : pickField(a, "id", "code", "name") ?? ""
          )
        : [];

    const roomTypeRaw = pickField(
        raw,
        "roomTypeId",
        "room_type_id",
        "roomType",
        "room_type",
        "type"
    );
    const roomTypeId =
        typeof roomTypeRaw === "object" && roomTypeRaw != null
            ? pickField(roomTypeRaw, "id", "code", "name")
            : roomTypeRaw;

    const price = pickField(raw, "price", "pricePerNight", "price_per_night");
    const image = pickField(
        raw,
        "imageUrl",
        "image_url",
        "image",
        "coverImageUrl",
        "cover_image_url",
        "thumbnailUrl",
        "thumbnail_url"
    );

    return {
        id: pickField(raw, "id"),
        hotelId: pickField(raw, "hotelId", "hotel_id"),
        hotelName: pickField(raw, "hotelName", "hotel_name"),
        name: pickField(raw, "name", "roomName", "room_name"),
        roomTypeId: roomTypeId ?? "",
        roomTypeName: pickField(raw, "roomTypeName", "room_type_name"),
        maxGuests: Number(pickField(raw, "maxGuests", "max_guests", "maxOccupancy", "max_occupancy", "capacity")) || 1,
        price: price != null ? Number(price) : undefined,
        currency: pickField(raw, "currency", "currencyCode", "currency_code") || "€",
        image,
        description: pickField(raw, "description", "shortDescription", "short_description"),
        highlights: Array.isArray(raw.highlights)
            ? raw.highlights
            : Array.isArray(raw.featureList)
              ? raw.featureList
              : [],
        amenityIds: amenityIds.filter(Boolean),
        status: pickField(raw, "status", "roomStatus", "room_status"),
        bookedRanges: raw.bookedRanges ?? raw.booked_ranges ?? [],
        areaSqM: pickField(raw, "areaSqM", "area_sq_m", "area"),
        bedType: pickField(raw, "bedType", "bed_type"),
        floor: pickField(raw, "floor"),
        roomNumber: pickField(raw, "roomNumber", "room_number"),
    };
}

/**
 * @param {Object} filters
 * @param {string} [filters.checkIn] YYYY-MM-DD
 * @param {string} [filters.checkOut] YYYY-MM-DD
 * @param {number} [filters.maxGuests]
 * @param {number|string} [filters.minPrice]
 * @param {number|string} [filters.maxPrice]
 * @param {string[]} [filters.roomTypeIds]
 * @param {string[]} [filters.amenityIds]
 * @param {string|number} [filters.hotelId]
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 */
export function buildRoomQueryParams(filters = {}) {
    const params = {};

    if (filters.checkIn?.trim() && filters.checkOut?.trim()) {
        params.checkIn = filters.checkIn.trim();
        params.checkOut = filters.checkOut.trim();
    }

    const maxGuests = Number(filters.maxGuests);
    if (maxGuests > 0) params.maxGuests = maxGuests;

    const min = filters.minPrice !== "" && filters.minPrice != null ? Number(filters.minPrice) : null;
    const max = filters.maxPrice !== "" && filters.maxPrice != null ? Number(filters.maxPrice) : null;
    if (min != null && !Number.isNaN(min)) params.minPrice = min;
    if (max != null && !Number.isNaN(max)) params.maxPrice = max;

    if (filters.roomTypeIds?.length) params.roomTypes = filters.roomTypeIds;
    if (filters.amenityIds?.length) params.amenities = filters.amenityIds;
    if (filters.hotelId != null && filters.hotelId !== "") {
        params.hotelId = filters.hotelId;
    }

    params.page = filters.page ?? 1;
    params.limit = filters.limit ?? 50;

    return params;
}

export async function fetchRooms(filters = {}) {
    const params = buildRoomQueryParams(filters);

    if (filters.hotelId != null && filters.hotelId !== "") {
        const url = `/api/hotels/${filters.hotelId}/rooms/`;
        delete params.hotelId;
        const { data } = await apiClient.get(url, {
            params,
            paramsSerializer: { indexes: null },
        });
        const meta = unwrapListResponse(data);
        return {
            ...meta,
            items: meta.items.map((item) =>
                normalizeRoom({ ...item, hotelId: filters.hotelId })
            ),
        };
    } else {
        // Fallback Aggregation: Do backend không có endpoint lấy tất cả phòng (/api/rooms/), 
        // ta sẽ lấy 10 khách sạn đầu tiên và gộp danh sách phòng của họ.
        try {
            const { data: hotelsData } = await apiClient.get("/api/hotels/", {
                params: { page: 1, limit: 10 }
            });
            const hotelsList = Array.isArray(hotelsData) ? hotelsData : (hotelsData.items ?? []);
            
            const roomsPromises = hotelsList.slice(0, 10).map(async (hotel) => {
                try {
                    const { data: roomsData } = await apiClient.get(`/api/hotels/${hotel.id}/rooms/`, {
                        params,
                        paramsSerializer: { indexes: null }
                    });
                    const rList = Array.isArray(roomsData) ? roomsData : (roomsData.items ?? []);
                    return rList.map(r => ({ ...r, hotelId: hotel.id, hotelName: hotel.name }));
                } catch {
                    return [];
                }
            });
            
            const results = await Promise.all(roomsPromises);
            const allRooms = results.flat();
            return {
                items: allRooms.map(normalizeRoom),
                total: allRooms.length,
                page: 1,
                totalPages: 1,
                limit: 50
            };
        } catch (err) {
            return { items: [], total: 0, page: 1, totalPages: 1, limit: 50 };
        }
    }
}

export async function fetchRoomDetails(hotelId, roomId) {
    const { data } = await apiClient.get(`/api/hotels/${hotelId}/rooms/${roomId}/`);
    return normalizeRoom({ ...data, hotelId });
}
