import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CatalogHero from "../../../components/catalog/CatalogHero";
import SearchPanel from "../../../components/catalog/SearchPanel";
import SearchField, { fieldInputClass } from "../../../components/catalog/SearchField";
import FilterSidebar, { FilterCheckbox, FilterChip, FilterGroup } from "../../../components/catalog/FilterSidebar";
import ListHeader from "../../../components/catalog/ListHeader";
import SpecChip from "../../../components/catalog/SpecChip";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import { CAR_SORTS, CAR_TYPE_LABELS, fetchCarFilters, fetchCars } from "../../../services/carService";
import { formatMoney } from "../../../utils/formatters";
import { withSeconds } from "../../../utils/dateTime";

const PAGE_SIZE = 9;
const HERO_IMAGE =
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1800&q=80";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=80";
const FUEL_ICONS = { electric: "bolt", hybrid: "electric_car" };

/** Thẻ xe trong lưới kết quả (theo CAR.html). */
function CarCard({ car, query }) {
    const link = `/cars/${car.id}${query ? `?${query}` : ""}`;
    return (
        <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
            <Link to={link} className="block relative h-48 overflow-hidden">
                <img
                    alt={car.name}
                    src={car.coverImageUrl || PLACEHOLDER_IMAGE}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-sm">directions_car</span>
                    <span className="text-xs font-bold">{CAR_TYPE_LABELS[car.carType] || car.carType}</span>
                </div>
                {car.withDriver && (
                    <div className="absolute top-4 left-4 editorial-gradient text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        With driver
                    </div>
                )}
            </Link>
            <div className="p-6">
                <h3 className="font-headline font-bold text-lg text-primary">
                    <Link to={link}>{car.name}</Link>
                </h3>
                <p className="text-xs text-on-surface-variant mb-4">
                    {[car.brand, car.model].filter(Boolean).join(" ") || " "}
                    {car.destinationName ? ` · ${car.destinationName}` : ""}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <SpecChip icon={car.seats > 5 ? "groups" : "airline_seat_recline_normal"} label={`${car.seats} Seats`} />
                    <SpecChip icon="settings_input_component" label={car.transmission === "manual" ? "Manual" : "Auto"} />
                    <SpecChip icon={FUEL_ICONS[car.fuelType] || "local_gas_station"} label={car.fuelType || "—"} />
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-2xl font-black text-primary">{formatMoney(car.pricePerDay, car.currencyCode)}</span>
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter"> / day</span>
                    </div>
                    <Link
                        to={link}
                        className="editorial-gradient text-on-primary px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 transition-all"
                    >
                        Rent Now
                    </Link>
                </div>
            </div>
        </div>
    );
}

