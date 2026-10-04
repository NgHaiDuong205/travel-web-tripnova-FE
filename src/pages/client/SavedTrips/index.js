import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import FormAlert from "../../../components/common/FormAlert";
import { fetchFavorites, removeFavorite } from "../../../services/favoriteService";
import { formatDate, formatDateTime, formatMoney } from "../../../utils/formatters";
import { useT } from "../../../i18n/I18nContext";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";
const TABS = [
    { key: "hotel", labelKey: "nav.hotels", icon: "hotel", explore: "/hotels", exploreKey: "trips.savedTrips.exploreHotels" },
    { key: "tour", labelKey: "nav.tours", icon: "tour", explore: "/tours", exploreKey: "trips.savedTrips.exploreTours" },
    { key: "car", labelKey: "nav.cars", icon: "directions_car", explore: "/cars", exploreKey: "trips.savedTrips.exploreCars" },
    { key: "flight", labelKey: "nav.flights", icon: "flight", explore: "/flights", exploreKey: "trips.savedTrips.exploreFlights" },
];

/** Thông tin hiển thị thẻ tour / xe / chuyến bay đã lưu (null khi mục không còn tồn tại). */
function describe(fav, t) {
    if (fav.itemType === "tour" && fav.tour) {
        const tour = fav.tour;
        return {
            to: `/tours/${fav.itemId}`,
            title: tour.name,
            image: tour.coverImageUrl,
            line: [tour.destinationName, tour.countryName].filter(Boolean).join(", "),
            badge: tour.durationDays ? t("common.units.day", { count: tour.durationDays }) : null,
            price: t("trips.savedTrips.pricePerAdult", { price: formatMoney(tour.priceAdult, tour.currencyCode) }),
        };
    }
    if (fav.itemType === "car" && fav.car) {
        const c = fav.car;
        return {
            to: `/cars/${fav.itemId}`,
            title: c.name,
            image: c.coverImageUrl,
            line: [c.brand, c.model, c.seats ? t("trips.savedTrips.seats", { count: c.seats }) : null].filter(Boolean).join(" · "),
            badge: c.carType,
            price: t("trips.savedTrips.pricePerDay", { price: formatMoney(c.pricePerDay, c.currencyCode) }),
        };
    }
    if (fav.itemType === "flight" && fav.flight) {
        const f = fav.flight;
        return {
            to: `/flights/${fav.itemId}`,
            title: `${f.airline} ${f.flightNumber}`,
            image: f.airlineLogoUrl,
            line: `${f.departureAirportCode} → ${f.arrivalAirportCode} · ${formatDateTime(f.departureTime)}`,
            badge: f.cabinClasses?.length ? f.cabinClasses.join(" / ") : null,
            price: t("trips.savedTrips.fromPrice", { price: formatMoney(f.fromPrice ?? f.basePrice, f.currencyCode) }),
        };
    }
    return null;
}

