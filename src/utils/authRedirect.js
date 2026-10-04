/**
 * Chỉ cho phép redirect nội bộ (bắt đầu bằng "/") để tránh open-redirect:
 * loại "//host" và "/\host" (trình duyệt coi như URL khác origin). Không hợp lệ → null.
 */
export function safeRedirect(value) {
    return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : null;
}

/** `path` kèm `?redirect=` (trang cần quay lại sau đăng nhập / đăng ký); bỏ qua nếu không có hoặc là trang chủ. */
export function withRedirect(path, redirect) {
    const target = safeRedirect(redirect);
    return target && target !== "/" ? `${path}?redirect=${encodeURIComponent(target)}` : path;
}
