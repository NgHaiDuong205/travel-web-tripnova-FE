import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import CatalogHero from "../../../components/catalog/CatalogHero";
import FormAlert from "../../../components/common/FormAlert";
import DestinationPicker from "../../../components/planner/DestinationPicker";
import { dayColor } from "../../../components/planner/dayColors";
import { useAuth } from "../../../context/AuthContext";
import { useI18n } from "../../../i18n/I18nContext";
import { planItinerary, savePlannedItinerary } from "../../../services/plannerService";
import { withRedirect } from "../../../utils/authRedirect";
import { formatDate, formatMoney, isoDateFromToday } from "../../../utils/formatters";
import { categoryLabel } from "../../../utils/landmarks";

const TripMap = lazy(() => import("../../../components/planner/TripMap"));
const HERO_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=2000&q=80";
const STORAGE_KEY = "tripnova.planner"; // form + bản nháp gần nhất (theo tab) — quay lại từ trang khác không mất
const INTERESTS = [
    { value: "culture", icon: "account_balance" },
    { value: "nature", icon: "forest" },
    { value: "beach", icon: "beach_access" },
    { value: "food", icon: "ramen_dining" },
    { value: "shopping", icon: "shopping_bag" },
    { value: "entertainment", icon: "attractions" },
    { value: "wellness", icon: "spa" },
];
const BUDGETS = ["budget", "mid", "luxury"];
const PACES = ["relaxed", "balanced", "packed"];
const RADII = [2, 5, 10, 20, 0]; // km tính từ nơi ở; 0 = không giới hạn
const KIND_ICONS = { hotel: "hotel", lunch: "lunch_dining", dinner: "dinner_dining" };
const HOTEL_COLOR = "#0f172a";

function defaultForm() {
    return {
        destination: null,
        startDate: isoDateFromToday(14),
        days: 3,
        partySize: 2,
        budget: "mid",
        pace: "balanced",
        interests: [],
        note: "",
        radiusKm: 10,
    };
}

function readStored() {
    try {
        return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function writeStored(value) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
        // bộ nhớ trình duyệt bị chặn: chỉ mất tính năng khôi phục
    }
}

/** Mỗi điểm dừng một khoá ổn định + số thứ tự điểm tham quan trong ngày (để vẽ ghim và đánh số dòng thời gian). */
function stopsOf(plan) {
    if (!plan) return [];
    const stops = [];
    plan.dayPlans.forEach((day) => {
        let n = 0;
        day.items.forEach((item, index) => {
            stops.push({
                key: `${day.dayNumber}-${index}`,
                day: day.dayNumber,
                index,
                kind: item.kind,
                label: item.kind === "sight" ? ++n : null,
                lat: item.latitude,
                lng: item.longitude,
                title: item.name || item.title,
                subtitle: item.startTime ? `${item.startTime.slice(0, 5)} – ${item.endTime?.slice(0, 5) || ""}` : null,
            });
        });
    });
    return stops;
}

