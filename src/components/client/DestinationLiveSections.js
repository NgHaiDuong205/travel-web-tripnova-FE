import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HotelListCard from "./HotelListCard";
import ReviewSection from "./ReviewSection";
import { fetchHotels } from "../../services/hotelService";
import { fetchTours } from "../../services/tourService";
import { fetchDestinationLandmarks } from "../../services/destinationService";
import { useT } from "../../i18n/I18nContext";
import { formatMoney } from "../../utils/formatters";
import { osmLink } from "../../utils/geo";
import { categoryLabel, landmarkPath } from "../../utils/landmarks";

const PREVIEW_LIMIT = 3;
const TOUR_PLACEHOLDER = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80";

/** Tải danh sách, lỗi thì coi như rỗng (một khối lỗi không làm hỏng cả trang). */
function useLoad(loader, deps) {
    const [state, setState] = useState({ loading: true, items: [], total: 0 });
    useEffect(() => {
        let cancelled = false;
        setState({ loading: true, items: [], total: 0 });
        loader()
            .then((res) => !cancelled && setState({ loading: false, ...res }))
            .catch(() => !cancelled && setState({ loading: false, items: [], total: 0 }));
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return state;
}

function SectionHeader({ title, subtitle, linkTo, linkLabel }) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
                <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-2">{title}</h2>
                {subtitle && <p className="text-on-surface-variant max-w-md">{subtitle}</p>}
            </div>
            {linkTo && (
                <Link to={linkTo} className="flex items-center space-x-2 text-primary font-bold group">
                    <span>{linkLabel}</span>
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                </Link>
            )}
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            {Array.from({ length: PREVIEW_LIMIT }, (_, i) => (
                <div key={i} className="h-80 rounded-xl bg-surface-container-high" />
            ))}
        </div>
    );
}

