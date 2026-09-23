import apiClient from "../config/axiosConfig";
import { pickField, unwrapListResponse } from "../utils/apiHelpers";

export function normalizeDestination(raw) {
    return {
        id: pickField(raw, "id"),
        name: pickField(raw, "name", "destinationName", "destination_name"),
        countryCode: pickField(raw, "countryCode", "country_code"),
    };
}

export async function fetchDestinations({ countryCode } = {}) {
    const params = {};
    if (countryCode) params.countryCode = countryCode;

    const { data } = await apiClient.get("/api/destinations/", { params });
    const { items } = unwrapListResponse(data);
    return items.map(normalizeDestination).filter((d) => d.name);
}
