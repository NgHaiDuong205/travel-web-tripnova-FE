import { useState } from "react";
import { Link } from "react-router-dom";
import { DESTINATION_LIST } from "../../../constants/destinations";
import CatalogHero from "../../../components/catalog/CatalogHero";
import DestinationDirectory from "../../../components/client/DestinationDirectory";
import { useCountryDestinationOptions } from "../../../hooks/useCountryDestinationOptions";
import { useT } from "../../../i18n/I18nContext";

const HERO_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=2000&q=80";

const CATEGORIES = [
    { id: "all", labelKey: "destinations.categories.all" },
    { id: "coastal", labelKey: "destinations.categories.coastal" },
    { id: "historical", labelKey: "destinations.categories.historical" },
    { id: "mountain", labelKey: "destinations.categories.mountain" },
    { id: "urban", labelKey: "destinations.categories.urban" },
    { id: "hidden", labelKey: "destinations.categories.hidden" },
];

function filterDestinationList(list, { destinationName, category }) {
    return list.filter((d) => {
        const matchCategory = category === "all" || d.category === category;
        const matchDest =
            !destinationName ||
            d.title.toLowerCase().includes(destinationName.toLowerCase()) ||
            destinationName.toLowerCase().includes(d.title.toLowerCase().replace(/^the\s+/i, ""));
        return matchCategory && matchDest;
    });
}

function getLocationLabel(countryName, destinationName) {
    if (!countryName && !destinationName) return null;
    if (!destinationName) return countryName;
    if (!countryName) return destinationName;
    return `${destinationName}, ${countryName}`;
}

