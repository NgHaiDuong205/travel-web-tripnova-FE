import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CatalogHero from "../../../components/catalog/CatalogHero";
import SearchPanel from "../../../components/catalog/SearchPanel";
import SearchField, { fieldInputClass } from "../../../components/catalog/SearchField";
import FilterSidebar, { FilterCheckbox, FilterChip, FilterGroup } from "../../../components/catalog/FilterSidebar";
import ListHeader from "../../../components/catalog/ListHeader";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import {
    FLIGHT_SORTS,
    SEAT_CLASS_LABELS,
    TIME_SLOTS,
    fetchAirports,
    fetchFlightFilters,
    fetchFlights,
} from "../../../services/flightService";
import { formatMoney } from "../../../utils/formatters";
import { AirlineLogo, FlightTimeline, flightDateLabel } from "../../../components/catalog/FlightTimeline";

const PAGE_SIZE = 8;
const HERO_IMAGE = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1800&q=80";

/** Thẻ chuyến bay theo FLIGHT.HTML. */
function FlightCard({ flight, detailQuery }) {
    const link = `/flights/${flight.id}${detailQuery ? `?${detailQuery}` : ""}`;
    return (
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-4 lg:w-48 shrink-0">
                <AirlineLogo flight={flight} />
                <div>
                    <p className="font-bold text-sm text-on-surface">{flight.airline}</p>
                    <p className="text-xs text-on-surface-variant">
                        {flight.flightNumber}
                        {flight.aircraftType ? ` · ${flight.aircraftType}` : ""}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">{flightDateLabel(flight.departureTime)}</p>
                </div>
            </div>
            <FlightTimeline flight={flight} />
            <div className="lg:w-44 shrink-0 lg:text-right lg:border-l lg:border-outline-variant/30 lg:pl-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">From</div>
                <div className="font-headline text-3xl font-black text-primary">{formatMoney(flight.fromPrice, flight.currencyCode)}</div>
                <div className="text-xs text-on-surface-variant mb-3">
                    Per person · {flight.availableSeats} seat{flight.availableSeats === 1 ? "" : "s"} left
                </div>
                <Link
                    to={link}
                    className="inline-block editorial-gradient text-on-primary px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-all"
                >
                    Select Flight
                </Link>
            </div>
        </div>
    );
}

/** Kết quả một chiều (đi hoặc về). */
function FlightResults({ title, query, detailQuery, page, onPage, onCount }) {
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchFlights({ ...query, page, limit: PAGE_SIZE })
            .then((data) => {
                if (cancelled) return;
                setResult(data);
                onCount?.(data.total);
            })
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(query), page]);

    return (
        <section className="space-y-6">
            {title && <h3 className="font-headline text-xl font-bold text-primary">{title}</h3>}
            <FormAlert>{error}</FormAlert>
            {loading ? (
                [1, 2, 3].map((i) => <div key={i} className="h-36 rounded-xl bg-surface-container-high animate-pulse" />)
            ) : result.items.length === 0 ? (
                <div className="text-center py-16 bg-surface-container-low rounded-xl">
                    <span className="material-symbols-outlined text-5xl text-outline mb-3">airplanemode_inactive</span>
                    <p className="text-on-surface-variant">No flights match your search. Try another date or fewer filters.</p>
                </div>
            ) : (
                result.items.map((flight) => <FlightCard key={flight.id} flight={flight} detailQuery={detailQuery} />)
            )}
            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={onPage} />
        </section>
    );
}

