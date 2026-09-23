import apiClient from "../config/axiosConfig";
import { tokenStorage } from "../utils/tokenStorage";

/** @returns {Promise<{accessToken, refreshToken, expiresIn, user}>} */
export async function login(email, password) {
    const { data } = await apiClient.post("/api/auth/login/", { email, password });
    tokenStorage.save(data);
    return data;
}

/** @param {{email: string, password: string, fullName: string, phone?: string}} payload */
export async function register(payload) {
    const { data } = await apiClient.post("/api/auth/register/", payload);
    tokenStorage.save(data);
    return data;
}

export async function logout() {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
        if (refreshToken) {
            await apiClient.post("/api/auth/logout/", { refreshToken });
        }
    } finally {
        tokenStorage.clear();
    }
}

export async function fetchCurrentUser() {
    const { data } = await apiClient.get("/api/auth/me/");
    tokenStorage.saveUser(data);
    return data;
}

export async function forgotPassword(email) {
    await apiClient.post("/api/auth/forgot-password/", { email });
}

export async function resetPassword(token, newPassword) {
    await apiClient.post("/api/auth/reset-password/", { token, newPassword });
}

/** Đổi mật khẩu — backend thu hồi mọi refresh token, nên FE phải đăng nhập lại. */
export async function changePassword(currentPassword, newPassword) {
    await apiClient.post("/api/auth/change-password/", { currentPassword, newPassword });
}
