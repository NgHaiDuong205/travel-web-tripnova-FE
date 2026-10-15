import axios from "axios";
import { API_BASE_URL } from "../constants/api";
import { AUTH_EXPIRED_EVENT, tokenStorage } from "../utils/tokenStorage";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

/** Client riêng cho refresh-token — không qua interceptor để tránh lặp vô hạn. */
const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
});

const AUTH_PATHS_WITHOUT_REFRESH = [
    "/api/auth/login/",
    "/api/auth/register/",
    "/api/auth/refresh-token/",
    "/api/auth/logout/",
];

let refreshPromise = null;

/** Gọi refresh-token một lần duy nhất dù nhiều request cùng bị 401 (dùng chung cho fetch stream). */
export function refreshAccessToken() {
    if (!refreshPromise) {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) return Promise.reject(new Error("No refresh token"));
        refreshPromise = refreshClient
            .post("/api/auth/refresh-token/", { refreshToken })
            .then(({ data }) => {
                tokenStorage.save(data);
                return data.accessToken;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}

function toApiError(error) {
    const data = error.response?.data;
    const message =
        data?.message ||
        data?.error ||
        error.message ||
        "Request failed";
    const apiError = new Error(message);
    apiError.status = error.response?.status;
    apiError.code = data?.code; // VD "email_not_verified"
    apiError.details = Array.isArray(data?.detail) ? data.detail : [];
    return apiError;
}

apiClient.interceptors.request.use((config) => {
    const token = tokenStorage.getAccessToken();
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const status = error.response?.status;
        const isAuthPath = AUTH_PATHS_WITHOUT_REFRESH.some((p) => original?.url?.startsWith(p));

        if (status === 401 && original && !original._retry && !isAuthPath && tokenStorage.getRefreshToken()) {
            original._retry = true;
            try {
                const newToken = await refreshAccessToken();
                original.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(original);
            } catch {
                tokenStorage.clear();
                window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
            }
        }
        return Promise.reject(toApiError(error));
    }
);

export default apiClient;
