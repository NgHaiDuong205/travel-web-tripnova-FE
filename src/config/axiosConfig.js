import axios from "axios";
import { API_BASE_URL } from "../constants/api";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Request failed";
        return Promise.reject(new Error(message));
    }
);

export default apiClient;
