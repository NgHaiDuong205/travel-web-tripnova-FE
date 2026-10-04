import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDestinationPage } from "../../services/destinationService";
import { fetchHotels } from "../../services/hotelService";
import { fetchRatingSummary } from "../../services/postService";
import { useT } from "../../i18n/I18nContext";

const COUNT = 6;
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80";

/** Số thứ tự ngày trong năm → mỗi ngày một nhóm điểm đến nổi bật khác nhau, ổn định trong ngày. */
function dayIndex() {
    const now = new Date();
    return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
}

/** Lỗi phụ (đếm khách sạn / điểm review) không làm hỏng thẻ. */
const quiet = (promise) => promise.catch(() => null);

async function loadShortlist() {
    const first = await fetchDestinationPage({ isPopular: true, page: 1, limit: COUNT });
    const pages = Math.max(1, Math.ceil(first.total / COUNT));
    const page = (dayIndex() % pages) + 1;
    const { items } = page === 1 ? first : await fetchDestinationPage({ isPopular: true, page, limit: COUNT });
    return Promise.all(
        items.map(async (d) => {
            const [hotels, rating] = await Promise.all([
                quiet(fetchHotels({ destinationId: d.id, page: 1, limit: 1 })),
                quiet(fetchRatingSummary("destination", d.id)),
            ]);
            return { ...d, hotelCount: hotels?.total ?? null, rating: rating?.totalReviews > 0 ? rating : null };
        })
    );
}

/** "Top Destinations" trang chủ: điểm đến nổi bật thật trong DB (ảnh, quốc gia, số khách sạn, điểm review). */
function HomeTopDestinations() {
    const t = useT();
    const [state, setState] = useState({ loading: true, items: [] });

    useEffect(() => {
        let cancelled = false;
        loadShortlist()
            .then((items) => !cancelled && setState({ loading: false, items }))
            .catch(() => !cancelled && setState({ loading: false, items: [] }));
        return () => {
            cancelled = true;
        };
    }, []);

    if (state.loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: COUNT }, (_, i) => (
                    <div key={i} className="h-[26rem] rounded-xl bg-surface-container-high animate-pulse" />
                ))}
            </div>
        );
    }
    if (state.items.length === 0) {
        return (
            <p className="text-center text-on-surface-variant">
                <Link to="/destinations" className="text-primary font-bold hover:underline">{t("home.destinations.viewAll")}</Link>
            </p>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {state.items.map((d) => (
                    <Link
                        key={d.id}
                        to={`/destinations/${d.id}`}
                        className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 block"
                    >
                        <div className="relative h-72 overflow-hidden">
                            <img
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                alt={d.name}
                                loading="lazy"
                                src={d.coverImageUrl || FALLBACK_IMAGE}
                            />
                            {d.rating && (
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1">
                                    <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="text-xs font-bold font-headline text-on-surface">{Number(d.rating.averageRating).toFixed(1)}</span>
                                    <span className="text-[10px] text-on-surface-variant">({d.rating.totalReviews})</span>
                                </div>
                            )}
                        </div>
                        <div className="p-8">
                            <span className="text-[10px] font-extrabold text-primary tracking-widest uppercase mb-2 block">
                                {[d.countryName, d.continentName].filter(Boolean).join(" · ")}
                            </span>
                            <h3 className="text-2xl font-headline font-bold mb-2">{d.name}</h3>
                            {d.description && <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">{d.description}</p>}
                            <div className="flex justify-between items-center">
                                <span className="text-on-surface-variant text-sm">
                                    {d.hotelCount != null && (
                                        <>
                                            <span className="font-bold text-on-surface text-lg">{d.hotelCount.toLocaleString()}</span>{" "}
                                            {t("home.destinations.hotels")}
                                        </>
                                    )}
                                </span>
                                <span className="text-primary font-bold text-sm group-hover:underline underline-offset-4">{t("home.destinations.explore")}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="mt-12 text-center">
                <Link to="/destinations" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
                    {t("home.destinations.viewAll")}
                    <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
            </div>
        </>
    );
}

export default HomeTopDestinations;
