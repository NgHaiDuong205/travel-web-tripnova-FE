import apiClient from "../config/axiosConfig";
import { pickField, unwrapListResponse } from "../utils/apiHelpers";

export function normalizeCountry(raw) {
    return {
        id: pickField(raw, "id"),
        countryCode: pickField(raw, "countryCode", "country_code", "code"),
        name: pickField(raw, "name", "countryName", "country_name"),
    };
}

export async function fetchCountries() {
    const { data } = await apiClient.get("/api/countries/");
    const { items } = unwrapListResponse(data);
    return items.map(normalizeCountry).filter((c) => c.name);
}
