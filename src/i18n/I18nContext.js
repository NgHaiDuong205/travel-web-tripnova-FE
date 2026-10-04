import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "./locales/en";
import { detectLanguage, findLanguage, DEFAULT_LANGUAGE } from "./languages";
import { setCurrentLocale } from "./currentLocale";
import { translate } from "./translate";

const STORAGE_KEY = "tripnova.lang";

// Tiếng Anh đóng gói sẵn (fallback); ngôn ngữ khác tải lazy thành chunk riêng.
const loaders = {
    vi: () => import(/* webpackChunkName: "locale-vi" */ "./locales/vi"),
};
const loaded = { en };

function readSaved() {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

async function loadDictionary(code) {
    if (loaded[code]) return loaded[code];
    const mod = await loaders[code]();
    loaded[code] = mod.default;
    return loaded[code];
}

/** Gọi trước khi render (index.js): tải sẵn từ điển của ngôn ngữ đã chọn để trang đầu không nháy tiếng Anh. */
export async function prepareI18n() {
    const code = detectLanguage(readSaved());
    try {
        await loadDictionary(code);
        return code;
    } catch {
        return DEFAULT_LANGUAGE;
    }
}

const I18nContext = createContext(null);

export function I18nProvider({ initialLanguage = DEFAULT_LANGUAGE, children }) {
    // Ngôn ngữ chỉ được áp dụng khi từ điển đã tải xong → không nháy chữ tiếng Anh giữa chừng.
    const [state, setState] = useState(() => (loaded[initialLanguage]
        ? { lang: initialLanguage, dict: loaded[initialLanguage] }
        : { lang: DEFAULT_LANGUAGE, dict: en }));
    const [loading, setLoading] = useState(false);

    const changeLanguage = useCallback(async (code) => {
        const target = findLanguage(code).code;
        try {
            localStorage.setItem(STORAGE_KEY, target);
        } catch {
            // chế độ riêng tư: bỏ qua, chỉ không nhớ lựa chọn
        }
        setLoading(true);
        try {
            const dict = await loadDictionary(target);
            setState({ lang: target, dict });
        } catch {
            setState({ lang: DEFAULT_LANGUAGE, dict: en });
        } finally {
            setLoading(false);
        }
    }, []);

    const language = findLanguage(state.lang);
    // Cập nhật trong lúc render để formatters dùng đúng locale ngay ở lần render này.
    setCurrentLocale(language.locale);

    useEffect(() => {
        document.documentElement.lang = language.code;
    }, [language.code]);

    const value = useMemo(() => {
        const t = (key, vars) => translate(state.dict, en, language.locale, key, vars);
        return { t, lang: language.code, locale: language.locale, language, changeLanguage, loading };
    }, [state.dict, language, changeLanguage, loading]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** `const { t, lang, locale, changeLanguage } = useI18n();` — t("nav.home"), t("x.nights", { count: 2 }). */
export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
    return ctx;
}

/** Rút gọn khi chỉ cần hàm dịch. */
export function useT() {
    return useI18n().t;
}
