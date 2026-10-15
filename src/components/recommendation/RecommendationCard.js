import { Link } from "react-router-dom";
import { useT } from "../../i18n/I18nContext";
import { formatMoney } from "../../utils/formatters";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80";
const TYPE_ICONS = { hotel: "hotel", tour: "tour", destination: "travel_explore", landmark: "attractions", car: "directions_car" };

/** Ảnh Unsplash gốc (không tham số) nặng vài MB → xin bản rộng 800px. */
function cardImage(url) {
    if (!url) return FALLBACK_IMAGE;
    return /^https:\/\/images\.unsplash\.com\/[^?]+$/.test(url) ? `${url}?w=800&q=80` : url;
}

/** Đường dẫn trang chi tiết theo loại. */
export function recommendationPath(item) {
    switch (item.entityType) {
        case "hotel":
            return `/hotel/${item.entityId}`;
        case "tour":
            return `/tours/${item.entityId}`;
        case "car":
            return `/cars/${item.entityId}`;
        case "destination":
            return `/destinations/${item.entityId}`;
        case "landmark":
            return `/destinations/${item.destinationId}/landmarks/${item.entityId}`;
        default:
            return "/";
    }
}

function reasonText(t, item) {
    switch (item.reason) {
        case "upcoming_trip":
            return t("home.forYou.reasons.upcomingTrip", { destination: item.destinationName });
        case "liked_destination":
            return t("home.forYou.reasons.likedDestination", { destination: item.destinationName });
        case "similar_destination":
            return t("home.forYou.reasons.similarDestination");
        case "popular":
            return t("home.forYou.reasons.popular");
        default:
            return null;
    }
}

function priceText(t, item) {
    if (item.price == null || Number(item.price) <= 0) return null;
    const money = formatMoney(item.price, "USD");
    if (item.entityType === "hotel") return t("home.forYou.price.perNight", { price: money });
    if (item.entityType === "car") return t("home.forYou.price.perDay", { price: money });
    if (item.entityType === "tour") return t("home.forYou.price.perPerson", { price: money });
    return null;
}

/** Thẻ gợi ý: ảnh, loại, lý do gợi ý, tên, nơi, giá / sao / review. */
function RecommendationCard({ item, showReason = true }) {
    const t = useT();
    const reason = showReason ? reasonText(t, item) : null;
    const price = priceText(t, item);
    return (
        <Link
            to={recommendationPath(item)}
            className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
            data-testid="recommendation-card"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={item.name}
                    loading="lazy"
                    src={cardImage(item.imageUrl)}
                />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/90 backdrop-blur-md text-gray-900 px-2.5 py-1 rounded-full text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[14px]">{TYPE_ICONS[item.entityType] || "place"}</span>
                    {t(`home.forYou.types.${item.entityType}`)}
                </span>
                {item.rating != null && (
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] font-bold text-gray-900">
                        <span className="material-symbols-outlined text-yellow-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        {item.rating.toFixed(1)} ({item.reviewCount})
                    </span>
                )}
            </div>
            <div className="p-5 flex flex-col gap-2 flex-1">
                {reason && (
                    <span className="self-start inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                        {reason}
                    </span>
                )}
                <h3 className="font-headline font-bold text-lg leading-snug line-clamp-2">{item.name}</h3>
                <p className="text-sm text-on-surface-variant flex items-center gap-1 min-w-0">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span className="truncate">{item.destinationName}</span>
                    {item.distanceKm != null && <span className="shrink-0">· {t("home.forYou.distance", { km: item.distanceKm })}</span>}
                </p>
                <div className="mt-auto pt-2 flex items-center justify-between gap-2 text-sm">
                    <span>
                        {item.starRating ? <span className="text-amber-500">{"★".repeat(Math.min(5, item.starRating))}</span> : null}
                        {item.durationDays ? (
                            <span className="text-on-surface-variant">{t("home.forYou.days", { count: item.durationDays })}</span>
                        ) : null}
                    </span>
                    {price && <span className="font-bold text-on-surface">{price}</span>}
                </div>
            </div>
        </Link>
    );
}

export default RecommendationCard;
