import { useEffect, useRef, useState } from "react";
import { toSlug } from "../../constants/rooms";
import { fetchAmenities } from "../../services/lookupService";
import { useT } from "../../i18n/I18nContext";
import { displayCurrency } from "../../utils/currency";

const defaultFilters = {
  checkIn: "",
  checkOut: "",
  maxGuests: 2,
  minPrice: "",
  maxPrice: "",
  roomTypeIds: [],
  amenityIds: [],
};

function CheckboxList({ title, items, selectedIds, onToggle }) {
  const t = useT();
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface mb-6">
        {title}
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded border border-outline-variant group-hover:border-primary transition-colors flex items-center justify-center shrink-0 ${
                selectedIds.includes(item.id) ? "bg-primary text-on-primary" : ""
              }`}
            >
              {selectedIds.includes(item.id) && (
                <span className="material-symbols-outlined text-xs">check</span>
              )}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={selectedIds.includes(item.id)}
              onChange={() => onToggle(item.id)}
            />
            <span className="text-sm text-on-surface-variant">{item.label ?? t(`hotels.amenities.${item.id}`, { defaultValue: item.name })}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Danh mục tiện nghi từ API, tải 1 lần cho cả phiên (id = slug tên, khớp filterRooms + khoá i18n hotels.amenities.*)
let amenityRequest = null;

function useAmenityOptions() {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    let cancelled = false;
    amenityRequest =
      amenityRequest ||
      fetchAmenities()
        .then((list) => (Array.isArray(list) ? list : []).map((a) => ({ id: toSlug(a.name), name: a.name })))
        .catch((err) => {
          amenityRequest = null; // lỗi mạng → lần sau thử lại
          throw err;
        });
    amenityRequest.then((list) => !cancelled && setOptions(list)).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return options;
}

// Chiều cao vùng thanh tìm kiếm cố định (bottom-8 + thanh); phần đệm pb-44 phía trên mốc đủ chứa nó.
const FIXED_BAR_ZONE = 160;

// true khi mốc (cuối danh sách phòng) đã lên trên vùng thanh cố định → nội dung bên dưới
// (review, footer) sẽ bị che, thanh phải nhường chỗ. Dùng scroll/resize thay vì IntersectionObserver
// vì observer không báo khi nhảy cuộn qua hẳn mốc (phím Home, link #rooms).
function usePassedEnd(ref) {
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (el) setPassed(el.getBoundingClientRect().top < window.innerHeight - FIXED_BAR_ZONE);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Danh sách phòng đổi chiều cao (lọc, đổi ngày) mà không cuộn
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    resizeObserver?.observe(document.body);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resizeObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ref]);
  return passed;
}

function RoomSearchBar({ draft, setDraft, onSearch, onReset, showReset, fixed, hidden = false }) {
  const t = useT();
  // Giá nhập theo tiền hiển thị: VND (tiếng Việt) bước 50.000, USD bước 10
  const priceStep = displayCurrency() === "VND" ? "50000" : "10";
  const rowLayout = fixed
    ? "flex flex-row items-end gap-3 min-w-0"
    : "flex flex-col lg:flex-row lg:items-end gap-4";

  const bar = (
    <div
      className={
        fixed
          ? "bg-white/95 backdrop-blur-xl border border-gray-200 p-4 md:p-5 rounded-2xl shadow-2xl overflow-x-auto"
          : "bg-white p-4 md:p-6 rounded-2xl shadow-2xl shadow-blue-900/10 border border-gray-100"
      }
    >
      <div className={rowLayout}>
        <div className={`${fixed ? "min-w-[9.5rem] shrink-0" : "flex-1 min-w-0"} space-y-2`}>
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">
            {t("common.fields.checkIn")}
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              calendar_month
            </span>
            <input
              type="date"
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-0 focus:border-b-2 focus:border-primary-fixed-dim"
              value={draft.checkIn}
              onChange={(e) => setDraft({ ...draft, checkIn: e.target.value })}
            />
          </div>
        </div>

        <div className={`${fixed ? "min-w-[9.5rem] shrink-0" : "flex-1 min-w-0"} space-y-2`}>
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">
            {t("common.fields.checkOut")}
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              calendar_today
            </span>
            <input
              type="date"
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-0 focus:border-b-2 focus:border-primary-fixed-dim"
              value={draft.checkOut}
              min={draft.checkIn || undefined}
              onChange={(e) => setDraft({ ...draft, checkOut: e.target.value })}
            />
          </div>
        </div>

        <div className={`${fixed ? "min-w-[6.5rem] shrink-0" : "flex-1 min-w-0 lg:max-w-[7rem]"} space-y-2`}>
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">
            {t("hotels.filters.maxGuests")}
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              group
            </span>
            <input
              type="number"
              min="1"
              max="12"
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-0 focus:border-b-2 focus:border-primary-fixed-dim"
              value={draft.maxGuests}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  maxGuests: Math.max(1, parseInt(e.target.value, 10) || 1),
                })
              }
            />
          </div>
        </div>

        <div className={`${fixed ? "min-w-[6.5rem] shrink-0" : "flex-1 min-w-0 lg:max-w-[8rem]"} space-y-2`}>
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">
            {t("hotels.filters.minPrice")}
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              payments
            </span>
            <input
              type="number"
              min="0"
              step={priceStep}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-0 focus:border-b-2 focus:border-primary-fixed-dim placeholder:text-outline"
              value={draft.minPrice}
              onChange={(e) => setDraft({ ...draft, minPrice: e.target.value })}
            />
          </div>
        </div>

        <div className={`${fixed ? "min-w-[6.5rem] shrink-0" : "flex-1 min-w-0 lg:max-w-[8rem]"} space-y-2`}>
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">
            {t("hotels.filters.maxPrice")}
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              sell
            </span>
            <input
              type="number"
              min="0"
              step={priceStep}
              placeholder={t("hotels.filters.any")}
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-0 focus:border-b-2 focus:border-primary-fixed-dim placeholder:text-outline"
              value={draft.maxPrice}
              onChange={(e) => setDraft({ ...draft, maxPrice: e.target.value })}
            />
          </div>
        </div>

        <div className={`flex gap-2 shrink-0 ${fixed ? "" : "w-full lg:w-auto"}`}>
          <button
            type="button"
            onClick={onSearch}
            className={`bg-primary text-on-primary px-6 lg:px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-all whitespace-nowrap ${fixed ? "h-[46px]" : "flex-1 lg:flex-none"}`}
          >
            <span className="material-symbols-outlined">search</span>
            <span className="hidden sm:inline">{t("hotels.actions.searchRooms")}</span>
            <span className="sm:hidden">{t("common.actions.search")}</span>
          </button>
          {showReset && (
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-3 rounded-lg border border-outline-variant text-on-surface-variant text-sm font-semibold hover:bg-surface-container-low transition-colors h-[46px] lg:h-auto whitespace-nowrap"
            >
              {t("common.actions.reset")}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (fixed) {
    return (
      <div
        aria-hidden={hidden}
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-300 ${
          hidden ? "opacity-0 translate-y-8 pointer-events-none" : "opacity-100"
        }`}
      >
        {bar}
      </div>
    );
  }

  return bar;
}

