import { useEffect, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import FormAlert from "../common/FormAlert";
import { fetchAdminStats } from "../../services/adminService";
import { formatMoney, isoDateFromToday } from "../../utils/formatters";
import { toDisplay } from "../../utils/currency";
import { ADMIN_STATS } from "./adminStatsConfig";
import { getCurrentLocale } from "../../i18n/currentLocale";
import { useT } from "../../i18n/I18nContext";

const PERIODS = [
    { key: "7d", labelKey: "admin.stats.period7d", days: 7, granularity: "day" },
    { key: "30d", labelKey: "admin.stats.period30d", days: 30, granularity: "day" },
    { key: "90d", labelKey: "admin.stats.period90d", days: 90, granularity: "week" },
    { key: "12m", labelKey: "admin.stats.period12m", days: 365, granularity: "month" },
];
const PALETTE = ["#003580", "#0071c2", "#febb02", "#16a34a", "#7c3aed", "#0891b2", "#f97316", "#dc2626", "#64748b", "#db2777"];
/** Màu cố định cho sản phẩm và các trạng thái hay gặp, để cùng một khoá luôn cùng màu giữa các biểu đồ. */
const STATUS_COLORS = {
    hotel: "#003580",
    car: "#0071c2",
    flight: "#febb02",
    tour: "#16a34a",
    success: "#16a34a",
    completed: "#16a34a",
    approved: "#16a34a",
    resolved: "#16a34a",
    active: "#16a34a",
    confirmed: "#0071c2",
    checked_in: "#0891b2",
    checked_out: "#003580",
    pending: "#94a3b8",
    new: "#0071c2",
    in_progress: "#febb02",
    refunded: "#f59e0b",
    failed: "#dc2626",
    cancelled: "#dc2626",
    rejected: "#dc2626",
    deleted: "#dc2626",
    locked: "#f97316",
    no_show: "#7c3aed",
    spam: "#64748b",
    closed: "#64748b",
};
const CHART_HEIGHT = 240;
const STORAGE_KEY = "tripnova.admin.stats.collapsed";

function readCollapsed() {
    try {
        return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
        return {};
    }
}

function writeCollapsed(value) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
        // Trình duyệt chặn storage: chỉ mất ghi nhớ trạng thái thu gọn.
    }
}

/** Tên riêng không viết hoa theo quy tắc chung. */
const PROPER_LABELS = {
    vnpay: "VNPay",
    momo: "MoMo",
    zalopay: "ZaloPay",
    e_wallet: "E-wallet",
    USER: "User",
    ADMIN: "Admin",
    HOTEL_MANAGER: "Hotel manager",
};

