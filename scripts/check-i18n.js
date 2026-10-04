/**
 * Kiểm tra bản dịch: node scripts/check-i18n.js
 *  1. Mỗi ngôn ngữ có đúng bộ khoá như tiếng Anh (theo từng namespace; khoá số nhiều _one/_few/... tính theo khoá gốc).
 *  2. Mọi t("ns.key") viết cứng trong src/ đều có trong tiếng Anh.
 *  3. Biến {{x}} trong bản dịch khớp với tiếng Anh.
 * Thoát mã 1 nếu có lỗi.
 */
const fs = require("fs");
const path = require("path");

const LOCALES = path.join(__dirname, "..", "src", "i18n", "locales");
const SRC = path.join(__dirname, "..", "src");
const PLURAL = /_(zero|one|two|few|many|other)$/;

function flatten(obj, prefix = "", out = {}) {
    for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object") flatten(v, key, out);
        else out[key] = v;
    }
    return out;
}
const vars = (s) => [...String(s).matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort().join(",");

const langs = fs.readdirSync(LOCALES).filter((d) => fs.statSync(path.join(LOCALES, d)).isDirectory());
const namespaces = fs.readdirSync(path.join(LOCALES, "en")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
const errors = [];
const enFlat = {};

for (const ns of namespaces) {
    const en = flatten(JSON.parse(fs.readFileSync(path.join(LOCALES, "en", `${ns}.json`), "utf8")), ns);
    Object.assign(enFlat, en);
    const enBase = new Set(Object.keys(en).map((k) => k.replace(PLURAL, "")));
    for (const lang of langs.filter((l) => l !== "en")) {
        const file = path.join(LOCALES, lang, `${ns}.json`);
        if (!fs.existsSync(file)) { errors.push(`${lang}/${ns}.json: missing file`); continue; }
        let data;
        try { data = flatten(JSON.parse(fs.readFileSync(file, "utf8")), ns); } catch (e) { errors.push(`${lang}/${ns}.json: ${e.message}`); continue; }
        const base = new Set(Object.keys(data).map((k) => k.replace(PLURAL, "")));
        for (const k of enBase) if (!base.has(k)) errors.push(`${lang}: missing ${k}`);
        for (const k of base) if (!enBase.has(k)) errors.push(`${lang}: extra ${k}`);
        for (const [k, v] of Object.entries(data)) {
            const enValue = en[k] ?? en[k.replace(PLURAL, "_other")] ?? en[k.replace(PLURAL, "")];
            if (enValue !== undefined && vars(v) !== vars(enValue)) errors.push(`${lang}: ${k} placeholders {{${vars(v)}}} ≠ en {{${vars(enValue)}}}`);
        }
    }
    for (const lang of langs) {
        const index = fs.readFileSync(path.join(LOCALES, lang, "index.js"), "utf8");
        if (!new RegExp(`import ${ns} from "\./${ns}\.json"`).test(index)) errors.push(`${lang}/index.js: namespace ${ns} not imported`);
    }
}

// Khoá dùng trong code
const enBaseAll = new Set(Object.keys(enFlat).map((k) => k.replace(PLURAL, "")));
function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { if (entry.name !== "i18n") walk(full); continue; }
        if (!/\.(js|jsx)$/.test(entry.name)) continue;
        const text = fs.readFileSync(full, "utf8");
        for (const m of text.matchAll(/\bt\(\s*["'`]([a-zA-Z][\w.-]*)["'`]/g)) {
            if (!enBaseAll.has(m[1]) && !enFlat[m[1]]) errors.push(`${path.relative(SRC, full)}: unknown key "${m[1]}"`);
        }
    }
}
walk(SRC);

if (errors.length) {
    console.error(errors.join("\n"));
    console.error(`\n${errors.length} i18n problem(s).`);
    process.exit(1);
}
console.log(`i18n OK: ${langs.length} languages, ${namespaces.length} namespaces, ${Object.keys(enFlat).length} English keys.`);
