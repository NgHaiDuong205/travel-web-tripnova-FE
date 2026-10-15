import { useEffect, useState } from "react";
import { fetchSimilarHotels } from "../../services/recommendationService";
import { useT } from "../../i18n/I18nContext";
import RecommendationCard from "./RecommendationCard";

/** "Khách sạn tương tự" trên trang khách sạn: cùng điểm đến, gần giá / hạng sao / tiện nghi / vị trí. */
function SimilarHotels({ hotelId }) {
    const t = useT();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!hotelId) return undefined;
        let cancelled = false;
        fetchSimilarHotels(hotelId, 4)
            .then((data) => !cancelled && setItems(data))
            .catch(() => !cancelled && setItems([]));
        return () => {
            cancelled = true;
        };
    }, [hotelId]);

    if (items.length === 0) return null;
    return (
        <section className="max-w-screen-xl mx-auto px-8 mb-24" data-testid="similar-hotels">
            <h2 className="text-3xl font-headline font-bold mb-2">{t("home.forYou.similarHotels.title")}</h2>
            <p className="text-on-surface-variant mb-8">{t("home.forYou.similarHotels.description")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item) => (
                    <RecommendationCard key={item.entityId} item={item} showReason={false} />
                ))}
            </div>
        </section>
    );
}

export default SimilarHotels;