function Destinations() {
    const t = useT();
    const {
        countries,
        destinations,
        countryCode: selectedCountryCode,
        destinationId: selectedDestinationId,
        setCountryCode: setSelectedCountryCode,
        setDestinationId: setSelectedDestinationId,
        selectedCountry,
        selectedDestination,
        loadingCountries,
        loadingDestinations,
    } = useCountryDestinationOptions();

    const [activeCategory, setActiveCategory] = useState("all");
    const [appliedCountryName, setAppliedCountryName] = useState("");
    const [appliedCountryCode, setAppliedCountryCode] = useState("");
    const [appliedDestinationName, setAppliedDestinationName] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const localizedDestinations = DESTINATION_LIST.map((destination) => ({
        ...destination,
        badge: destination.badge && t(`destinations.content.${destination.i18nKey}.list.badge`),
        tag: destination.tag && t(`destinations.content.${destination.i18nKey}.list.tag`),
        title: t(`destinations.content.${destination.i18nKey}.list.title`),
        description: t(`destinations.content.${destination.i18nKey}.list.description`),
        alt: t(`destinations.content.${destination.i18nKey}.list.alt`),
    }));
    const filtered = filterDestinationList(localizedDestinations, {
        destinationName: appliedDestinationName,
        category: activeCategory,
    });

    const feature = filtered.find((d) => d.type === "feature");
    const secondary = filtered.find((d) => d.type === "secondary");
    const cards = filtered.filter((d) => d.type === "card");

    const locationLabel = getLocationLabel(appliedCountryName, appliedDestinationName);

    const handleSearch = (e) => {
        e.preventDefault();
        setAppliedCountryName(selectedCountry?.name ?? "");
        setAppliedCountryCode(selectedCountryCode);
        setAppliedDestinationName(selectedDestination?.name ?? "");
        setHasSearched(true);
    };

    const handleClearSearch = () => {
        setSelectedCountryCode("");
        setSelectedDestinationId("");
        setAppliedCountryName("");
        setAppliedCountryCode("");
        setAppliedDestinationName("");
        setHasSearched(false);
    };

    return (
        <div className="bg-surface text-on-surface pb-8">
            {/* Hero Section */}
            <CatalogHero
                image={HERO_IMAGE}
                alt={t("destinations.hero.imageAlt")}
                eyebrow={t("destinations.hero.eyebrow")}
                title={
                    <>
                        {t("destinations.hero.titleFirst")} <br />
                        {t("destinations.hero.titleSecond")}
                    </>
                }
                subtitle={t("destinations.hero.description")}
            >
                {/* Search and Filter Bar */}
                <div className="max-w-4xl">
                    <form
                        onSubmit={handleSearch}
                        className="bg-surface-container-lowest p-4 rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/10"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="relative group">
                                <label className="absolute -top-2.5 left-4 bg-surface-container-lowest px-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest z-10">
                                    {t("destinations.filters.country")}
                                </label>
                                <div className="flex items-center bg-surface-container px-4 py-3.5 rounded-xl border border-transparent focus-within:border-primary focus-within:bg-white transition-all">
                                    <span className="material-symbols-outlined text-on-surface-variant text-xl mr-3 shrink-0">
                                        public
                                    </span>
                                    <select
                                        className="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium w-full cursor-pointer appearance-none text-on-surface disabled:opacity-50"
                                        value={selectedCountryCode}
                                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                                        disabled={loadingCountries}
                                    >
                                        <option value="">{t("destinations.filters.selectCountry")}</option>
                                        {countries.map((country) => (
                                            <option
                                                key={country.countryCode || country.id}
                                                value={country.countryCode || ""}
                                            >
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="absolute -top-2.5 left-4 bg-surface-container-lowest px-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest z-10">
                                    {t("destinations.filters.city")}
                                </label>
                                <div
                                    className={`flex items-center bg-surface-container px-4 py-3.5 rounded-xl border border-transparent focus-within:border-primary focus-within:bg-white transition-all ${!selectedCountryCode ? "opacity-50" : ""}`}
                                >
                                    <span className="material-symbols-outlined text-on-surface-variant text-xl mr-3 shrink-0">
                                        location_city
                                    </span>
                                    <select
                                        className="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium w-full cursor-pointer appearance-none text-on-surface disabled:cursor-not-allowed"
                                        value={selectedDestinationId}
                                        onChange={(e) => setSelectedDestinationId(e.target.value)}
                                        disabled={!selectedCountryCode || loadingDestinations}
                                    >
                                        <option value="">{t("destinations.filters.selectCity")}</option>
                                        {destinations.map((dest) => (
                                            <option key={dest.id} value={dest.id}>
                                                {dest.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-colors"
                                >
                                    <span className="material-symbols-outlined">search</span>
                                    <span>{t("destinations.actions.find")}</span>
                                </button>
                                {hasSearched && (appliedCountryName || appliedDestinationName) && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="sm:w-auto px-6 py-3.5 rounded-xl font-bold text-primary border border-outline-variant/30 hover:bg-surface-container-low transition-colors"
                                    >
                                        {t("common.actions.clear")}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </CatalogHero>

            {/* Category Filters */}
            <section className="max-w-7xl mx-auto px-8 mt-12 mb-8">
                <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategory(cat.id)}
                            className={
                                activeCategory === cat.id
                                    ? "bg-primary text-white px-6 py-2 rounded-full text-xs font-bold tracking-wider uppercase"
                                    : "bg-surface-container-lowest border border-outline-variant/15 text-on-surface-variant px-6 py-2 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-surface-container-low transition-colors"
                            }
                        >
                            {t(cat.labelKey)}
                        </button>
                    ))}
                </div>
            </section>

            {/* Results summary — chỉ cho phần biên tập; danh sách DB bên dưới có số đếm riêng */}
            {filtered.length > 0 && (
            <section className="max-w-7xl mx-auto px-8 mb-8">
                <p className="text-sm text-on-surface-variant font-medium">
                    {hasSearched && locationLabel ? (
                        <>
                            <span className="text-on-surface font-bold">{t("destinations.results.inLocation", { count: filtered.length, location: locationLabel })}</span>
                        </>
                    ) : (
                        <>
                            <span className="text-on-surface font-bold">{t("destinations.results.count", { count: filtered.length })}</span>
                            {activeCategory !== "all" && (
                                <>
                                    {" "}
                                    · <span className="capitalize">{activeCategory.replace("-", " ")}</span>
                                </>
                            )}
                        </>
                    )}
                </p>
            </section>
            )}

            {/* Curated Grid — không có thẻ biên tập khớp thì để trống, danh sách DB tự báo kết quả */}
            <section className="max-w-7xl mx-auto px-8">
                {filtered.length === 0 ? null : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                        {feature && (
                            <Link
                                to={`/destinations/${feature.id}`}
                                className="md:col-span-8 group cursor-pointer block"
                            >
                                <div className="relative h-[500px] rounded-xl overflow-hidden mb-6">
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        alt={feature.alt}
                                        src={feature.image}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                                    <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                                        <div>
                                            <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">
                                                {feature.badge}
                                            </span>
                                            <h3 className="font-headline text-white text-4xl font-bold tracking-tight">
                                                {feature.title}
                                            </h3>
                                            <p className="text-white/80 text-sm mt-2">{feature.description}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-white text-4xl font-light">
                                            arrow_outward
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {secondary && (
                            <Link
                                to={`/destinations/${secondary.id}`}
                                className="md:col-span-4 group cursor-pointer bg-surface-container-low p-8 rounded-xl flex flex-col justify-between block"
                            >
                                <div>
                                    <div className="h-64 rounded-lg overflow-hidden mb-8 shadow-sm">
                                        <img
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            alt={secondary.alt}
                                            src={secondary.image}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-on-primary-container tracking-widest uppercase">
                                        {secondary.tag}
                                    </span>
                                    <h3 className="font-headline text-2xl font-bold mt-2 text-primary">
                                        {secondary.title}
                                    </h3>
                                    <p className="text-on-surface-variant text-sm mt-4 leading-relaxed italic">
                                        {secondary.description}
                                    </p>
                                </div>
                                <div className="mt-8 flex items-center justify-between">
                                    <span className="text-xs font-bold text-on-surface uppercase tracking-widest">
                                        {t("destinations.actions.learnMore")}
                                    </span>
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-sm">east</span>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {cards.map((dest) => (
                            <Link
                                key={dest.id}
                                to={`/destinations/${dest.id}`}
                                className="md:col-span-4 group cursor-pointer bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm block"
                            >
                                <div className="aspect-[4/5] rounded-lg overflow-hidden mb-6">
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt={dest.alt}
                                        src={dest.image}
                                    />
                                </div>
                                <h3 className="font-headline text-xl font-bold text-primary">{dest.title}</h3>
                                <p className="text-on-surface-variant text-sm mt-2">{dest.description}</p>
                            </Link>
                        ))}
                    </div>
                )}

            </section>

            {/* Điểm đến thật trong DB, lọc theo form tìm kiếm ở hero */}
            <DestinationDirectory countryCode={appliedCountryCode} query={appliedDestinationName} category={activeCategory} />

            <section className="max-w-7xl mx-auto px-8">
                {/* Full Width CTA */}
                <div className="md:col-span-12 mt-12 bg-primary-container rounded-xl p-12 text-center">
                    <h2 className="font-headline text-3xl font-bold text-white mb-6">
                        {t("destinations.cta.title")}
                    </h2>
                    <p className="text-on-primary-container max-w-xl mx-auto mb-8">
                        {t("destinations.cta.description")}
                    </p>
                    <button
                        type="button"
                        className="bg-tertiary-fixed text-on-tertiary-fixed px-10 py-4 rounded-lg font-bold hover:scale-95 transition-transform"
                    >
                        {t("destinations.actions.consult")}
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Destinations;