function TourMiniCard({ tour }) {
    const t = useT();
    return (
        <Link
            to={`/tours/${tour.id}`}
            className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
        >
            <div className="relative h-56 overflow-hidden">
                <img
                    src={tour.coverImageUrl || TOUR_PLACEHOLDER}
                    alt={tour.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
            </div>
            <div className="p-6 flex flex-col flex-1">
                <h3 className="font-headline text-xl font-bold text-on-surface group-hover:text-primary transition-colors mb-2">{tour.name}</h3>
                <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">{tour.description}</p>
                <div className="mt-auto flex items-end justify-between pt-4 border-t border-outline-variant/20">
                    <span className="flex items-center gap-1 text-sm font-bold text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        {t("common.units.day", { count: tour.durationDays })}
                    </span>
                    <span className="font-headline text-xl font-black text-primary">{formatMoney(tour.priceAdult, tour.currencyCode)}</span>
                </div>
            </div>
        </Link>
    );
}

const LANDMARK_PAGE = 9;
function LandmarkCard({ lm }) {
    const t = useT();
    const navigate = useNavigate();
    const hasCoords = lm.latitude != null && lm.longitude != null;
    // cả thẻ bấm được (sang trang chi tiết); tiêu đề là Link thật cho bàn phím / mở tab mới
    return (
        <article
            onClick={() => navigate(landmarkPath(lm))}
            className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 flex flex-col cursor-pointer group hover:shadow-xl transition-shadow"
        >
            {lm.coverImageUrl && (
                <div className="h-48 overflow-hidden">
                    <img src={lm.coverImageUrl} alt={lm.name} loading="lazy" className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
            )}
            <div className="p-6 flex flex-col gap-2 flex-1">
                {lm.category && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{categoryLabel(t, lm.category)}</span>
                )}
                <h3 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary">
                    <Link to={landmarkPath(lm)} onClick={(e) => e.stopPropagation()}>{lm.name}</Link>
                </h3>
                {lm.description && <p className="text-sm text-on-surface-variant line-clamp-3">{lm.description}</p>}
                {lm.address && (
                    <p className="flex items-start gap-1 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span className="line-clamp-2">{lm.address}</span>
                    </p>
                )}
                <div className="mt-auto pt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant">
                    {lm.openingHours && (
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            {lm.openingHours}
                        </span>
                    )}
                    {lm.entryFee != null && (
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                            {Number(lm.entryFee) > 0 ? formatMoney(lm.entryFee) : t("destinations.live.freeEntry")}
                        </span>
                    )}
                    {hasCoords && (
                        <a
                            href={osmLink(lm.latitude, lm.longitude)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 font-bold text-primary hover:underline"
                        >
                            <span className="material-symbols-outlined text-[16px]">map</span>
                            {t("destinations.live.viewMap")}
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}

/** Lưới địa danh: lọc theo loại (chỉ loại có dữ liệu, nhiều trước) + "xem thêm" từng trang 9 mục. */
function LandmarkGrid({ items }) {
    const t = useT();
    const [category, setCategory] = useState("all");
    const [visible, setVisible] = useState(LANDMARK_PAGE);
    const counts = items.reduce((acc, lm) => ({ ...acc, [lm.category]: (acc[lm.category] || 0) + 1 }), {});
    const categories = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    const filtered = category === "all" ? items : items.filter((lm) => lm.category === category);
    const choose = (c) => {
        setCategory(c);
        setVisible(LANDMARK_PAGE);
    };
    const chip = (active) =>
        `px-4 py-2 rounded-full text-sm font-bold transition-colors ${active ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"}`;

    return (
        <>
            {categories.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-8">
                    <button type="button" className={chip(category === "all")} onClick={() => choose("all")}>
                        {t("destinations.live.allCategories")} ({items.length})
                    </button>
                    {categories.map((c) => (
                        <button key={c} type="button" className={chip(category === c)} onClick={() => choose(c)}>
                            {categoryLabel(t, c)} ({counts[c]})
                        </button>
                    ))}
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.slice(0, visible).map((lm) => (
                    <LandmarkCard key={lm.id} lm={lm} />
                ))}
            </div>
            {filtered.length > visible && (
                <div className="mt-10 text-center">
                    <button
                        type="button"
                        onClick={() => setVisible((v) => v + LANDMARK_PAGE)}
                        className="px-6 py-3 rounded-lg border border-outline-variant font-bold text-primary hover:bg-surface-container-high"
                    >
                        {t("destinations.live.showMore", { n: Math.min(LANDMARK_PAGE, filtered.length - visible) })}
                    </button>
                </div>
            )}
        </>
    );
}

/**
 * Các khối dữ liệu thật của một điểm đến (DestinationDTO): địa danh, khách sạn, tour, đánh giá.
 * `showLandmarks=false` khi trang đã có phần "trải nghiệm" biên tập riêng.
 */
function DestinationLiveSections({ destination, showLandmarks = true }) {
    const t = useT();
    const id = destination.id;
    const name = destination.name;

    const hotels = useLoad(
        () => fetchHotels({ destinationId: id, page: 1, limit: PREVIEW_LIMIT }).then((r) => ({ items: r.items, total: r.total })),
        [id]
    );
    const tours = useLoad(() => fetchTours({ destinationId: id, page: 1, limit: PREVIEW_LIMIT }), [id]);
    const landmarks = useLoad(
        () => (showLandmarks ? fetchDestinationLandmarks(id).then((items) => ({ items, total: items.length })) : Promise.resolve({ items: [], total: 0 })),
        [id, showLandmarks]
    );

    return (
        <>
            {showLandmarks && (landmarks.loading || landmarks.items.length > 0) && (
                <section className="py-24 bg-surface-container-low">
                    <div className="max-w-7xl mx-auto px-8">
                        <SectionHeader title={t("destinations.live.landmarksTitle")} subtitle={t("destinations.live.landmarksSubtitle", { name })} />
                        {landmarks.loading ? <SkeletonGrid /> : <LandmarkGrid items={landmarks.items} />}
                    </div>
                </section>
            )}

            <section className="py-24 bg-surface">
                <div className="max-w-7xl mx-auto px-8">
                    <SectionHeader
                        title={t("destinations.live.hotelsTitle", { name })}
                        subtitle={t("destinations.detail.staysDescription")}
                        linkTo={hotels.total > PREVIEW_LIMIT ? `/search?type=hotel&q=${encodeURIComponent(name)}` : null}
                        linkLabel={t("destinations.live.viewAllHotels", { count: hotels.total })}
                    />
                    {hotels.loading ? (
                        <SkeletonGrid />
                    ) : hotels.items.length === 0 ? (
                        <p className="text-on-surface-variant">{t("destinations.live.noHotels")}</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {hotels.items.map((hotel) => (
                                <HotelListCard key={hotel.id} hotel={hotel} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {(tours.loading || tours.items.length > 0) && (
                <section className="py-24 bg-surface-container-low">
                    <div className="max-w-7xl mx-auto px-8">
                        <SectionHeader
                            title={t("destinations.live.toursTitle", { name })}
                            linkTo={tours.total > PREVIEW_LIMIT ? `/search?type=tour&q=${encodeURIComponent(name)}` : null}
                            linkLabel={t("destinations.live.viewAllTours", { count: tours.total })}
                        />
                        {tours.loading ? (
                            <SkeletonGrid />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {tours.items.map((tour) => (
                                    <TourMiniCard key={tour.id} tour={tour} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            <ReviewSection entityType="destination" entityId={id} title={t("destinations.live.reviewsTitle")} />
        </>
    );
}

export default DestinationLiveSections;
