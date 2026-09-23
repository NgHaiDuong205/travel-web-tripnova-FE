/** Lưu JWT + refresh token + user trong localStorage (chịu lỗi khi storage bị chặn). */
const ACCESS_KEY = "tripnova.accessToken";
const REFRESH_KEY = "tripnova.refreshToken";
const USER_KEY = "tripnova.user";

function safeGet(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeSet(key, value) {
    try {
        if (value == null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
    } catch {
        /* storage bị chặn: bỏ qua */
    }
}

export const tokenStorage = {
    getAccessToken: () => safeGet(ACCESS_KEY),
    getRefreshToken: () => safeGet(REFRESH_KEY),
    getUser: () => {
        const raw = safeGet(USER_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },
    /** @param {{accessToken: string, refreshToken: string, user?: object}} auth */
    save(auth) {
        safeSet(ACCESS_KEY, auth.accessToken);
        safeSet(REFRESH_KEY, auth.refreshToken);
        if (auth.user) safeSet(USER_KEY, JSON.stringify(auth.user));
    },
    saveUser: (user) => safeSet(USER_KEY, user ? JSON.stringify(user) : null),
    clear() {
        safeSet(ACCESS_KEY, null);
        safeSet(REFRESH_KEY, null);
        safeSet(USER_KEY, null);
    },
};

/** Sự kiện phát ra khi phiên đăng nhập hết hạn (refresh thất bại). */
export const AUTH_EXPIRED_EVENT = "tripnova:auth-expired";
