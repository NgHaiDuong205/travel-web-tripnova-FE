/** Tra khoá dạng "ns.a.b" trong từ điển lồng nhau. */
function lookup(dict, key) {
    if (!dict) return undefined;
    let node = dict;
    for (const part of key.split(".")) {
        if (node == null || typeof node !== "object") return undefined;
        node = node[part];
    }
    return typeof node === "string" ? node : undefined;
}

const pluralRulesCache = {};
function pluralCategory(locale, count) {
    if (!pluralRulesCache[locale]) pluralRulesCache[locale] = new Intl.PluralRules(locale);
    return pluralRulesCache[locale].select(count);
}

/** Thay {{name}} bằng giá trị trong vars. */
function interpolate(text, vars) {
    if (!vars) return text;
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) =>
        vars[name] === undefined || vars[name] === null ? match : String(vars[name]));
}

/**
 * Dịch `key` theo `dict` (ngôn ngữ đang chọn), thiếu thì lấy `fallback` (tiếng Anh), cuối cùng trả về `vars.defaultValue` hoặc chính key.
 * Số nhiều: khi có `vars.count`, thử `key_<one|few|many|other...>` theo Intl.PluralRules rồi `key_other`.
 */
export function translate(dict, fallback, locale, key, vars) {
    const candidates = [];
    if (vars && typeof vars.count === "number") {
        candidates.push(`${key}_${pluralCategory(locale, vars.count)}`, `${key}_other`);
    }
    candidates.push(key);
    for (const source of [dict, fallback]) {
        for (const candidate of candidates) {
            const found = lookup(source, candidate);
            if (found !== undefined) return interpolate(found, vars);
        }
    }
    if (vars?.defaultValue === undefined) warnMissing(key);
    return interpolate(vars?.defaultValue ?? key, vars);
}

const warned = new Set();
/** Dev: báo khoá không có cả trong tiếng Anh (thường do khoá động `t(\`x.${value}\`)` thiếu giá trị). */
function warnMissing(key) {
    if (process.env.NODE_ENV === "production" || warned.has(key)) return;
    warned.add(key);
    console.warn(`[i18n] missing key: ${key}`);
}
