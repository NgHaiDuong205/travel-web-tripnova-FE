import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "tripnova.theme";
const MODES = ["light", "dark", "system"];

function readSaved() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return MODES.includes(saved) ? saved : "system";
    } catch {
        return "system";
    }
}

function systemPrefersDark() {
    return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

const ThemeContext = createContext(null);

/**
 * Theme sáng / tối / theo hệ thống. Áp dụng bằng class `dark` trên <html>
 * (public/index.html đặt class trước khi React chạy để không nháy trắng).
 */
export function ThemeProvider({ children }) {
    const [mode, setModeState] = useState(readSaved);
    const [systemDark, setSystemDark] = useState(systemPrefersDark);

    useEffect(() => {
        const media = window.matchMedia?.("(prefers-color-scheme: dark)");
        if (!media) return undefined;
        const onChange = (e) => setSystemDark(e.matches);
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, []);

    const resolved = mode === "system" ? (systemDark ? "dark" : "light") : mode;

    useEffect(() => {
        document.documentElement.classList.toggle("dark", resolved === "dark");
    }, [resolved]);

    const setMode = useCallback((next) => {
        if (!MODES.includes(next)) return;
        setModeState(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // bỏ qua khi không có localStorage
        }
    }, []);

    const toggle = useCallback(() => setMode(resolved === "dark" ? "light" : "dark"), [resolved, setMode]);

    const value = useMemo(() => ({ mode, resolved, isDark: resolved === "dark", setMode, toggle }), [mode, resolved, setMode, toggle]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
    return ctx;
}
