import CatalogHero from "../../../components/catalog/CatalogHero";
import { useT } from "../../../i18n/I18nContext";

const HERO_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=2000&q=80";

/** Trang lên kế hoạch chuyến đi bằng AI — hiện mới có phần đầu trang, tính năng làm sau (/api/ai/*). */
function AiPlanner() {
    const t = useT();
    return (
        <main>
            <CatalogHero
                image={HERO_IMAGE}
                alt={t("planner.hero.imageAlt")}
                eyebrow={t("planner.hero.eyebrow")}
                title={t("planner.hero.title")}
                subtitle={t("planner.hero.subtitle")}
                heightClass="md:h-[520px]"
            >
                <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 backdrop-blur-md border border-white/30 px-4 py-2 text-sm font-bold text-white">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    {t("planner.hero.comingSoon")}
                </span>
            </CatalogHero>
        </main>
    );
}

export default AiPlanner;