/** Mã enum "credit_card" -> "Credit card" (tên, email, truy vấn… giữ nguyên, xem BreakdownChart). */
function prettify(text) {
    if (PROPER_LABELS[text]) return PROPER_LABELS[text];
    const s = String(text ?? "").replace(/_/g, " ");
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatValue(value, format, currency) {
    const n = Number(value ?? 0);
    switch (format) {
        case "money":
            return formatMoney(n, currency);
        case "percent":
            return `${n.toLocaleString(getCurrentLocale(), { maximumFractionDigits: 1 })}%`;
        case "decimal":
            return n.toLocaleString(getCurrentLocale(), { maximumFractionDigits: 2 });
        case "hours":
            return `${n.toLocaleString(getCurrentLocale(), { maximumFractionDigits: 1 })} h`;
        default:
            return n.toLocaleString(getCurrentLocale());
    }
}

/** Nhãn trục số gọn (1.2K, 3.4M). */
function compact(value, format) {
    if (format !== "money") {
        return Number(value).toLocaleString(getCurrentLocale(), { notation: "compact", maximumFractionDigits: 1 });
    }
    const { amount, currency } = toDisplay(value);
    return amount.toLocaleString(getCurrentLocale(), {
        notation: "compact",
        maximumFractionDigits: 1,
        style: "currency",
        currency,
    });
}

function periodLabel(iso, granularity) {
    const [y, m, d] = iso.split("-");
    return granularity === "month" ? `${m}/${y}` : `${d}/${m}`;
}

function truncate(text, max = 22) {
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function colorFor(key, index) {
    return STATUS_COLORS[key] || PALETTE[index % PALETTE.length];
}

function EmptyChart() {
    const t = useT();
    return (
        <div className="flex items-center justify-center text-sm text-gray-400" style={{ height: CHART_HEIGHT }}>
            {t("admin.stats.empty")}
        </div>
    );
}

function SeriesChart({ chart, stats, t }) {
    const data = stats.series.map((p) => ({ label: periodLabel(p.period, stats.granularity), ...p.values }));
    const hasData = stats.series.some((p) => chart.series.some((s) => Number(p.values[s.key]) > 0));
    if (!hasData) return <EmptyChart />;

    const fmt = (v) => formatValue(v, chart.format, stats.currencyCode);
    const common = { data, margin: { top: 8, right: 8, left: 0, bottom: 0 } };
    const axes = [
        <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#eef0f3" vertical={false} />,
        <XAxis key="x" dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={12} />,
        <YAxis
            key="y"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
            allowDecimals={chart.format !== "number"}
            tickFormatter={(v) => compact(v, chart.format)}
        />,
        <Tooltip key="tip" formatter={(v, name) => [fmt(v), name]} />,
    ];
    if (chart.series.length > 1) axes.push(<Legend key="legend" wrapperStyle={{ fontSize: 12 }} />);
    const color = (s, i) => STATUS_COLORS[s.key] || PALETTE[i % PALETTE.length];

    return (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            {chart.kind === "area" ? (
                <AreaChart {...common}>
                    {axes}
                    {chart.series.map((s, i) => (
                        <Area
                            key={s.key}
                            type="monotone"
                            dataKey={s.key}
                            name={t(s.labelKey)}
                            stroke={color(s, i)}
                            fill={color(s, i)}
                            fillOpacity={0.15}
                            strokeWidth={2}
                        />
                    ))}
                </AreaChart>
            ) : chart.kind === "line" ? (
                <LineChart {...common}>
                    {axes}
                    {chart.series.map((s, i) => (
                        <Line
                            key={s.key}
                            type="monotone"
                            dataKey={s.key}
                            name={t(s.labelKey)}
                            stroke={color(s, i)}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                </LineChart>
            ) : (
                <BarChart {...common}>
                    {axes}
                    {chart.series.map((s, i) => (
                        <Bar
                            key={s.key}
                            dataKey={s.key}
                            name={t(s.labelKey)}
                            fill={color(s, i)}
                            stackId={chart.stacked ? "stack" : undefined}
                            radius={chart.stacked ? 0 : [3, 3, 0, 0]}
                            maxBarSize={36}
                        />
                    ))}
                </BarChart>
            )}
        </ResponsiveContainer>
    );
}

// Khoảng BE trả về dạng "2 nights", "3-4 days", "31+ days", "5 star" → dịch đơn vị, giữ số
const BUCKET_PATTERN = /^(\d+(?:-\d+)?\+?) (night|nights|day|days|people|star)$/;

/**
 * Nhãn breakdown từ BE: mã cố định (trạng thái, sản phẩm, phương thức thanh toán, loại xe, hạng ghế, giới tính,
 * vai trò...) → admin.stats.values.<mã>; khoảng số → admin.stats.bucket.<đơn vị>. Tên riêng (khách sạn, email...) giữ nguyên.
 */
function localizeBreakdownLabel(t, item) {
    const raw = String(item.label ?? "");
    const fallback = /^[A-Za-z_]+$/.test(raw) ? prettify(raw) : raw;
    if (/^[A-Za-z_]+$/.test(String(item.key))) {
        return t(`admin.stats.values.${String(item.key).toLowerCase()}`, { defaultValue: fallback });
    }
    const bucket = BUCKET_PATTERN.exec(raw);
    if (bucket) return t(`admin.stats.bucket.${bucket[2]}`, { n: bucket[1] });
    return fallback;
}

function BreakdownChart({ chart, stats, t }) {
    const slices = (stats.breakdowns[chart.name] || [])
        .map((s) => ({
            key: s.key,
            label: localizeBreakdownLabel(t, s),
            value: Number(chart.value === "amount" ? s.amount : s.count) || 0,
        }))
        .filter((s) => chart.kind !== "pie" || s.value > 0);
    if (slices.every((s) => s.value === 0)) return <EmptyChart />;

    const fmt = (v) => formatValue(v, chart.format, stats.currencyCode);
    if (chart.kind === "pie") {
        const total = slices.reduce((sum, s) => sum + s.value, 0);
        return (
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <PieChart>
                    <Pie data={slices} dataKey="value" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={1}>
                        {slices.map((s, i) => (
                            <Cell key={s.key} fill={colorFor(s.key, i)} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(v, name) => [`${fmt(v)} (${((Number(v) / total) * 100).toFixed(1)}%)`, name]} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
            </ResponsiveContainer>
        );
    }
    if (chart.kind === "hbar") {
        const height = Math.max(CHART_HEIGHT, slices.length * 28 + 20);
        return (
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={slices} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" horizontal={false} />
                    <XAxis
                        type="number"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={chart.format !== "number"}
                        tickFormatter={(v) => compact(v, chart.format)}
                    />
                    <YAxis
                        type="category"
                        dataKey="label"
                        width={150}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => truncate(v)}
                    />
                    <Tooltip formatter={(v) => [fmt(v), t(chart.value === "amount" ? "admin.stats.amount" : "admin.stats.count")]} />
                    <Bar dataKey="value" fill={PALETTE[0]} radius={[0, 3, 3, 0]} maxBarSize={20} />
                </BarChart>
            </ResponsiveContainer>
        );
    }
    return (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={slices} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" vertical={false} />
                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tickFormatter={(v) => truncate(v, 14)}
                />
                <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    allowDecimals={chart.format !== "number"}
                    tickFormatter={(v) => compact(v, chart.format)}
                />
                <Tooltip formatter={(v) => [fmt(v), t(chart.value === "amount" ? "admin.stats.amount" : "admin.stats.count")]} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={48}>
                    {slices.map((s, i) => (
                        <Cell key={s.key} fill={colorFor(s.key, i)} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

/**
 * Khối thống kê đặt đầu mỗi trang admin: KPI + biểu đồ theo cấu hình `ADMIN_STATS[section]`.
 * Có chọn kỳ (7/30/90 ngày, 12 tháng) và thu gọn (ghi nhớ theo từng section trong trình duyệt).
 * Trang khác (VD quản lý khách sạn) truyền `config` + `load(params)` riêng; `load` phải ổn định (useCallback).
 */
function AdminStatsPanel({ section, config: configProp, load }) {
    const t = useT();
    const config = configProp || ADMIN_STATS[section];
    const [periodKey, setPeriodKey] = useState("30d");
    const [collapsed, setCollapsed] = useState(() => Boolean(readCollapsed()[section]));
    const [state, setState] = useState({ loading: true, error: "", stats: null });
    const period = PERIODS.find((p) => p.key === periodKey);

    useEffect(() => {
        if (collapsed) return undefined;
        let cancelled = false;
        setState((prev) => ({ ...prev, loading: true, error: "" }));
        const params = { from: isoDateFromToday(-(period.days - 1)), to: isoDateFromToday(0), granularity: period.granularity };
        (load ? load(params) : fetchAdminStats(section, params))
            .then((stats) => !cancelled && setState({ loading: false, error: "", stats }))
            .catch((err) => !cancelled && setState((prev) => ({ ...prev, loading: false, error: err.message })));
        return () => {
            cancelled = true;
        };
    }, [section, period, collapsed, load]);

    const toggle = () => {
        const next = !collapsed;
        setCollapsed(next);
        writeCollapsed({ ...readCollapsed(), [section]: next });
    };

    if (!config) return null;
    const { stats } = state;

    return (
        <section
            className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-6 min-w-0"
            data-testid={`admin-stats-${section}`}
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={toggle} className="flex items-center gap-2 text-left" aria-expanded={!collapsed}>
                    <span className="material-symbols-outlined text-primary">monitoring</span>
                    <h2 className="text-lg font-bold text-gray-900">{t(config.titleKey)}</h2>
                    <span className="material-symbols-outlined text-gray-400">{collapsed ? "expand_more" : "expand_less"}</span>
                </button>
                {!collapsed && (
                    <div
                        className="flex flex-wrap w-full sm:w-auto rounded-lg border border-gray-200 overflow-hidden"
                        role="group"
                        aria-label={t("admin.stats.selectPeriod")}
                    >
                        {PERIODS.map((p) => (
                            <button
                                key={p.key}
                                type="button"
                                aria-pressed={p.key === periodKey}
                                onClick={() => setPeriodKey(p.key)}
                                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold whitespace-nowrap ${p.key === periodKey ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"}`}
                            >
                                {t(p.labelKey)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {!collapsed && (
                <>
                    <FormAlert>{state.error}</FormAlert>
                    {state.loading && !stats && <div className="h-64 rounded-lg bg-gray-50 animate-pulse" />}
                    {stats && (
                        <div className={`space-y-6 transition-opacity ${state.loading ? "opacity-60" : ""}`}>
                            <div
                                className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${config.kpis.length >= 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}
                            >
                                {config.kpis.map((k) => (
                                    <div key={k.key} className="rounded-xl border border-gray-100 p-4 min-w-0">
                                        <p className="text-xs text-gray-500 font-medium">{t(k.labelKey)}</p>
                                        <p className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1 truncate">
                                            {formatValue(stats.kpis[k.key], k.format, stats.currencyCode)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {config.charts.map((chart) => (
                                    <div
                                        key={chart.titleKey}
                                        className={`rounded-xl border border-gray-100 p-4 min-w-0 ${chart.span === 2 ? "lg:col-span-2" : ""}`}
                                    >
                                        <h3 className="text-sm font-bold text-gray-700 mb-3">{t(chart.titleKey)}</h3>
                                        {chart.type === "series" ? (
                                            <SeriesChart chart={chart} stats={stats} t={t} />
                                        ) : (
                                            <BreakdownChart chart={chart} stats={stats} t={t} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400">
                                {t("admin.stats.latestData", { period: t(period.labelKey) })}
                                {period.granularity === "week"
                                    ? t("admin.stats.weekly")
                                    : period.granularity === "month"
                                      ? t("admin.stats.monthly")
                                      : ""}
                                .{" "}
                                {config.noteKey ? t(config.noteKey) : t("admin.stats.defaultNote")}
                            </p>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

export default AdminStatsPanel;
