import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDestinationPage } from "../../services/destinationService";
import { useT } from "../../i18n/I18nContext";

const PAGE_SIZE = 12;
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80";

/**
 * Danh sách điểm đến thật trong DB (trang /destinations, dưới phần biên tập tĩnh).
 * Lọc theo quốc gia / tên từ form tìm kiếm, nhóm (chip coastal/historical/... của trang) + nút "Nổi bật"; tải thêm từng trang 12 mục.
 */
function DestinationDirectory({ countryCode = "", query = "", category = "all" }) {
    const t = useT();
    const [popularOnly, setPopularOnly] = useState(false);
    const [page, setPage] = useState(1);
    const [state, setState] = useState({ loading: true, items: [], total: 0, error: false });

    // đổi bộ lọc → về trang 1
    useEffect(() => setPage(1), [countryCode, query, category, popularOnly]);

    useEffect(() => {
        let cancelled = false;
        setState((s) => ({ ...s, loading: true, error: false, ...(page === 1 ? { items: [] } : {}) }));
        fetchDestinationPage({ q: query, countryCode, category, isPopular: popularOnly, page, limit: PAGE_SIZE })
            .then(({ items, total }) => {
                if (!cancelled) setState((s) => ({ loading: false, error: false, total, items: page === 1 ? items : [...s.items, ...items] }));
            })
            .catch(() => !cancelled && setState((s) => ({ ...s, loading: false, error: true })));
        return () => {
            cancelled = true;
        };
    }, [countryCode, query, category, popularOnly, page]);

    const chip = (active) =>
        active
            ? "bg-primary text-white px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase"
            : "bg-surface-container-lowest border border-outline-variant/15 text-on-surface-variant px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-surface-container-low transition-colors";

    return (
        <section className="max-w-7xl mx-auto px-8 mt-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h2 className="font-headline text-4xl font-extrabold tracking-tight text-primary mb-2">{t("destinations.directory.title")}</h2>
                    <p className="text-on-surface-variant">
                        {state.loading && state.items.length === 0 ? t("destinations.directory.subtitle") : t("destinations.directory.count", { n: state.total.toLocaleString() })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button type="button" className={chip(!popularOnly)} onClick={() => setPopularOnly(false)}>
                        {t("destinations.directory.all")}
                    </button>
                    <button type="button" className={chip(popularOnly)} onClick={() => setPopularOnly(true)}>
                        {t("destinations.directory.popularOnly")}
                    </button>
                </div>
            </div>

            {state.error ? (
                <p className="text-on-surface-variant">{t("destinations.directory.error")}</p>
            ) : !state.loading && state.items.length === 0 ? (
                <p className="text-on-surface-variant">{t("destinations.directory.empty")}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {state.items.map((d) => (
                        <Link
                            key={d.id}
                            to={`/destinations/${d.id}`}
                            className="group bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm flex flex-col"
                        >
                            <div className="relative h-44 overflow-hidden">
                                <img
                                    src={d.coverImageUrl || FALLBACK_IMAGE}
                                    alt={d.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {d.isPopular && (
                                    <span className="absolute top-3 left-3 bg-tertiary-fixed text-on-tertiary-fixed px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                                        {t("destinations.directory.popularOnly")}
                                    </span>
                                )}
                            </div>
                            <div className="p-5 flex flex-col gap-1 flex-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                    {[d.countryName, d.continentName].filter(Boolean).join(" · ")}
                                </span>
                                <h3 className="font-headline text-lg font-bold text-primary group-hover:underline">{d.name}</h3>
                                {d.description && <p className="text-sm text-on-surface-variant line-clamp-2">{d.description}</p>}
                            </div>
                        </Link>
                    ))}
                    {state.loading &&
                        Array.from({ length: 4 }, (_, i) => <div key={`s${i}`} className="h-72 rounded-xl bg-surface-container-high animate-pulse" />)}
                </div>
            )}

            {!state.loading && state.items.length < state.total && (
                <div className="mt-10 text-center">
                    <button
                        type="button"
                        onClick={() => setPage((p) => p + 1)}
                        className="px-8 py-3 rounded-lg border border-outline-variant font-bold text-primary hover:bg-surface-container-high"
                    >
                        {t("destinations.directory.loadMore", { n: Math.min(PAGE_SIZE, state.total - state.items.length) })}
                    </button>
                </div>
            )}
        </section>
    );
}

export default DestinationDirectory;