function RoomSearchPanel({
  title,
  subtitle,
  onSearch,
  initialFilters = {},
  compact = false,
  showSidebar = true,
  searchBarPosition = "bottom",
  roomTypeOptions = [],
  children,
}) {
  const t = useT();
  const amenityOptions = useAmenityOptions();
  const endRef = useRef(null);
  const passedEnd = usePassedEnd(endRef);
  const [draft, setDraft] = useState({ ...defaultFilters, ...initialFilters });
  const [applied, setApplied] = useState({ ...defaultFilters, ...initialFilters });

  const toggleInList = (key, id) => {
    setDraft((prev) => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
      };
    });
  };

  const handleSearch = () => {
    setApplied(draft);
    onSearch?.(draft);
  };

  const handleReset = () => {
    const reset = { ...defaultFilters, ...initialFilters };
    setDraft(reset);
    setApplied(reset);
    onSearch?.(reset);
  };

  const hasActiveFilters =
    applied.roomTypeIds.length > 0 ||
    applied.amenityIds.length > 0 ||
    applied.checkIn ||
    applied.checkOut ||
    applied.maxGuests > defaultFilters.maxGuests ||
    applied.minPrice !== "" ||
    applied.maxPrice !== "";

  const showTopBar = searchBarPosition === "top";
  const showBottomBar = searchBarPosition === "bottom";

  return (
    <>
      {!compact && (
        <section className="bg-surface-container-low py-16 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 text-center md:text-left">
              <span className="text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-3 block">
                {subtitle || t("hotels.rooms.defaultSubtitle")}
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight leading-tight">
                {title || t("hotels.rooms.defaultTitle")}
              </h2>
            </div>
            {showTopBar && (
              <RoomSearchBar
                draft={draft}
                setDraft={setDraft}
                onSearch={handleSearch}
                onReset={handleReset}
                showReset={hasActiveFilters}
                fixed={false}
              />
            )}
          </div>
        </section>
      )}

      {compact && (
        <div className="mb-10">
          <span className="text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-3 block">
            {subtitle || t("hotels.rooms.defaultSubtitle")}
          </span>
          <h2 className="text-3xl font-headline font-bold text-primary tracking-tight">{title || t("hotels.rooms.defaultTitle")}</h2>
        </div>
      )}

      <section
        className={
          compact
            ? `flex flex-col lg:flex-row gap-10 ${showBottomBar ? "pb-44" : ""}`
            : `max-w-7xl mx-auto px-8 py-16 flex flex-col lg:flex-row gap-12 ${showBottomBar ? "pb-44" : ""}`
        }
      >
        {showSidebar && (
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-10">
            {roomTypeOptions.length > 0 && (
              <CheckboxList
                title={t("hotels.filters.roomType")}
                items={roomTypeOptions}
                selectedIds={draft.roomTypeIds}
                onToggle={(id) => toggleInList("roomTypeIds", id)}
              />
            )}
            <CheckboxList
              title={t("hotels.filters.amenities")}
              items={amenityOptions}
              selectedIds={draft.amenityIds}
              onToggle={(id) => toggleInList("amenityIds", id)}
            />
            <button
              type="button"
              onClick={handleSearch}
              className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold text-sm hover:bg-primary-container transition-colors"
            >
              {t("hotels.actions.applyFilters")}
            </button>
          </aside>
        )}

        <div className="flex-grow min-w-0">{children?.(applied, draft, handleSearch)}</div>
      </section>
      <div ref={endRef} aria-hidden="true" />

      {showBottomBar && (
        <RoomSearchBar
          draft={draft}
          setDraft={setDraft}
          onSearch={handleSearch}
          onReset={handleReset}
          showReset={hasActiveFilters}
          fixed
          hidden={passedEnd}
        />
      )}
    </>
  );
}

export default RoomSearchPanel;
