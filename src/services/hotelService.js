import apiClient from "../config/axiosConfig";
import { pickField, unwrapListResponse } from "../utils/apiHelpers";

export function normalizeHotel(raw) {
    const amenities = raw.amenities ?? raw.amenityList ?? [];
    return {
        id: pickField(raw, "id"),
        name: pickField(raw, "name"),
        description: pickField(raw, "description", "shortDescription", "short_description"),
        starRating: pickField(raw, "starRating", "star_rating"),
        destinationName: pickField(raw, "destinationName", "destination_name"),
        countryName: pickField(raw, "countryName", "country_name"),
        imageUrl: pickField(
            raw,
            "coverImageUrl",
            "cover_image_url",
            "imageUrl",
            "image_url",
            "thumbnailUrl",
            "thumbnail_url",
            "mainImage",
            "main_image",
            "coverImage",
            "cover_image"
        ),
        pricePerNight: pickField(
            raw,
            "pricePerNight",
            "price_per_night",
            "minPrice",
            "min_price",
            "startingPrice",
            "starting_price"
        ),
        totalRooms: pickField(raw, "totalRooms", "total_rooms"),
        remainingRooms: (() => {
            const value = pickField(raw, "remainingRooms", "remaining_rooms");
            if (value == null || value === "") return undefined;
            const n = Number(value);
            return Number.isNaN(n) ? undefined : n;
        })(),
        amenities: Array.isArray(amenities) ? amenities : [],
    };
}

/**
 * @param {Object} filters
 * @param {string} [filters.name]
 * @param {string} [filters.destinationName]
 * @param {string} [filters.countryName]
 * @param {number[]} [filters.starRatings]
 * @param {string[]} [filters.amenities]
 * @param {number} [filters.totalRooms]
 * @param {string} [filters.checkIn] YYYY-MM-DD
 * @param {string} [filters.checkOut] YYYY-MM-DD
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 */
export function buildHotelQueryParams(filters = {}) {
    const params = {};

    if (filters.name?.trim()) params.name = filters.name.trim();
    if (filters.destinationName?.trim()) {
        params.destinationName = filters.destinationName.trim();
    }
    if (filters.countryName?.trim()) {
        params.countryName = filters.countryName.trim();
    }

    const stars = filters.starRatings?.filter(Boolean) ?? [];
    if (stars.length === 1) {
        params.starRating = stars[0];
    } else if (stars.length > 1) {
        params.minStarRating = Math.min(...stars);
        params.maxStarRating = Math.max(...stars);
    }

    if (filters.totalRooms != null && filters.totalRooms > 0) {
        params.totalRooms = filters.totalRooms;
    }

    if (filters.checkIn?.trim() && filters.checkOut?.trim()) {
        params.checkIn = filters.checkIn.trim();
        params.checkOut = filters.checkOut.trim();
    }

    if (filters.amenities?.length) {
        params.amenities = filters.amenities;
    }

    params.page = filters.page ?? 1;
    params.limit = filters.limit ?? 10;

    return params;
}

export async function fetchHotels(filters = {}) {
    const params = buildHotelQueryParams(filters);

    const { data } = await apiClient.get("/api/hotels/", {
        params,
        paramsSerializer: {
            indexes: null,
        },
    });

    const meta = unwrapListResponse(data);
    return {
        ...meta,
        items: meta.items.map(normalizeHotel),
    };
}

export async function fetchHotelById(id) {
    const { data } = await apiClient.get(`/api/hotels/${id}/`);
    return normalizeHotel(data);
}
