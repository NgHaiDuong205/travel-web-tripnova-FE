import { Link } from "react-router-dom";
import { useT } from "../../i18n/I18nContext";
import { formatMoney } from "../../utils/formatters";
import FavoriteButton from "../common/FavoriteButton";

const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";

function HotelListCard({ hotel }) {
    const t = useT();
    const imageSrc = hotel.imageUrl || PLACEHOLDER_IMAGE;
    const location = [hotel.destinationName, hotel.countryName]
        .filter(Boolean)
        .join(", ");
    const remaining =
        hotel.remainingRooms != null ? Number(hotel.remainingRooms) : null;
    const showRemaining = remaining != null && !Number.isNaN(remaining);

    return (
        <article className="bg-surface-container-lowest rounded-xl overflow-hidden group hover:shadow-2xl hover:shadow-on-surface/5 transition-all duration-500 flex flex-col">
            <Link
                to={`/hotel/${hotel.id}`}
                className="relative aspect-[4/3] overflow-hidden block"
            >
                <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={hotel.name || t("hotels.card.hotelAlt")}
                    src={imageSrc}
                    loading="lazy"
                />
                {hotel.starRating != null && (
                    <div className="absolute top-4 left-4">
                        <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                            {t("hotels.filters.starRatingValue", { count: hotel.starRating })}
                        </span>
                    </div>
                )}
                {showRemaining && (
                    <div className="absolute top-4 right-4">
                        <span
                            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md ${
                                remaining === 0
                                    ? "bg-red-600 text-white"
                                    : "bg-white/95 text-primary"
                            }`}
                        >
                            {remaining === 0
                                ? t("hotels.card.noRoomsLeft")
                                : t("hotels.card.roomsLeft", { count: remaining })}
                        </span>
                    </div>
                )}
                <div className="absolute bottom-4 right-4">
                    <FavoriteButton itemType="hotel" itemId={hotel.id} />
                </div>
            </Link>
            <div className="p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2 gap-4">
                    <div className="min-w-0">
                        <h3 className="text-xl font-bold text-primary mb-1 truncate">
                            {hotel.name}
                        </h3>
                        {location && (
                            <div className="flex items-center gap-1 text-on-surface-variant">
                                <span className="material-symbols-outlined text-sm shrink-0">
                                    location_on
                                </span>
                                <span className="text-xs font-medium truncate">
                                    {location}
                                </span>
                            </div>
                        )}
                    </div>
                    {hotel.starRating != null && (
                        <div className="flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed px-2 py-1 rounded shrink-0">
                            <span
                                className="material-symbols-outlined text-xs"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                star
                            </span>
                            <span className="text-xs font-bold">
                                {hotel.starRating}
                            </span>
                        </div>
                    )}
                </div>
                {hotel.description && (
                    <p className="text-sm text-on-surface-variant leading-relaxed mt-4 line-clamp-2">
                        {hotel.description}
                    </p>
                )}
                {showRemaining && (
                    <div
                        className={`flex items-center gap-2 mt-4 px-3 py-2 rounded-lg text-sm font-semibold ${
                            remaining === 0
                                ? "bg-red-50 text-red-700"
                                : "bg-primary-container/30 text-primary"
                        }`}
                    >
                        <span className="material-symbols-outlined text-base shrink-0">
                            meeting_room
                        </span>
                        <span>
                            {remaining === 0
                                ? t("hotels.card.noRoomsForDates")
                                : t("hotels.card.roomsForDates", { count: remaining })}
                        </span>
                    </div>
                )}
                {hotel.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {hotel.amenities.slice(0, 4).map((amenity) => (
                            <span
                                key={amenity}
                                className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded"
                            >
                                {amenity}
                            </span>
                        ))}
                    </div>
                )}
                <div className="mt-auto pt-8 flex items-end justify-between gap-4">
                    <div>
                        {hotel.pricePerNight != null ? (
                            <>
                                <span className="text-[10px] uppercase font-bold text-outline tracking-widest block mb-1">
                                    {t("hotels.card.startingFrom")}
                                </span>
                                <span className="text-2xl font-black text-primary">
                                    {formatMoney(hotel.pricePerNight, "USD")}
                                    <span className="text-sm font-medium text-on-surface-variant">
                                        {t("common.units.perNight")}
                                    </span>
                                </span>
                            </>
                        ) : !showRemaining && hotel.totalRooms != null ? (
                            <span className="text-sm text-on-surface-variant font-medium">
                                {t("hotels.card.roomsAvailable", { count: hotel.totalRooms })}
                            </span>
                        ) : null}
                    </div>
                    <Link
                        to={`/hotel/${hotel.id}`}
                        className="text-primary font-bold text-sm border-b-2 border-primary/20 hover:border-primary transition-all pb-1 shrink-0"
                    >
                        {t("common.actions.viewDetails")}
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default HotelListCard;
