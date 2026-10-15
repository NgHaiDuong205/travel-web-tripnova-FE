import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchRecommendations } from "../../services/recommendationService";
import { useT } from "../../i18n/I18nContext";
import RecommendationCard from "./RecommendationCard";

/**
 * "Dành cho bạn" (trang chủ, chỉ khi đăng nhập): gợi ý theo yêu thích / đặt chỗ / lịch trình / lượt xem.
 * Chưa có tín hiệu thì BE trả mục phổ biến → đổi tiêu đề. Không có gì / lỗi → không hiện.
 */
function ForYouSection() {
    const t = useT();
    const { isLoggedIn, user } = useAuth();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!isLoggedIn) {
            setItems([]);
            return undefined;
        }
        let cancelled = false;
        fetchRecommendations({ type: "all", limit: 8 })
            .then((data) => !cancelled && setItems(data))
            .catch(() => !cancelled && setItems([]));
        return () => {
            cancelled = true;
        };
    }, [isLoggedIn, user?.id]);

    if (!isLoggedIn || items.length === 0) return null;
    const personal = items.some((item) => item.reason !== "popular");
    return (
        <section className="py-24 bg-surface px-8" data-testid="for-you">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-14">
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold tracking-widest uppercase text-primary mb-3">
                        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                        {t("home.forYou.eyebrow")}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-headline font-extrabold mb-4 tracking-tight">
                        {personal ? t("home.forYou.title") : t("home.forYou.titlePopular")}
                    </h2>
                    <p className="text-on-surface-variant max-w-xl mx-auto">
                        {personal ? t("home.forYou.description") : t("home.forYou.descriptionPopular")}
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <RecommendationCard key={`${item.entityType}-${item.entityId}`} item={item} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default ForYouSection;
