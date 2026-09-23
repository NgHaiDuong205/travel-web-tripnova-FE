import apiClient from "../config/axiosConfig";

export async function fetchContinents() {
    const { data } = await apiClient.get("/api/continents/");
    return data;
}

/** @param {string} [category] security | service | wellness | internet | recreation | food | transport | fitness | room */
export async function fetchAmenities(category) {
    const { data } = await apiClient.get("/api/amenities/", { params: { category: category || undefined } });
    return data;
}

export async function fetchHotelRoomTypes(hotelId) {
    const { data } = await apiClient.get(`/api/hotels/${hotelId}/room-types/`);
    return data;
}
