import apiClient from "../config/axiosConfig";

/** @param {{fullName, email, phone?, subject?, message}} payload */
export async function sendContactMessage(payload) {
    await apiClient.post("/api/contact/", payload);
}

export async function fetchContactInfo() {
    const { data } = await apiClient.get("/api/contact/info/");
    return data;
}
