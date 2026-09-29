import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import FormAlert from "../../../components/common/FormAlert";
import { fetchFavorites, removeFavorite } from "../../../services/favoriteService";
import { formatDate, formatDateTime, formatMoney } from "../../../utils/formatters";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";
const TABS = [
    { key: "hotel", label: "Hotels", icon: "hotel", explore: "/hotels" },
    { key: "tour", label: "Tours", icon: "tour", explore: "/tours" },
    { key: "car", label: "Cars", icon: "directions_car", explore: "/cars" },
    { key: "flight", label: "Flights", icon: "flight", explore: "/flights" },
];

/** Thông tin hiển thị thẻ tour / xe / chuyến bay đã lưu (null khi mục không còn tồn tại). */
function describe(fav) {
    if (fav.itemType === "tour" && fav.tour) {
        const t = fav.tour;
        return {
            to: `/tours/${fav.itemId}`,
            title: t.name,
            image: t.coverImageUrl,
            line: [t.destinationName, t.countryName].filter(Boolean).join(", "),
            badge: t.durationDays ? `${t.durationDays} days` : null,
            price: `${formatMoney(t.priceAdult, t.currencyCode)} / adult`,
        };
    }
    if (fav.itemType === "car" && fav.car) {
        const c = fav.car;
        return {
            to: `/cars/${fav.itemId}`,
            title: c.name,
            image: c.coverImageUrl,
            line: [c.brand, c.model, c.seats ? `${c.seats} seats` : null].filter(Boolean).join(" · "),
            badge: c.carType,
            price: `${formatMoney(c.pricePerDay, c.currencyCode)} / day`,
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
            price: `from ${formatMoney(f.fromPrice ?? f.basePrice, f.currencyCode)}`,
        };
    }
    return null;
}

function SavedTrips() {
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
                    Curated Collection
                </span>
                <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-4">Saved Trips</h1>
                <p className="text-on-surface-variant text-lg leading-relaxed">
                    Khách sạn, tour, xe và chuyến bay bạn đã lưu để đặt sau.
                </p>
            </section>

            <div className="flex flex-wrap gap-2 mb-10">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setSearchParams(t.key === "hotel" ? {} : { tab: t.key })}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-colors ${
                            t.key === tab.key
                                ? "bg-primary text-white"
                                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                        {t.label}
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
                        Chưa có mục nào được lưu. Bấm biểu tượng trái tim trên trang chi tiết để lưu.
                    </p>
                    <Link to={tab.explore} className="bg-primary text-white px-6 py-3 rounded-lg font-bold">
                        Explore {tab.label.toLowerCase()}
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
                                            alt={hotel?.name || "Hotel"}
                                            src={hotel?.coverImageUrl || PLACEHOLDER_IMAGE}
                                            loading="lazy"
                                        />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(fav.id)}
                                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                                        aria-label="Remove from saved"
                                        title="Remove from saved"
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
                                            {hotel.starRating} Star
                                        </span>
                                    )}
                                    <div className="p-6">
                                        <Link
                                            to={`/hotel/${fav.itemId}`}
                                            className="text-xl font-bold text-primary hover:underline block truncate"
                                        >
                                            {hotel?.name || "Khách sạn không còn tồn tại"}
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
                                        <p className="text-xs text-on-surface-variant mt-4">Saved {formatDate(fav.createdAt)}</p>
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
    const info = describe(fav);
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
                    aria-label="Remove from saved"
                    title="Remove from saved"
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
                        <p className="text-xl font-bold text-on-surface-variant truncate">Mục này không còn tồn tại</p>
                    )}
                    {info?.line && <p className="text-sm text-on-surface-variant mt-1 truncate">{info.line}</p>}
                    {info?.price && <p className="text-sm font-bold text-on-surface mt-4">{info.price}</p>}
                    <p className="text-xs text-on-surface-variant mt-4">Saved {formatDate(fav.createdAt)}</p>
                </div>
            </div>
        </div>
    );
}

export default SavedTrips;