/** Tìm chuyến bay: một chiều / khứ hồi (hiện thêm danh sách chuyến về), lọc theo hãng, giá, khung giờ. */
function Flights() {
    const [params, setParams] = useSearchParams();
    const [options, setOptions] = useState(null);
    const [airports, setAirports] = useState([]);
    const [outboundCount, setOutboundCount] = useState(null);
    const [error, setError] = useState("");
    const [search, setSearch] = useState({
        trip: params.get("trip") || "oneway",
        from: params.get("from") || "",
        to: params.get("to") || "",
        depart: params.get("depart") || "",
        ret: params.get("return") || "",
        pax: params.get("pax") || "1",
        cls: params.get("class") || "economy",
    });

    const airlines = useMemo(() => (params.get("airlines") ? params.get("airlines").split(",") : []), [params]);
    const page = Number(params.get("page") || 1);
    const returnPage = Number(params.get("rpage") || 1);
    const roundTrip = params.get("trip") === "round" && params.get("return");

    const update = (changes, keepPage = false) => {
        const next = new URLSearchParams(params);
        Object.entries(changes).forEach(([key, value]) => {
            if (value === "" || value == null || (Array.isArray(value) && value.length === 0)) next.delete(key);
            else next.set(key, Array.isArray(value) ? value.join(",") : String(value));
        });
        if (!keepPage) {
            next.delete("page");
            next.delete("rpage");
        }
        setParams(next);
    };

    useEffect(() => {
        fetchFlightFilters().then(setOptions).catch(() => setOptions(null));
        fetchAirports().then(setAirports).catch(() => setAirports([]));
    }, []);

    const common = {
        seatClass: params.get("class") || undefined,
        pax: params.get("pax") || undefined,
        airlines,
        priceMax: params.get("priceMax") || undefined,
        time: params.get("time") || undefined,
        sort: params.get("sort") || undefined,
    };
    const outbound = { ...common, from: params.get("from"), to: params.get("to"), departDate: params.get("depart") };
    const inbound = { ...common, from: params.get("to"), to: params.get("from"), departDate: params.get("return") };
    const detailQuery = new URLSearchParams(
        Object.fromEntries(Object.entries({ class: params.get("class"), pax: params.get("pax") }).filter(([, v]) => v))
    ).toString();

    const handleSearch = () => {
        setError("");
        if (search.trip === "round" && search.depart && search.ret && search.ret < search.depart) {
            setError("Return date must be on or after the departure date.");
            return;
        }
        update({
            trip: search.trip === "round" ? "round" : "",
            from: search.from.trim(),
            to: search.to.trim(),
            depart: search.depart,
            return: search.trip === "round" ? search.ret : "",
            pax: search.pax === "1" ? "" : search.pax,
            class: search.cls,
        });
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    };

    const toggleAirline = (airline, checked) => update({ airlines: checked ? [...airlines, airline] : airlines.filter((a) => a !== airline) });
    const priceCeiling = options?.priceMax ? Math.ceil(Number(options.priceMax)) : 5000;
    const priceFloor = options?.priceMin ? Math.floor(Number(options.priceMin)) : 0;
    const priceMax = params.get("priceMax") ? Number(params.get("priceMax")) : priceCeiling;
    const tabClass = (active) =>
        `px-5 py-2 rounded-full text-sm font-bold transition-colors ${active ? "bg-primary text-on-primary shadow-lg" : "bg-surface/90 text-primary hover:bg-surface"}`;

    return (
        <div className="bg-surface text-on-surface">
            <datalist id="airport-options">
                {airports.map((a) => (
                    <option key={a.code} value={a.code}>
                        {a.city || a.code}
                    </option>
                ))}
            </datalist>
            <CatalogHero
                image={HERO_IMAGE}
                alt="Aircraft wing above the clouds"
                title={
                    <>
                        Skyward Bound. <br />
                        Elegance in Flight.
                    </>
                }
                subtitle="Compare schedules, pick your seat on the cabin map and pay securely in minutes."
            >
                <div className="max-w-5xl w-full">
                    <div className="flex gap-2 mb-3">
                        <button type="button" className={tabClass(search.trip === "round")} onClick={() => setSearch((s) => ({ ...s, trip: "round" }))}>
                            Round Trip
                        </button>
                        <button type="button" className={tabClass(search.trip !== "round")} onClick={() => setSearch((s) => ({ ...s, trip: "oneway" }))}>
                            One Way
                        </button>
                    </div>
                    <SearchPanel
                        columns={4}
                        onSubmit={handleSearch}
                        submitLabel="Search Flights"
                        submitIcon="flight_takeoff"
                        footer={
                            <div className="flex flex-wrap gap-3">
                                <label className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full text-sm font-bold text-on-surface-variant">
                                    <span className="material-symbols-outlined text-primary text-lg">person</span>
                                    <select
                                        className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold"
                                        value={search.pax}
                                        onChange={(e) => setSearch((s) => ({ ...s, pax: e.target.value }))}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                            <option key={n} value={n}>
                                                {n} Passenger{n > 1 ? "s" : ""}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full text-sm font-bold text-on-surface-variant">
                                    <span className="material-symbols-outlined text-primary text-lg">airline_seat_recline_extra</span>
                                    <select
                                        className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold"
                                        value={search.cls}
                                        onChange={(e) => setSearch((s) => ({ ...s, cls: e.target.value }))}
                                    >
                                        {Object.entries(SEAT_CLASS_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        }
                    >
                        <SearchField label="From (Departure)" icon="flight_takeoff">
                            <input
                                list="airport-options"
                                className={fieldInputClass}
                                placeholder="City or airport code"
                                value={search.from}
                                onChange={(e) => setSearch((s) => ({ ...s, from: e.target.value }))}
                            />
                        </SearchField>
                        <SearchField label="To (Destination)" icon="flight_land">
                            <input
                                list="airport-options"
                                className={fieldInputClass}
                                placeholder="Where to?"
                                value={search.to}
                                onChange={(e) => setSearch((s) => ({ ...s, to: e.target.value }))}
                            />
                        </SearchField>
                        <SearchField label="Departure Date" icon="calendar_month">
                            <input
                                type="date"
                                className={fieldInputClass}
                                value={search.depart}
                                onChange={(e) => setSearch((s) => ({ ...s, depart: e.target.value }))}
                            />
                        </SearchField>
                        <SearchField label="Return Date" icon="calendar_month">
                            <input
                                type="date"
                                className={`${fieldInputClass} disabled:opacity-40`}
                                disabled={search.trip !== "round"}
                                min={search.depart || undefined}
                                value={search.ret}
                                onChange={(e) => setSearch((s) => ({ ...s, ret: e.target.value }))}
                            />
                        </SearchField>
                    </SearchPanel>
                </div>
            </CatalogHero>

            <div id="results" className="max-w-screen-2xl mx-auto px-8 py-20 flex flex-col md:flex-row gap-12 scroll-mt-24">
                <FilterSidebar title="Filters" onReset={() => setParams(new URLSearchParams())}>
                    {options?.airlines?.length > 0 && (
                        <FilterGroup title="Airlines">
                            {options.airlines.map((airline) => (
                                <FilterCheckbox
                                    key={airline}
                                    label={airline}
                                    checked={airlines.includes(airline)}
                                    onChange={(checked) => toggleAirline(airline, checked)}
                                />
                            ))}
                        </FilterGroup>
                    )}
                    <FilterGroup title="Price Range">
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
                    <FilterGroup title="Flight Times">
                        <div className="grid grid-cols-2 gap-2">
                            {TIME_SLOTS.map((slot) => (
                                <FilterChip
                                    key={slot.value}
                                    label={slot.label}
                                    active={params.get("time") === slot.value}
                                    onClick={() => update({ time: params.get("time") === slot.value ? "" : slot.value })}
                                />
                            ))}
                        </div>
                    </FilterGroup>
                </FilterSidebar>

                <div className="flex-grow space-y-10">
                    <ListHeader
                        eyebrow={params.get("from") && params.get("to") ? `${params.get("from")} → ${params.get("to")}` : "All routes"}
                        title={outboundCount == null ? "Finding flights..." : `Showing ${outboundCount} flight match${outboundCount === 1 ? "" : "es"}`}
                        sortOptions={FLIGHT_SORTS}
                        sort={params.get("sort") || "departure"}
                        onSortChange={(value) => update({ sort: value === "departure" ? "" : value })}
                    />
                    <FormAlert>{error}</FormAlert>
                    <FlightResults
                        title={roundTrip ? "Outbound" : null}
                        query={outbound}
                        detailQuery={detailQuery}
                        page={page}
                        onPage={(p) => update({ page: p }, true)}
                        onCount={setOutboundCount}
                    />
                    {roundTrip && (
                        <FlightResults
                            title={`Return · ${params.get("to")} → ${params.get("from")}`}
                            query={inbound}
                            detailQuery={detailQuery}
                            page={returnPage}
                            onPage={(p) => update({ rpage: p }, true)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Flights;
