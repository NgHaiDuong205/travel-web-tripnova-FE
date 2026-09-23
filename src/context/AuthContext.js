import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { AUTH_EXPIRED_EVENT, tokenStorage } from "../utils/tokenStorage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => tokenStorage.getUser());
    const [initializing, setInitializing] = useState(() => !!tokenStorage.getAccessToken());

    // Khi mở app: có token thì lấy lại thông tin user mới nhất.
    useEffect(() => {
        if (!tokenStorage.getAccessToken()) return;
        let cancelled = false;
        authService
            .fetchCurrentUser()
            .then((me) => !cancelled && setUser(me))
            .catch(() => {
                if (!cancelled && !tokenStorage.getAccessToken()) setUser(null);
            })
            .finally(() => !cancelled && setInitializing(false));
        return () => {
            cancelled = true;
        };
    }, []);

    // Refresh token hết hạn -> đăng xuất phía client.
    useEffect(() => {
        const onExpired = () => setUser(null);
        window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
        return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
    }, []);

    const login = useCallback(async (email, password) => {
        const data = await authService.login(email, password);
        setUser(data.user);
        return data.user;
    }, []);

    const register = useCallback(async (payload) => {
        const data = await authService.register(payload);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        const me = await authService.fetchCurrentUser();
        setUser(me);
        return me;
    }, []);

    const hasRole = useCallback((role) => !!user?.roles?.includes(role), [user]);

    const value = useMemo(
        () => ({
            user,
            isLoggedIn: !!user,
            initializing,
            login,
            register,
            logout,
            refreshUser,
            hasRole,
        }),
        [user, initializing, login, register, logout, refreshUser, hasRole]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
    return useContext(AuthContext);
}