function SavedTrips() {
    const t = useT();
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = TABS.find((t) => t.key === searchParams.get("tab")) || TABS[0];
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setFavorites(await fetchFavorites(tab.key));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [tab.key]);

    useEffect(() => {
        load();
    }, [load]);

    const handleRemove = async (favoriteId) => {
        try {
            await removeFavorite(favoriteId);
            setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <DashboardLayout>
            <section className="mb-12">
                <span className="text-[0.75rem] uppercase tracking-[0.2em] text-on-tertiary-fixed-variant mb-2 block">
                    {t("trips.savedTrips.eyebrow")}
                </span>
                <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-4">{t("nav.sidebar.savedTrips")}</h1>
                <p className="text-on-surface-variant text-lg leading-relaxed">
                    {t("trips.savedTrips.subtitle")}
                </p>
            </section>

            <div className="flex flex-wrap gap-2 mb-10">
                {TABS.map((tabOption) => (
                    <button
                        key={tabOption.key}
                        type="button"
                        onClick={() => setSearchParams(tabOption.key === "hotel" ? {} : { tab: tabOption.key })}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-colors ${
                            tabOption.key === tab.key
                                ? "bg-primary text-white"
                                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">{tabOption.icon}</span>
                        {t(tabOption.labelKey)}
                    </button>
                ))}
            </div>

            <FormAlert>{error}</FormAlert>

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                    {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="h-80 bg-surface-container-high rounded-xl animate-pulse" />
                    ))}
                </div>
            )}

            {!loading && favorites.length === 0 && !error && (
                <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-outline mb-3">favorite</span>
                    <p className="text-on-surface-variant mb-6">
                        {t("trips.savedTrips.empty")}
                    </p>
                    <Link to={tab.explore} className="bg-primary text-white px-6 py-3 rounded-lg font-bold">
                        {t(tab.exploreKey)}
                    </Link>
                </div>
            )}

            {!loading && favorites.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                    {favorites.map((fav) => {
                        if (fav.itemType !== "hotel") return <SavedItemCard key={fav.id} fav={fav} onRemove={handleRemove} />;
                        const hotel = fav.hotel;
                        return (
                            <div key={fav.id} className="group">
                                <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_8px_48px_rgba(27,28,28,0.06)] transition-transform duration-500 hover:-translate-y-2">
                                    <Link to={`/hotel/${fav.itemId}`} className="block aspect-[4/3] overflow-hidden">
                                        <img
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            alt={hotel?.name || t("trips.savedTrips.hotel")}
                                            src={hotel?.coverImageUrl || PLACEHOLDER_IMAGE}
                                            loading="lazy"
                                        />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(fav.id)}
                                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                                        aria-label={t("trips.favorite.removeFromSaved")}
                                        title={t("trips.favorite.removeFromSaved")}
                                    >
                                        <span
                                            className="material-symbols-outlined text-red-500"
                                            style={{ fontVariationSettings: "'FILL' 1" }}
                                        >
                                            favorite
                                        </span>
                                    </button>
                                    {hotel?.starRating != null && (
                                        <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                            {t("trips.savedTrips.starRating", { count: hotel.starRating })}
                                        </span>
                                    )}
                                    <div className="p-6">
                                        <Link
                                            to={`/hotel/${fav.itemId}`}
                                            className="text-xl font-bold text-primary hover:underline block truncate"
                                        >
                                            {hotel?.name || t("trips.savedTrips.hotelNoLongerAvailable")}
                                        </Link>
                                        <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1 truncate">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {[hotel?.destinationName, hotel?.countryName].filter(Boolean).join(", ") ||
                                                hotel?.address}
                                        </p>
                                        {hotel?.amenities?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {hotel.amenities.slice(0, 4).map((a) => (
                                                    <span
                                                        key={a}
                                                        className="text-[10px] font-bold uppercase tracking-wide bg-surface-container-low text-on-surface-variant px-2 py-1 rounded"
                                                    >
                                                        {a}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-xs text-on-surface-variant mt-4">{t("trips.savedTrips.savedOn", { date: formatDate(fav.createdAt) })}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <div className="h-24"></div>
        </DashboardLayout>
    );
}

function SavedItemCard({ fav, onRemove }) {
    const t = useT();
    const info = describe(fav, t);
    return (
        <div className="group">
            <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_8px_48px_rgba(27,28,28,0.06)] transition-transform duration-500 hover:-translate-y-2">
                <Link to={info?.to || "#"} className="block aspect-[4/3] overflow-hidden bg-surface-container-low">
                    {fav.itemType === "flight" && !info?.image ? (
                        // Hãng bay thường không có logo — dùng biểu tượng thay vì ảnh khách sạn mẫu.
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-fixed/40 to-surface-container-low">
                            <span className="material-symbols-outlined text-primary text-7xl">flight_takeoff</span>
                        </div>
                    ) : (
                        <img
                            className={`w-full h-full group-hover:scale-105 transition-transform duration-700 ${
                                fav.itemType === "flight" ? "object-contain p-12" : "object-cover"
                            }`}
                            alt={info?.title || fav.itemType}
                            src={info?.image || PLACEHOLDER_IMAGE}
                            loading="lazy"
                        />
                    )}
                </Link>
                <button
                    type="button"
                    onClick={() => onRemove(fav.id)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label={t("trips.favorite.removeFromSaved")}
                    title={t("trips.favorite.removeFromSaved")}
                >
                    <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                        favorite
                    </span>
                </button>
                {info?.badge && (
                    <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        {info.badge}
                    </span>
                )}
                <div className="p-6">
                    {info ? (
                        <Link to={info.to} className="text-xl font-bold text-primary hover:underline block truncate">
                            {info.title}
                        </Link>
                    ) : (
                        <p className="text-xl font-bold text-on-surface-variant truncate">{t("trips.savedTrips.itemNoLongerAvailable")}</p>
                    )}
                    {info?.line && <p className="text-sm text-on-surface-variant mt-1 truncate">{info.line}</p>}
                    {info?.price && <p className="text-sm font-bold text-on-surface mt-4">{info.price}</p>}
                    <p className="text-xs text-on-surface-variant mt-4">{t("trips.savedTrips.savedOn", { date: formatDate(fav.createdAt) })}</p>
                </div>
            </div>
        </div>
    );
}

export default SavedTrips;