function Segmented({ value, options, onChange, labelOf }) {
    return (
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-container-low p-1">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    aria-pressed={value === option}
                    className={`rounded-lg px-2 py-2 text-sm font-semibold transition-colors ${value === option ? "bg-white text-primary shadow" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                    {labelOf(option)}
                </button>
            ))}
        </div>
    );
}

const fieldLabel = "block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5";
const inputClass = "w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-3 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20";

/**
 * Lên lịch trình bằng AI: chọn điểm đến → BE chọn địa điểm thật theo toạ độ (chia ngày, khách sạn, quán ăn), AI viết;
 * xem trên bản đồ vệ tinh, bỏ điểm / đổi khách sạn rồi lưu thành lịch trình của tôi.
 */
function AiPlanner() {
    const { t, lang } = useI18n();
    const { isLoggedIn } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const stored = useMemo(readStored, []);
    const [form, setForm] = useState(() => {
        const initial = { ...defaultForm(), ...(stored.form || {}) };
        const id = searchParams.get("destinationId");
        // Cùng điểm đến với form đang nhớ thì giữ nguyên (đã có tên quốc gia).
        if (id && initial.destination?.id !== id) initial.destination = { id, name: searchParams.get("name") || "", countryName: null };
        if (!initial.startDate || initial.startDate < isoDateFromToday(0)) initial.startDate = isoDateFromToday(14);
        return initial;
    });
    // Mở từ trang điểm đến (?destinationId=) mà bản nháp đang nhớ là nơi khác → bỏ bản nháp cũ, bắt đầu từ form.
    const paramDestination = searchParams.get("destinationId");
    const staleDraft = Boolean(paramDestination && stored.plan && stored.plan.destinationId !== paramDestination);
    const [plan, setPlan] = useState(staleDraft ? null : stored.plan || null);
    const [variant, setVariant] = useState(staleDraft ? 0 : stored.variant || 0);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [visibleDay, setVisibleDay] = useState(0); // 0 = mọi ngày
    const [activeKey, setActiveKey] = useState(null);
    const resultRef = useRef(null);
    const formRef = useRef(null);
    const itemRefs = useRef({});

    useEffect(() => {
        writeStored({ form, plan, variant });
    }, [form, plan, variant]);

    useEffect(() => {
        if (!loading) return undefined;
        setLoadingStep(0);
        const timer = setInterval(() => setLoadingStep((s) => Math.min(s + 1, 2)), 1600);
        return () => clearInterval(timer);
    }, [loading]);

    const stops = useMemo(() => stopsOf(plan), [plan]);
    const mapStops = useMemo(() => {
        const shown = visibleDay ? stops.filter((s) => s.day === visibleDay) : stops;
        // Khách sạn chỉ nằm ở ngày 1 trong dữ liệu nhưng là điểm xuất phát mỗi ngày → luôn hiện.
        const hotel = stops.find((s) => s.kind === "hotel");
        return hotel && !shown.includes(hotel) ? [hotel, ...shown] : shown;
    }, [stops, visibleDay]);

    const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));
    const toggleInterest = (value) => update({
        interests: form.interests.includes(value) ? form.interests.filter((v) => v !== value) : [...form.interests, value],
    });

    const generate = async (nextVariant) => {
        if (!form.destination) {
            setError(t("planner.form.chooseDestination"));
            return;
        }
        setError("");
        setLoading(true);
        try {
            const result = await planItinerary({
                destinationId: form.destination.id,
                startDate: form.startDate,
                days: Number(form.days),
                partySize: Number(form.partySize),
                budget: form.budget,
                pace: form.pace,
                interests: form.interests,
                note: form.note.trim() || null,
                radiusKm: form.radiusKm || null,
                locale: lang === "vi" ? "vi" : "en",
                variant: nextVariant,
            });
            setPlan(result);
            setVariant(nextVariant);
            setVisibleDay(0);
            setActiveKey(null);
            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        generate(0);
    };

    /** Lưu bản nháp; `thenBook` → sang trang đặt trọn gói (khách sạn + xe) thay vì trang chi tiết. */
    const handleSave = async (thenBook = false) => {
        setSaving(true);
        setError("");
        try {
            const saved = await savePlannedItinerary(plan);
            navigate(thenBook ? `/trip-booking/${saved.id}` : `/itineraries/${saved.id}`);
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    const removeStop = (dayNumber, index) => {
        setPlan((prev) => {
            const removed = prev.dayPlans.find((d) => d.dayNumber === dayNumber).items[index];
            return {
                ...prev,
                estimatedTotal: Number(prev.estimatedTotal || 0) - Number(removed.estimatedCost || 0),
                dayPlans: prev.dayPlans.map((d) => (d.dayNumber === dayNumber ? { ...d, items: d.items.filter((_, i) => i !== index) } : d)),
            };
        });
        setActiveKey(null);
    };

    /** Đổi khách sạn: thay mục nhận phòng ngày 1 (giữ giờ), tính lại tổng chi phí. */
    const chooseHotel = (alt) => {
        setPlan((prev) => {
            const old = prev.hotel;
            return {
                ...prev,
                hotel: alt,
                hotelNote: null,
                hotelAlternatives: [old, ...prev.hotelAlternatives.filter((h) => h.entityId !== alt.entityId)].filter(Boolean),
                estimatedTotal: Number(prev.estimatedTotal || 0) - Number(old?.estimatedCost || 0) + Number(alt.estimatedCost || 0),
                dayPlans: prev.dayPlans.map((d) => ({
                    ...d,
                    items: d.items.map((item) => (item.kind === "hotel"
                        ? { ...alt, notes: null, startTime: item.startTime, endTime: item.endTime }
                        : item)),
                })),
            };
        });
    };

    /** Bấm ghim trên bản đồ: tô sáng mục tương ứng, cuộn tới nếu đang hiện. */
    const selectStop = (key) => {
        setActiveKey(key);
        itemRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    const loginLink = withRedirect("/login", `${location.pathname}${location.search}`);
    const loadingKeys = ["planner.loading.places", "planner.loading.cluster", "planner.loading.writing"];

    return (
        <main>
            <CatalogHero
                image={HERO_IMAGE}
                alt={t("planner.hero.imageAlt")}
                eyebrow={t("planner.hero.eyebrow")}
                title={t("planner.hero.title")}
                subtitle={t("planner.hero.subtitle")}
                heightClass="md:h-[540px]"
            >
                <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 backdrop-blur-md border border-white/30 px-4 py-2 text-sm font-bold text-white">
                    <span aria-hidden="true" className="material-symbols-outlined text-[18px]">satellite_alt</span>
                    {t("planner.hero.badge")}
                </span>
            </CatalogHero>

            <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
                <form ref={formRef} onSubmit={handleSubmit} className="relative z-10 -mt-8 md:-mt-16 rounded-2xl bg-white p-5 md:p-8 shadow-2xl border border-outline-variant/20 scroll-mt-24">
                    <h2 className="font-headline text-2xl font-extrabold text-on-surface mb-6">{t("planner.form.title")}</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-5">
                            <DestinationPicker value={form.destination} onChange={(destination) => update({ destination })} />
                        </div>
                        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-4 content-start">
                            <label className="block col-span-2 md:col-span-1">
                                <span className={fieldLabel}>{t("planner.form.startDate")}</span>
                                <input type="date" required min={isoDateFromToday(0)} value={form.startDate} onChange={(e) => update({ startDate: e.target.value })} className={inputClass} />
                            </label>
                            <label className="block">
                                <span className={fieldLabel}>{t("planner.form.days")}</span>
                                <select value={form.days} onChange={(e) => update({ days: Number(e.target.value) })} className={inputClass}>
                                    {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{t("planner.form.daysOption", { count: n })}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className={fieldLabel}>{t("planner.form.party")}</span>
                                <input type="number" min={1} max={20} required value={form.partySize} onChange={(e) => update({ partySize: e.target.value })} className={inputClass} />
                            </label>
                        </div>

                        <div className="lg:col-span-4">
                            <span className={fieldLabel}>{t("planner.form.budget")}</span>
                            <Segmented value={form.budget} options={BUDGETS} onChange={(budget) => update({ budget })} labelOf={(v) => t(`planner.form.budgetOptions.${v}`)} />
                        </div>
                        <div className="lg:col-span-4">
                            <span className={fieldLabel}>{t("planner.form.pace")}</span>
                            <Segmented value={form.pace} options={PACES} onChange={(pace) => update({ pace })} labelOf={(v) => t(`planner.form.paceOptions.${v}`)} />
                        </div>
                        <label className="block lg:col-span-4">
                            <span className={fieldLabel}>{t("planner.form.note")}</span>
                            <input type="text" maxLength={300} value={form.note} onChange={(e) => update({ note: e.target.value })} placeholder={t("planner.form.notePlaceholder")} className={inputClass} />
                        </label>

                        <div className="lg:col-span-12">
                            <span className={fieldLabel}>{t("planner.form.radius")}</span>
                            <div className="flex flex-wrap items-center gap-2">
                                {RADII.map((km) => (
                                    <button
                                        key={km}
                                        type="button"
                                        aria-pressed={form.radiusKm === km}
                                        onClick={() => update({ radiusKm: km })}
                                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${form.radiusKm === km ? "border-primary bg-primary text-white" : "border-outline-variant/50 text-on-surface hover:border-primary"}`}
                                    >
                                        {km ? t("planner.form.radiusKm", { km }) : t("planner.form.radiusAny")}
                                    </button>
                                ))}
                                <span className="text-xs text-on-surface-variant">{t("planner.form.radiusHint")}</span>
                            </div>
                        </div>

                        <div className="lg:col-span-12">
                            <span className={fieldLabel}>{t("planner.form.interests")}</span>
                            <div className="flex flex-wrap gap-2">
                                {INTERESTS.map(({ value, icon }) => {
                                    const on = form.interests.includes(value);
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            aria-pressed={on}
                                            onClick={() => toggleInterest(value)}
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${on ? "border-primary bg-primary text-white" : "border-outline-variant/50 text-on-surface hover:border-primary"}`}
                                        >
                                            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{icon}</span>
                                            {t(`planner.form.interestOptions.${value}`)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                        <p className="text-xs text-on-surface-variant max-w-xl">{t("planner.form.disclaimer")}</p>
                        {isLoggedIn ? (
                            <button type="submit" disabled={loading} className="primary-gradient text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-60">
                                <span className={`material-symbols-outlined ${loading ? "animate-spin" : ""}`}>{loading ? "progress_activity" : "auto_awesome"}</span>
                                {loading ? t("planner.form.generating") : t("planner.form.submit")}
                            </button>
                        ) : (
                            <Link to={loginLink} className="primary-gradient text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2">
                                <span aria-hidden="true" className="material-symbols-outlined">login</span>
                                {t("planner.form.loginToPlan")}
                            </Link>
                        )}
                    </div>
                    {error && <div className="mt-4"><FormAlert>{error}</FormAlert></div>}
                </form>

                {loading && (
                    <div className="my-10 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center" role="status">
                        <span aria-hidden="true" className="material-symbols-outlined text-5xl text-primary animate-pulse">travel_explore</span>
                        <ol className="mt-4 space-y-2 text-sm">
                            {loadingKeys.map((key, i) => (
                                <li key={key} className={`flex items-center justify-center gap-2 ${i <= loadingStep ? "text-on-surface font-semibold" : "text-on-surface-variant/60"}`}>
                                    <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{i < loadingStep ? "check_circle" : i === loadingStep ? "progress_activity" : "radio_button_unchecked"}</span>
                                    {t(key)}
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {plan && !loading && (
                    <section ref={resultRef} className="my-10 scroll-mt-24">
                        <PlanHeader
                            plan={plan}
                            saving={saving}
                            isLoggedIn={isLoggedIn}
                            onSave={() => handleSave(false)}
                            onBook={() => handleSave(true)}
                            onRegenerate={() => generate(variant + 1)}
                            onEdit={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                        />

                        <div className="mt-6 flex flex-wrap gap-2">
                            {[0, ...plan.dayPlans.map((d) => d.dayNumber)].map((day) => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => { setVisibleDay(day); setActiveKey(null); }}
                                    aria-pressed={visibleDay === day}
                                    className={`rounded-full px-4 py-2 text-sm font-bold border transition-colors ${visibleDay === day ? "bg-primary text-white border-primary" : "border-outline-variant/50 text-on-surface hover:border-primary"}`}
                                >
                                    {day > 0 && <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle" style={{ background: dayColor(day) }} />}
                                    {day === 0 ? t("planner.result.allDays") : t("planner.result.day", { day })}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
                                {plan.hotel && <HotelCard plan={plan} onChoose={chooseHotel} />}
                                {plan.dayPlans.filter((d) => !visibleDay || d.dayNumber === visibleDay).map((day) => (
                                    <DayTimeline
                                        key={day.dayNumber}
                                        day={day}
                                        plan={plan}
                                        stops={stops}
                                        activeKey={activeKey}
                                        itemRefs={itemRefs}
                                        onSelect={setActiveKey}
                                        onRemove={removeStop}
                                    />
                                ))}
                                {plan.tips?.length > 0 && (
                                    <div className="rounded-2xl bg-surface-container-low p-6">
                                        <h3 className="font-headline font-bold text-on-surface mb-3 flex items-center gap-2">
                                            <span aria-hidden="true" className="material-symbols-outlined text-primary">tips_and_updates</span>
                                            {t("planner.result.tips")}
                                        </h3>
                                        <ul className="space-y-2 text-sm text-on-surface-variant list-disc pl-5">
                                            {plan.tips.map((tip) => <li key={tip}>{tip}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="lg:col-span-7 order-1 lg:order-2 lg:sticky lg:top-24">
                                <Suspense fallback={<div className="h-[420px] lg:h-[calc(100vh-8rem)] rounded-2xl bg-surface-container-high animate-pulse" />}>
                                    <TripMap
                                        stops={mapStops}
                                        center={plan.centerLatitude != null ? [plan.centerLatitude, plan.centerLongitude] : null}
                                        activeKey={activeKey}
                                        onSelect={selectStop}
                                        radiusKm={plan.radiusKm}
                                        routed={isLoggedIn}
                                        className="h-[420px] lg:h-[calc(100vh-8rem)]"
                                    />
                                </Suspense>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}

function PlanHeader({ plan, saving, isLoggedIn, onSave, onBook, onRegenerate, onEdit }) {
    const { t } = useI18n();
    return (
        <div className="rounded-2xl bg-white p-6 md:p-8 shadow-lg border border-outline-variant/20">
            <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="min-w-0 max-w-3xl">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${plan.aiUsed ? "bg-violet-50 text-violet-700" : "bg-gray-100 text-gray-700"}`}>
                        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">{plan.aiUsed ? "auto_awesome" : "route"}</span>
                        {plan.aiUsed ? t("planner.result.aiBadge") : t("planner.result.fallbackBadge")}
                    </span>
                    <h2 className="mt-3 font-headline text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">{plan.title}</h2>
                    <p className="mt-2 text-sm text-on-surface-variant flex flex-wrap gap-x-5 gap-y-1">
                        <span className="inline-flex items-center gap-1"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">location_on</span>{plan.destinationName}{plan.countryName ? `, ${plan.countryName}` : ""}</span>
                        <span className="inline-flex items-center gap-1"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">calendar_month</span>{formatDate(plan.startDate)} – {formatDate(plan.endDate)}</span>
                        <span className="inline-flex items-center gap-1"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">group</span>{t("planner.result.travellers", { count: plan.partySize })}</span>
                        {plan.radiusKm && <span className="inline-flex items-center gap-1"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">radar</span>{t("planner.result.withinRadius", { km: plan.radiusKm })}</span>}
                        <span className="inline-flex items-center gap-1 font-semibold text-on-surface"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">payments</span>{t("planner.result.estimatedTotal", { amount: formatMoney(plan.estimatedTotal, "USD") })}</span>
                    </p>
                    {plan.summary && <p className="mt-4 text-on-surface leading-relaxed">{plan.summary}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={onEdit} className="px-4 py-2.5 rounded-xl text-sm font-bold border border-outline-variant/50 text-on-surface hover:bg-surface-container-low flex items-center gap-1.5">
                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">tune</span>{t("planner.result.editPreferences")}
                    </button>
                    {isLoggedIn && (
                        <button type="button" onClick={onRegenerate} className="px-4 py-2.5 rounded-xl text-sm font-bold border border-outline-variant/50 text-on-surface hover:bg-surface-container-low flex items-center gap-1.5">
                            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">refresh</span>{t("planner.result.regenerate")}
                        </button>
                    )}
                    {isLoggedIn && (
                        <button type="button" onClick={onSave} disabled={saving} className={`${plan.hotel ? "border border-primary text-primary hover:bg-primary/5" : "primary-gradient text-white"} px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 disabled:opacity-60`}>
                            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">bookmark_add</span>{saving ? t("planner.result.saving") : t("planner.result.save")}
                        </button>
                    )}
                    {isLoggedIn && plan.hotel && (
                        <button type="button" onClick={onBook} disabled={saving} className="primary-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 disabled:opacity-60">
                            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>{t("planner.result.bookThis")}
                        </button>
                    )}
                </div>
            </div>
            {plan.warnings?.length > 0 && (
                <ul className="mt-5 space-y-1.5">
                    {plan.warnings.map((w) => (
                        <li key={w} className="flex items-start gap-2 rounded-lg bg-amber-50 text-amber-800 px-3 py-2 text-sm">
                            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">info</span>
                            {t(`planner.warnings.${w}`, { defaultValue: w })}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function HotelCard({ plan, onChoose }) {
    const { t } = useI18n();
    const [showAlternatives, setShowAlternatives] = useState(false);
    const hotel = plan.hotel;
    return (
        <div className="rounded-2xl bg-white border border-outline-variant/20 shadow-sm overflow-hidden">
            <div className="flex gap-4 p-4">
                {hotel.coverImageUrl && <img src={hotel.coverImageUrl} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0" loading="lazy" />}
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t("planner.result.hotelTitle", { count: plan.days - 1 })}</p>
                    <Link to={`/hotel/${hotel.entityId}`} target="_blank" rel="noopener" className="font-headline font-bold text-lg text-on-surface hover:text-primary">{hotel.name}</Link>
                    <p className="text-sm text-on-surface-variant flex flex-wrap gap-x-3">
                        {hotel.starRating > 0 && <span className="text-amber-500">{"★".repeat(hotel.starRating)}</span>}
                        <span>{t("planner.result.perNight", { price: formatMoney(hotel.pricePerNight, "USD") })}</span>
                        {hotel.rating != null && <span>{t("planner.result.rating", { rating: hotel.rating, count: hotel.reviewCount })}</span>}
                    </p>
                    {plan.hotelNote && <p className="mt-1 text-sm text-on-surface">{plan.hotelNote}</p>}
                </div>
            </div>
            {plan.hotelAlternatives?.length > 0 && (
                <div className="border-t border-outline-variant/20 px-4 py-3">
                    <button type="button" onClick={() => setShowAlternatives((v) => !v)} className="text-sm font-bold text-primary flex items-center gap-1">
                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{showAlternatives ? "expand_less" : "swap_horiz"}</span>
                        {t("planner.result.alternatives", { count: plan.hotelAlternatives.length })}
                    </button>
                    {showAlternatives && (
                        <ul className="mt-3 space-y-2">
                            {plan.hotelAlternatives.map((alt) => (
                                <li key={alt.entityId} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-on-surface truncate">{alt.name}</p>
                                        <p className="text-xs text-on-surface-variant">
                                            {alt.starRating > 0 ? `${"★".repeat(alt.starRating)} · ` : ""}{t("planner.result.perNight", { price: formatMoney(alt.pricePerNight, "USD") })}
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => onChoose(alt)} className="shrink-0 rounded-lg border border-primary px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white">
                                        {t("planner.result.useHotel")}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

function DayTimeline({ day, plan, stops, activeKey, itemRefs, onSelect, onRemove }) {
    const { t } = useI18n();
    const color = dayColor(day.dayNumber);
    return (
        <article className="rounded-2xl bg-white border border-outline-variant/20 shadow-sm overflow-hidden">
            <header className="px-5 py-4 border-b border-outline-variant/20 flex items-start justify-between gap-3" style={{ borderTop: `4px solid ${color}` }}>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                        {t("planner.result.day", { day: day.dayNumber })} · {formatDate(day.date)}
                    </p>
                    <h3 className="font-headline font-bold text-lg text-on-surface">{day.theme}</h3>
                </div>
                {day.distanceKm > 0 && (
                    <span className="shrink-0 text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">route</span>{t("planner.result.distance", { km: day.distanceKm })}
                    </span>
                )}
            </header>
            <ol className="px-5 py-4">
                {day.items.map((item, index) => {
                    const stop = stops.find((s) => s.day === day.dayNumber && s.index === index);
                    const key = stop?.key ?? `${day.dayNumber}-${index}`;
                    const active = key === activeKey;
                    const hasPoint = item.latitude != null;
                    const link = item.entityType === "hotel" ? `/hotel/${item.entityId}`
                        : item.entityId ? `/destinations/${plan.destinationId}/landmarks/${item.entityId}` : null;
                    return (
                        <li key={key} ref={(el) => { itemRefs.current[key] = el; }}>
                            {item.travelMinutes != null && index > 0 && (
                                <p className="ml-4 border-l-2 border-dashed border-outline-variant/60 pl-6 py-1.5 text-xs text-on-surface-variant flex items-center gap-1">
                                    <span aria-hidden="true" className="material-symbols-outlined text-[16px]">{item.travelMode === "walk" ? "directions_walk" : "directions_car"}</span>
                                    {item.distanceKm == null
                                        ? t("planner.result.travelNoKm", { minutes: item.travelMinutes })
                                        : t(item.travelMode === "walk" ? "planner.result.travelWalk" : item.travelMode === "drive" ? "planner.result.travelDrive" : "planner.result.travel", { minutes: item.travelMinutes, km: item.distanceKm })}
                                </p>
                            )}
                            <div
                                role={hasPoint ? "button" : undefined}
                                tabIndex={hasPoint ? 0 : undefined}
                                onClick={hasPoint ? () => onSelect(key) : undefined}
                                onKeyDown={hasPoint ? (e) => { if (e.key === "Enter") onSelect(key); } : undefined}
                                className={`flex gap-3 rounded-xl p-2 -mx-2 transition-colors ${hasPoint ? "cursor-pointer" : ""} ${active ? "bg-primary/5 ring-2 ring-primary/30" : hasPoint ? "hover:bg-surface-container-low" : ""}`}
                            >
                                <span
                                    className="mt-0.5 w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                    style={{ background: item.kind === "hotel" ? HOTEL_COLOR : color }}
                                >
                                    {KIND_ICONS[item.kind]
                                        ? <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{KIND_ICONS[item.kind]}</span>
                                        : stop?.label}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-on-surface-variant">
                                        {item.startTime?.slice(0, 5)}{item.endTime ? ` – ${item.endTime.slice(0, 5)}` : ""}
                                        {item.kind === "sight" && item.category && <span className="ml-2">· {categoryLabel(t, item.category)}</span>}
                                    </p>
                                    <p className="font-semibold text-on-surface leading-snug">{item.title}</p>
                                    {item.notes && <p className="mt-0.5 text-sm text-on-surface-variant">{item.notes}</p>}
                                    {item.mayBeClosed && (
                                        <p className="mt-1 text-xs font-semibold text-amber-700 flex items-center gap-1">
                                            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">schedule</span>
                                            {t("planner.result.mayBeClosed", { hours: item.openingHours })}
                                        </p>
                                    )}
                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                                        {item.estimatedCost != null && item.kind !== "hotel" && (
                                            <span className="font-semibold text-on-surface">{formatMoney(item.estimatedCost, "USD")}</span>
                                        )}
                                        {link && (
                                            <Link to={link} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} className="font-bold text-primary hover:underline">
                                                {t("planner.result.viewPlace")}
                                            </Link>
                                        )}
                                        {!hasPoint && item.entityId && <span className="text-on-surface-variant">{t("planner.result.noPin")}</span>}
                                    </div>
                                </div>
                                {item.coverImageUrl && <img src={item.coverImageUrl} alt="" loading="lazy" className="hidden sm:block w-20 h-16 rounded-lg object-cover shrink-0" />}
                                {item.kind !== "hotel" && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onRemove(day.dayNumber, index); }}
                                        aria-label={t("planner.result.removeStop", { title: item.title })}
                                        title={t("planner.result.removeStop", { title: item.title })}
                                        className="self-start text-on-surface-variant opacity-60 hover:opacity-100 hover:text-error"
                                    >
                                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </article>
    );
}

export default AiPlanner;
