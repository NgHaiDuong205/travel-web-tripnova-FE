import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SearchPanel from "../../../components/catalog/SearchPanel";
import SearchField, { fieldInputClass } from "../../../components/catalog/SearchField";
import ListHeader from "../../../components/catalog/ListHeader";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import { DURATION_FILTERS, TOUR_SORTS, fetchTours } from "../../../services/tourService";
import { formatDate, formatMoney } from "../../../utils/formatters";

const PAGE_SIZE = 9;
const HERO_IMAGE = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800&q=80";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80";

/** Thẻ tour theo TOUR.HTML (ảnh, nhãn, thời lượng, giá "Starting from"). */
function TourCard({ tour }) {
    const link = `/tours/${tour.id}`;
    return (
        <article className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col">
            <Link to={link} className="relative h-64 overflow-hidden block">
                <img
                    src={tour.coverImageUrl || PLACEHOLDER_IMAGE}
                    alt={tour.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {tour.highlights?.[0] && (
                    <span className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        {tour.highlights[0]}
                    </span>
                )}
                {tour.departureDate && (
                    <span className="absolute top-4 right-4 editorial-gradient text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        Departs {formatDate(tour.departureDate)}
                    </span>
                )}
            </Link>
            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-headline text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
                        <Link to={link}>{tour.name}</Link>
                    </h3>
                </div>
                {tour.destinationName && (
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {[tour.destinationName, tour.countryName].filter(Boolean).join(", ")}
                    </p>
                )}
                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-6">{tour.description}</p>
                <div className="mt-auto flex items-end justify-between pt-4 border-t border-outline-variant/20">
                    <span className="flex items-center gap-1 text-sm font-bold text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        {tour.durationDays} Day{tour.durationDays === 1 ? "" : "s"}
                        {tour.durationNights ? ` / ${tour.durationNights} Night${tour.durationNights === 1 ? "" : "s"}` : ""}
                    </span>
                    <div className="text-right">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                            Starting from
                        </span>
                        <span className="font-headline text-2xl font-black text-primary">
                            {formatMoney(tour.priceAdult, tour.currencyCode)}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}

/** Danh sách tour: hero biên tập + thanh tìm kiếm, lưới "Editor's Picks". Bộ lọc lưu trên URL. */
function Tours() {
    const [params, setParams] = useSearchParams();
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState({ q: params.get("q") || "", length: params.get("length") || "" });
    const page = Number(params.get("page") || 1);

    const update = (changes, keepPage = false) => {
        const next = new URLSearchParams(params);
        Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, String(value)) : next.delete(key)));
        if (!keepPage) next.delete("page");
        setParams(next);
    };

    useEffect(() => {
        let cancelled = false;
        const length = DURATION_FILTERS.find((d) => d.value === (params.get("length") || "")) || DURATION_FILTERS[0];
        setLoading(true);
        setError("");
        fetchTours({
            q: params.get("q"),
            minDays: length.min,
            maxDays: length.max,
            priceMax: params.get("priceMax"),
            sort: params.get("sort"),
            page,
            limit: PAGE_SIZE,
        })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [params, page]);

    const scrollToList = () => document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });

    return (
        <div className="bg-surface text-on-surface">
            {/* Editorial hero */}
            <section className="relative h-[640px] w-full overflow-hidden">
                <img src={HERO_IMAGE} alt="Mountain landscape at dawn" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/30 to-transparent" />
                <div className="relative z-10 max-w-screen-2xl mx-auto px-8 h-full flex flex-col justify-center">
                    <span className="text-white/90 text-[0.75rem] uppercase tracking-[0.2em] font-bold mb-4">
                        Exclusive Collection
                    </span>
                    <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6 max-w-3xl">
                        Curated Journeys. <br />
                        Local Secrets.
                    </h1>
                    <p className="text-white/90 text-lg max-w-xl font-medium mb-10">
                        Expert-led experiences that go beyond the guidebook. Discover the soul of every destination through the
                        eyes of those who call it home.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button
                            type="button"
                            onClick={scrollToList}
                            className="bg-surface text-primary px-8 py-3.5 rounded-lg font-bold hover:bg-surface-container-high transition-all"
                        >
                            Explore Experiences
                        </button>
                        <Link
                            to="/destinations"
                            className="border border-white/60 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-white/10 transition-all"
                        >
                            Browse Destinations
                        </Link>
                    </div>
                </div>
            </section>

            {/* Search & filter bar */}
            <div className="max-w-screen-xl mx-auto px-8 -mt-16 relative z-20">
                <SearchPanel
                    columns={3}
                    submitLabel="Search"
                    submitIcon="search"
                    onSubmit={() => {
                        update({ q: search.q.trim(), length: search.length });
                        scrollToList();
                    }}
                >
                    <SearchField label="Destination" icon="location_on">
                        <input
                            className={fieldInputClass}
                            placeholder="Where are you going?"
                            value={search.q}
                            onChange={(e) => setSearch((s) => ({ ...s, q: e.target.value }))}
                        />
                    </SearchField>
                    <SearchField label="Length" icon="schedule">
                        <select
                            className={fieldInputClass}
                            value={search.length}
                            onChange={(e) => setSearch((s) => ({ ...s, length: e.target.value }))}
                        >
                            {DURATION_FILTERS.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </SearchField>
                    <SearchField label="Budget per person" icon="payments">
                        <select
                            className={fieldInputClass}
                            value={params.get("priceMax") || ""}
                            onChange={(e) => update({ priceMax: e.target.value })}
                        >
                            <option value="">Any budget</option>
                            <option value="300">Up to $300</option>
                            <option value="800">Up to $800</option>
                            <option value="1500">Up to $1,500</option>
                        </select>
                    </SearchField>
                </SearchPanel>
            </div>

            {/* Tour grid */}
            <section id="tours" className="max-w-screen-2xl mx-auto px-8 py-20 scroll-mt-24">
                <ListHeader
                    eyebrow={params.get("q") ? `Results for "${params.get("q")}"` : "Unforgettable moments, hand-picked"}
                    title="Editor's Picks"
                    sortOptions={TOUR_SORTS}
                    sort={params.get("sort") || "newest"}
                    onSortChange={(value) => update({ sort: value === "newest" ? "" : value })}
                />
                <FormAlert>{error}</FormAlert>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[28rem] rounded-xl bg-surface-container-high animate-pulse" />
                        ))}
                    </div>
                ) : result.items.length === 0 ? (
                    <div className="text-center py-20 bg-surface-container-low rounded-xl">
                        <span className="material-symbols-outlined text-5xl text-outline mb-3">travel_explore</span>
                        <p className="text-on-surface-variant">
                            No tours match your search yet. Try another destination or length.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-on-surface-variant mb-6">
                            <span className="font-bold text-on-surface">{result.total}</span> experience
                            {result.total === 1 ? "" : "s"}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {result.items.map((tour) => (
                                <TourCard key={tour.id} tour={tour} />
                            ))}
                        </div>
                    </>
                )}
                <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={(p) => update({ page: p }, true)} />
            </section>
        </div>
    );
}

export default Tours;
