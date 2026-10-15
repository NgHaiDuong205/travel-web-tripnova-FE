import apiClient from "../config/axiosConfig";
import { API_BASE_URL } from "../constants/api";
import { tokenStorage } from "../utils/tokenStorage";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

function fileForm(file) {
    const form = new FormData();
    form.append("file", file);
    return form;
}

// ---------- email ----------
export async function verifyEmail(token) {
    const { data } = await apiClient.post("/api/auth/verify-email/", { token });
    return data;
}

export async function resendVerification() {
    await apiClient.post("/api/auth/resend-verification/");
}

/** Chưa đăng nhập được vì chưa xác thực: gửi lại theo email (BE luôn trả 204, không lộ email nào đã đăng ký). */
export async function resendVerificationEmail(email) {
    await apiClient.post("/api/auth/resend-verification/", { email });
}

export async function changeEmail(newEmail, currentPassword) {
    const { data } = await apiClient.put("/api/account/email/", { newEmail, currentPassword });
    return data;
}

/** Xoá mềm tài khoản; thành công thì xoá token phía client. */
export async function deleteAccount(password) {
    await apiClient.delete("/api/account/", { data: { password } });
    tokenStorage.clear();
}

// ---------- ảnh ----------
export async function uploadAvatar(file) {
    const { data } = await apiClient.put("/api/me/avatar/", fileForm(file), multipart);
    return data;
}

export async function removeAvatar() {
    const { data } = await apiClient.delete("/api/me/avatar/");
    return data;
}

/** @returns {Promise<string>} URL tuyệt đối của ảnh vừa tải lên */
export async function uploadImage(file) {
    const { data } = await apiClient.post("/api/uploads/images/", fileForm(file), multipart);
    return data.url;
}

export async function deleteUploadedImage(url) {
    await apiClient.delete("/api/uploads/images/", { data: { url } });
}

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/gif,image/webp";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Kiểm tra trước khi gửi (BE vẫn kiểm tra lại theo nội dung file). */
export function validateImageFile(file) {
    if (!file) return "Choose an image first.";
    if (!IMAGE_ACCEPT.split(",").includes(file.type)) return "Only JPEG, PNG, GIF or WEBP images are allowed.";
    if (file.size > MAX_IMAGE_BYTES) return "Images must be 5 MB or smaller.";
    return "";
}

// ---------- OAuth2 ----------
/** sessionStorage: trang cần quay lại sau khi đăng nhập mạng xã hội xong. */
export const OAUTH_REDIRECT_KEY = "tripnova.oauthRedirect";

export const OAUTH_PROVIDERS = {
    google: { label: "Google", icon: "G", className: "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50" },
    facebook: { label: "Facebook", icon: "f", className: "bg-[#1877F2] text-white hover:bg-[#166fe5]" },
    github: { label: "GitHub", icon: "GH", className: "bg-[#24292f] text-white hover:bg-black" },
};

/** Provider đã được cấu hình ở BE (rỗng -> ẩn nút đăng nhập mạng xã hội). */
export async function fetchOAuthProviders() {
    const { data } = await apiClient.get("/api/auth/oauth2/providers/");
    return data;
}

/** URL mở trang đăng nhập của provider (điều hướng cả trang, không gọi bằng axios). */
export function oauthAuthorizeUrl(provider, linkToken) {
    const base = `${API_BASE_URL}/oauth2/authorization/${provider}`;
    return linkToken ? `${base}?link=${encodeURIComponent(linkToken)}` : base;
}

/** Đổi mã 1 lần lấy JWT rồi lưu như đăng nhập thường. */
export async function exchangeOAuthCode(code) {
    const { data } = await apiClient.post("/api/auth/oauth2/exchange/", { code });
    tokenStorage.save(data);
    return data;
}

export async function fetchLinkedAccounts() {
    const { data } = await apiClient.get("/api/me/oauth-accounts/");
    return data;
}

export async function createLinkToken() {
    const { data } = await apiClient.post("/api/me/oauth-accounts/link-token/");
    return data.token;
}

export async function unlinkAccount(provider) {
    await apiClient.delete(`/api/me/oauth-accounts/${provider}/`);
}
