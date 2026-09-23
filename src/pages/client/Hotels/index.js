import HotelListCard from "../../../components/client/HotelListCard";
import { useHotelsPage } from "../../../hooks/useHotelsPage";

function Hotels() {
    const {
        countries,
        destinations,
        hotels,
        amenityOptions,
        total,
        totalPages,
        page,
        draft,
        applied,
        loadingCountries,
        loadingDestinations,
        loadingHotels,
        error,
        updateDraft,
        updateDraftLocation,
        applySearch,
        setStarRatings,
        setAmenities,
        goToPage,
        reload,
    } = useHotelsPage();

    const handleStarRatingChange = (rating) => {
        const next = applied.starRatings.includes(rating)
            ? applied.starRatings.filter((r) => r !== rating)
            : [...applied.starRatings, rating];
        setStarRatings(next);
    };

    const handleAmenityChange = (apiValue) => {
        const next = applied.amenities.includes(apiValue)
            ? applied.amenities.filter((a) => a !== apiValue)
            : [...applied.amenities, apiValue];
        setAmenities(next);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applySearch();
    };

    const locationLabel =
        [draft.countryCode && countries.find((c) => c.countryCode === draft.countryCode)?.name, draft.destinationId && destinations.find((d) => String(d.id) === String(draft.destinationId))?.name]
            .filter(Boolean)
            .join(", ") || "all destinations";

    // Show a sliding window of up to 7 page numbers centered around the current page
    let startPage = Math.max(1, page - 3);
    let endPage = Math.min(totalPages, startPage + 6);
    if (endPage - startPage < 6) {
        startPage = Math.max(1, endPage - 6);
    }
    const pageNumbers = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
    );

    return (
        <main className="pt-20">
            <section className="bg-surface-container-low py-16 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-10 text-center md:text-left">
                        <span className="text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-3 block">
                            Editorial Collection
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-primary tracking-tight leading-tight">
                            The Art of <br />
                            Curated Living.
                        </h1>
                    </div>

                    <form
                        onSubmit={handleSearchSubmit}
                        className="bg-white p-4 md:p-6 rounded-2xl shadow-2xl shadow-blue-900/10 border border-gray-100"
                    >
                        <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-4">
                            <div className="flex-1 min-w-0 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">
                                    Country
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                                        public
                                    </span>
                                    <select
                                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-0 focus:border-b-2 focus:border-primary-fixed-dim appearance-none cursor-pointer disabled:opacity-50"
                                        value={draft.countryCode}
                                        onChange={(e) =>
                                            updateDraftLocation({
                                                countryCode: e.target.value,
                                                destinationId: "",
                                            })
                                        }
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

                            <div className="flex-1 min-w-0 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">
                                    Destination
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                                        location_on
                                    </span>
                                    <select
                                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-0 focus:border-b-2 focus:border-primary-fixed-dim appearance-none cursor-pointer disabled:opacity-50"
                                        value={draft.destinationId}
                                        onChange={(e) =>
                                            updateDraftLocation({
                                                destinationId: e.target.value,
                                            })
                                        }
                                        disabled={!draft.countryCode || loadingDestinations}
                                    >
                                        <option value="">Select Destination</option>
                                        {destinations.map((dest) => (
                                            <option key={dest.id} value={dest.id}>
                                                {dest.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex-1 min-w-[9.5rem] space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">
                                    Check-in
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                                        calendar_month
                                    </span>
                                    <input
                                        type="date"
                                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-0 focus:border-b-2 focus:border-primary-fixed-dim"
                                        value={draft.checkIn}
                                        onChange={(e) =>
                                            updateDraft({ checkIn: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex-1 min-w-[9.5rem] space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">
                                    Check-out
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
                                        onChange={(e) =>
                                            updateDraft({ checkOut: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex-[1.25] min-w-0 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">
                                    Hotel Name
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                                        hotel
                                    </span>
                                    <input
                                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-0 focus:border-b-2 focus:border-primary-fixed-dim placeholder:text-outline"
                                        placeholder="Enter hotel name"
                                        type="text"
                                        value={draft.name}
                                        onChange={(e) =>
                                            updateDraft({ name: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="w-full lg:w-24 shrink-0 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">
                                    Rooms
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                                        numbers
                                    </span>
                                    <input
                                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-0 focus:border-b-2 focus:border-primary-fixed-dim"
                                        type="number"
                                        min="1"
                                        value={draft.rooms}
                                        onChange={(e) =>
                                            updateDraft({
                                                rooms: parseInt(e.target.value, 10) || 1,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full lg:w-auto shrink-0 bg-primary text-on-primary px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-all whitespace-nowrap disabled:opacity-60"
                                disabled={loadingHotels}
                            >
                                <span className="material-symbols-outlined">search</span>
                                Search Hotels
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-8 py-16 flex flex-col lg:flex-row gap-12">
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-10">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface mb-6">
                            Star Rating
                        </h3>
                        <div className="space-y-4">
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <label
                                    key={rating}
                                    className="flex items-center gap-3 cursor-pointer group"
                                >
                                    <div
                                        className={`w-5 h-5 rounded border border-outline-variant group-hover:border-primary transition-colors flex items-center justify-center ${
                                            applied.starRatings.includes(rating)
                                                ? "bg-primary text-on-primary"
                                                : ""
                                        }`}
                                    >
                                        {applied.starRatings.includes(rating) && (
                                            <span className="material-symbols-outlined text-xs">
                                                check
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={applied.starRatings.includes(rating)}
                                        onChange={() => handleStarRatingChange(rating)}
                                    />
                                    <span className="text-sm text-on-surface-variant">
                                        {rating} Star{rating > 1 ? "s" : ""}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {amenityOptions.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface mb-6">
                                Amenities
                            </h3>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                {amenityOptions.map((amenity) => (
                                    <label
                                        key={amenity}
                                        className="flex items-center gap-3 cursor-pointer group"
                                    >
                                        <div
                                            className={`w-5 h-5 rounded border border-outline-variant group-hover:border-primary transition-colors flex items-center justify-center ${
                                                applied.amenities.includes(amenity)
                                                    ? "bg-primary text-on-primary"
                                                    : ""
                                            }`}
                                        >
                                            {applied.amenities.includes(amenity) && (
                                                <span className="material-symbols-outlined text-xs">
                                                    check
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={applied.amenities.includes(amenity)}
                                            onChange={() => handleAmenityChange(amenity)}
                                        />
                                        <span className="text-sm text-on-surface-variant">
                                            {amenity}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                        <p className="text-sm text-on-surface-variant font-medium">
                            {loadingHotels ? (
                                "Loading properties..."
                            ) : (
                                <>
                                    Showing{" "}
                                    <span className="text-on-surface font-bold">
                                        {total} {total === 1 ? "property" : "properties"}
                                    </span>{" "}
                                    {locationLabel !== "all destinations" && (
                                        <>in {locationLabel}</>
                                    )}
                                    {applied.checkIn && applied.checkOut && (
                                        <>
                                            {" "}
                                            · available {applied.checkIn} → {applied.checkOut}
                                        </>
                                    )}
                                </>
                            )}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <span>
                                <strong>Could not load hotels.</strong> {error}
                            </span>
                            <button
                                type="button"
                                onClick={reload}
                                className="shrink-0 px-4 py-2 bg-white rounded-lg font-bold text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {loadingHotels && hotels.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="bg-surface-container-lowest rounded-xl aspect-[3/4] animate-pulse"
                                />
                            ))}
                        </div>
                    ) : hotels.length === 0 ? (
                        <div className="text-center py-20 text-on-surface-variant">
                            <span className="material-symbols-outlined text-5xl mb-4 opacity-40">
                                search_off
                            </span>
                            <p className="font-bold text-lg text-on-surface">
                                No hotels found
                            </p>
                            <p className="text-sm mt-2">
                                Try adjusting your filters or search criteria.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {hotels.map((hotel) => (
                                <HotelListCard key={hotel.id} hotel={hotel} />
                            ))}
                        </div>
                    )}

                    {totalPages >= 1 && (
                        <div className="mt-16 flex justify-center items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                disabled={page <= 1 || loadingHotels}
                                onClick={() => goToPage(page - 1)}
                                className="w-10 h-10 rounded-lg flex items-center justify-center border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-40"
                            >
                                <span className="material-symbols-outlined text-sm">
                                    chevron_left
                                </span>
                            </button>
                            {pageNumbers.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    disabled={loadingHotels}
                                    onClick={() => goToPage(p)}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium text-sm transition-colors ${
                                        p === page
                                            ? "bg-primary text-on-primary font-bold"
                                            : "text-on-surface-variant hover:bg-surface-container-low"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                type="button"
                                disabled={page >= totalPages || loadingHotels}
                                onClick={() => goToPage(page + 1)}
                                className="w-10 h-10 rounded-lg flex items-center justify-center border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-40"
                            >
                                <span className="material-symbols-outlined text-sm">
                                    chevron_right
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-8 mb-24">
                <div className="bg-primary-container rounded-2xl p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="relative z-10 max-w-xl text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                            Join the Inner Circle.
                        </h2>
                        <p className="text-on-primary-container text-lg mb-10 leading-relaxed">
                            Subscribers receive priority access to our most exclusive
                            properties and weekly curated travel insights from our global
                            editors.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4">
                            <input
                                className="flex-grow px-6 py-4 rounded-lg bg-white/10 border-none text-white placeholder:text-on-primary-container/60 focus:ring-2 focus:ring-primary-fixed-dim"
                                placeholder="Email Address"
                                type="email"
                            />
                            <button
                                type="button"
                                className="bg-white text-primary px-8 py-4 rounded-lg font-bold hover:bg-surface-bright transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                    <div className="w-full md:w-1/3 aspect-square relative group">
                        <img
                            className="w-full h-full object-cover rounded-xl rotate-3 group-hover:rotate-0 transition-transform duration-500"
                            alt="Travel inspiration"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM9jJZW_20u2VFvHEJw3SKvXkohHxMbNHRKxhb3Q_zoea2MLScl1hpC_w9EglyIJprtS4xTGtJdt4HI1SOqI64HjI8Qb4pVuFMlidRytbAj4Xr1_b4tE5bOLdmUDfpNK3czxSb6Jjv-cF1JNZN_cBEOPn76qu4JCqlVfdJhahAFSJ1CVvZWmLduE2ZZ7LEkT1NvNrGAjHFjD4Gj_ex2IDZEfMaKVarrooiVv2nnqKmyzfF4XFNZ4iWFdTb8l-_WH3bnYdSb4CsiqA"
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Hotels;