/** Danh sách xe cho thuê: hero + tìm kiếm, bộ lọc bên trái, lưới xe. Bộ lọc lưu trên URL để chia sẻ / quay lại được. */
function Cars() {
    const [params, setParams] = useSearchParams();
    const [options, setOptions] = useState(null);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState({
        q: params.get("q") || "",
        pickup: params.get("pickup") || "",
        dropoff: params.get("dropoff") || "",
        type: params.get("type") || "",
    });

    const brands = useMemo(() => (params.get("brands") ? params.get("brands").split(",") : []), [params]);
    const page = Number(params.get("page") || 1);
    const pickup = params.get("pickup") || "";
    const dropoff = params.get("dropoff") || "";
    const datesChosen = Boolean(pickup && dropoff);

    /** Đổi một hoặc nhiều tham số lọc; mặc định quay về trang 1. */
    const update = (changes, keepPage = false) => {
        const next = new URLSearchParams(params);
        Object.entries(changes).forEach(([key, value]) => {
            if (value === "" || value == null || (Array.isArray(value) && value.length === 0)) next.delete(key);
            else next.set(key, Array.isArray(value) ? value.join(",") : String(value));
        });
        if (!keepPage) next.delete("page");
        setParams(next);
    };

    useEffect(() => {
        fetchCarFilters().then(setOptions).catch(() => setOptions(null));
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchCars({
            q: params.get("q"),
            type: params.get("type"),
            brands,
            transmission: params.get("transmission"),
            fuelType: params.get("fuel"),
            withDriver: params.get("driver") === "yes" ? true : undefined,
            seats: params.get("seats"),
            priceMax: params.get("priceMax"),
            pickupDate: pickup && dropoff ? withSeconds(pickup) : undefined,
            returnDate: pickup && dropoff ? withSeconds(dropoff) : undefined,
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
    }, [params, brands, page, pickup, dropoff]);

    const handleSearch = () => {
        if ((search.pickup && !search.dropoff) || (!search.pickup && search.dropoff)) {
            setError("Please choose both pick-up and drop-off time, or leave both empty.");
            return;
        }
        if (search.pickup && search.dropoff && search.dropoff <= search.pickup) {
            setError("Drop-off must be after pick-up.");
            return;
        }
        update({ q: search.q.trim(), pickup: search.pickup, dropoff: search.dropoff, type: search.type });
        document.getElementById("fleet")?.scrollIntoView({ behavior: "smooth" });
    };

    const toggleBrand = (brand, checked) =>
        update({ brands: checked ? [...brands, brand] : brands.filter((b) => b !== brand) });
    const toggleParam = (key, value) => update({ [key]: params.get(key) === value ? "" : value });
    const priceCeiling = options?.priceMax ? Math.ceil(Number(options.priceMax)) : 1000;
    const priceFloor = options?.priceMin ? Math.floor(Number(options.priceMin)) : 0;
    const priceMax = params.get("priceMax") ? Number(params.get("priceMax")) : priceCeiling;
    const detailQuery = datesChosen ? new URLSearchParams({ pickup, dropoff }).toString() : "";

    return (
        <div className="bg-surface text-on-surface">
            <CatalogHero
                image={HERO_IMAGE}
                alt="Car driving on a scenic road"
                title={
                    <>
                        Precision Engineering. <br />
                        Unforgettable Journeys.
                    </>
                }
                subtitle="Experience the open road with our curated collection of vehicles, from city runabouts to spacious family vans."
            >
                <SearchPanel columns={4} onSubmit={handleSearch} submitLabel="Search Collection">
                    <SearchField label="Location" icon="location_on">
                        <input
                            className={fieldInputClass}
                            placeholder="City, airport, car name..."
                            value={search.q}
                            onChange={(e) => setSearch((s) => ({ ...s, q: e.target.value }))}
                        />
                    </SearchField>
                    <SearchField label="Pick-up" icon="calendar_today">
                        <input
                            type="datetime-local"
                            className={fieldInputClass}
                            value={search.pickup}
                            onChange={(e) => setSearch((s) => ({ ...s, pickup: e.target.value }))}
                        />
                    </SearchField>
                    <SearchField label="Drop-off" icon="event">
                        <input
                            type="datetime-local"
                            className={fieldInputClass}
                            min={search.pickup || undefined}
                            value={search.dropoff}
                            onChange={(e) => setSearch((s) => ({ ...s, dropoff: e.target.value }))}
                        />
                    </SearchField>
                    <SearchField label="Car Type" icon="directions_car">
                        <select
                            className={fieldInputClass}
                            value={search.type}
                            onChange={(e) => setSearch((s) => ({ ...s, type: e.target.value }))}
                        >
                            <option value="">Any type</option>
                            {Object.entries(CAR_TYPE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </SearchField>
                </SearchPanel>
            </CatalogHero>

            <div id="fleet" className="max-w-screen-2xl mx-auto px-8 py-20 flex flex-col md:flex-row gap-12 scroll-mt-24">
                <FilterSidebar onReset={() => setParams(new URLSearchParams())}>
                    {options?.brands?.length > 0 && (
                        <FilterGroup title="Brand">
                            {options.brands.map((brand) => (
                                <FilterCheckbox
                                    key={brand}
                                    label={brand}
                                    checked={brands.includes(brand)}
                                    onChange={(checked) => toggleBrand(brand, checked)}
                                />
                            ))}
                        </FilterGroup>
                    )}
                    <FilterGroup title="Price Range (Daily)">
                        <input
                            className="w-full accent-primary"
                            type="range"
                            min={priceFloor}
                            max={priceCeiling}
                            value={Math.min(priceMax, priceCeiling)}
                            onChange={(e) => update({ priceMax: Number(e.target.value) >= priceCeiling ? "" : e.target.value })}
                        />
                        <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                            <span>{formatMoney(priceFloor, options?.currencyCode)}</span>
                            <span>up to {formatMoney(Math.min(priceMax, priceCeiling), options?.currencyCode)}</span>
                        </div>
                    </FilterGroup>
                    {options?.transmissions?.length > 0 && (
                        <FilterGroup title="Transmission">
                            <div className="flex flex-wrap gap-2">
                                {options.transmissions.map((t) => (
                                    <FilterChip
                                        key={t}
                                        label={t.charAt(0).toUpperCase() + t.slice(1)}
                                        active={params.get("transmission") === t}
                                        onClick={() => toggleParam("transmission", t)}
                                    />
                                ))}
                            </div>
                        </FilterGroup>
                    )}
                    {options?.fuelTypes?.length > 0 && (
                        <FilterGroup title="Fuel">
                            <div className="flex flex-wrap gap-2">
                                {options.fuelTypes.map((f) => (
                                    <FilterChip
                                        key={f}
                                        label={f.charAt(0).toUpperCase() + f.slice(1)}
                                        active={params.get("fuel") === f}
                                        onClick={() => toggleParam("fuel", f)}
                                    />
                                ))}
                            </div>
                        </FilterGroup>
                    )}
                    <FilterGroup title="Features">
                        <FilterCheckbox
                            label="Chauffeur included"
                            checked={params.get("driver") === "yes"}
                            onChange={(checked) => update({ driver: checked ? "yes" : "" })}
                        />
                        <FilterCheckbox
                            label="6+ seats"
                            checked={params.get("seats") === "6"}
                            onChange={(checked) => update({ seats: checked ? 6 : "" })}
                        />
                    </FilterGroup>
                </FilterSidebar>

                <div className="flex-grow">
                    <ListHeader
                        eyebrow={datesChosen ? "Available for your dates" : "Available Now"}
                        title="Curated Fleet"
                        sortOptions={CAR_SORTS}
                        sort={params.get("sort") || "newest"}
                        onSortChange={(value) => update({ sort: value === "newest" ? "" : value })}
                    />
                    <FormAlert>{error}</FormAlert>
                    {loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-96 rounded-xl bg-surface-container-high animate-pulse" />
                            ))}
                        </div>
                    ) : result.items.length === 0 ? (
                        <div className="text-center py-20 bg-surface-container-low rounded-xl">
                            <span className="material-symbols-outlined text-5xl text-outline mb-3">no_crash</span>
                            <p className="text-on-surface-variant">
                                No cars match your search{datesChosen ? " for these dates" : ""}. Try other filters.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-on-surface-variant mb-6">
                                <span className="font-bold text-on-surface">{result.total}</span> vehicle{result.total === 1 ? "" : "s"}
                            </p>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {result.items.map((car) => (
                                    <CarCard key={car.id} car={car} query={detailQuery} />
                                ))}
                            </div>
                        </>
                    )}
                    <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={(p) => update({ page: p }, true)} />
                </div>
            </div>
        </div>
    );
}

export default Cars;
