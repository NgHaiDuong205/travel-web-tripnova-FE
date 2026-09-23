import { useState } from "react";
import { Link } from "react-router-dom";
import { DESTINATION_LIST } from "../../../constants/destinations";
import { useCountryDestinationOptions } from "../../../hooks/useCountryDestinationOptions";

const CATEGORIES = [
    { id: "all", label: "All Escapes" },
    { id: "coastal", label: "Coastal" },
    { id: "historical", label: "Historical" },
    { id: "mountain", label: "Mountain" },
    { id: "urban", label: "Urban Luxe" },
    { id: "hidden", label: "Hidden Gems" },
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
    const [appliedDestinationName, setAppliedDestinationName] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const filtered = filterDestinationList(DESTINATION_LIST, {
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
        setAppliedDestinationName(selectedDestination?.name ?? "");
        setHasSearched(true);
    };

    const handleClearSearch = () => {
        setSelectedCountryCode("");
        setSelectedDestinationId("");
        setAppliedCountryName("");
        setAppliedDestinationName("");
        setHasSearched(false);
    };

    return (
        <div className="bg-surface text-on-surface pt-12 pb-8">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-8 mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-2xl">
                        <span className="text-xs tracking-[0.1em] font-bold text-on-surface-variant uppercase mb-4 block">
                            World Discovery
                        </span>
                        <h1 className="font-headline text-6xl md:text-7xl font-extrabold tracking-tighter text-primary leading-none">
                            Curated <br />
                            Destinations
                        </h1>
                    </div>
                    <div className="pb-2">
                        <p className="text-on-surface-variant max-w-xs text-sm leading-relaxed border-l-2 border-primary-fixed-dim pl-6">
                            An editorial selection of the world's most evocative landscapes, from
                            sun-drenched coastlines to mist-covered peaks.
                        </p>
                    </div>
                </div>
            </section>

            {/* Search and Filter Bar */}
            <section className="max-w-7xl mx-auto px-8 mb-12">
                <form
                    onSubmit={handleSearch}
                    className="bg-surface-container-lowest p-4 rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/10"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="relative group">
                            <label className="absolute -top-2.5 left-4 bg-surface-container-lowest px-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest z-10">
                                Country
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
                                    <option value="">Select Country</option>
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
                                City
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
                                    <option value="">Select City</option>
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
                                <span>Find Destinations</span>
                            </button>
                            {hasSearched && (appliedCountryName || appliedDestinationName) && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="sm:w-auto px-6 py-3.5 rounded-xl font-bold text-primary border border-outline-variant/30 hover:bg-surface-container-low transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </section>

            {/* Category Filters */}
            <section className="max-w-7xl mx-auto px-8 mb-8">
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
                            {cat.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Results summary */}
            <section className="max-w-7xl mx-auto px-8 mb-8">
                <p className="text-sm text-on-surface-variant font-medium">
                    {hasSearched && locationLabel ? (
                        <>
                            Showing{" "}
                            <span className="text-on-surface font-bold">
                                {filtered.length} curated destination{filtered.length !== 1 ? "s" : ""}
                            </span>{" "}
                            in <span className="text-on-surface font-bold">{locationLabel}</span>
                        </>
                    ) : (
                        <>
                            Showing{" "}
                            <span className="text-on-surface font-bold">
                                {filtered.length} curated destination{filtered.length !== 1 ? "s" : ""}
                            </span>
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

            {/* Curated Grid */}
            <section className="max-w-7xl mx-auto px-8">
                {filtered.length === 0 ? (
                    <div className="text-center py-20 px-8 rounded-xl bg-surface-container-low border border-outline-variant/10">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4">
                            travel_explore
                        </span>
                        <h2 className="font-headline text-2xl font-bold text-primary mb-3">
                            No destinations found
                        </h2>
                        <p className="text-on-surface-variant text-sm max-w-md mx-auto mb-8">
                            Try selecting a different country or city, change the category filter, or clear your
                            search to browse all curated escapes.
                        </p>
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-container transition-colors"
                        >
                            View All Destinations
                        </button>
                    </div>
                ) : (
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
                                        Learn More
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

                {/* Full Width CTA */}
                <div className="md:col-span-12 mt-12 bg-primary-container rounded-xl p-12 text-center">
                    <h2 className="font-headline text-3xl font-bold text-white mb-6">
                        Can't find your ideal escape?
                    </h2>
                    <p className="text-on-primary-container max-w-xl mx-auto mb-8">
                        Our travel curators are ready to help you craft a completely bespoke itinerary tailored
                        to your specific architectural and cultural interests.
                    </p>
                    <button
                        type="button"
                        className="bg-tertiary-fixed text-on-tertiary-fixed px-10 py-4 rounded-lg font-bold hover:scale-95 transition-transform"
                    >
                        Consult a Curator
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Destinations;
