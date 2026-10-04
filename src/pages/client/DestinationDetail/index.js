import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import DestinationLiveSections from "../../../components/client/DestinationLiveSections";
import { getDestinationDetail } from "../../../constants/destinations";
import { fetchDestination, findDestinationByName } from "../../../services/destinationService";
import { useT } from "../../../i18n/I18nContext";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LIVE_HERO_PLACEHOLDER = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80";

// Trang biên tập (slug tĩnh) ↔ tên điểm đến trong DB: có bản ghi thì hiện khách sạn / tour / đánh giá thật.
const CURATED_DB_NAMES = {
    amalfi: "Amalfi Coast",
    agra: "Agra",
    london: "London",
    "cinque-terre": "Cinque Terre",
    fuji: "Mount Fuji",
};

/** Điểm đến thật khớp với trang biên tập: undefined = đang tìm, null = không có. */
function useCuratedMatch(slug) {
    const [match, setMatch] = useState(undefined);
    useEffect(() => {
        const name = CURATED_DB_NAMES[slug];
        if (!name) {
            setMatch(null);
            return undefined;
        }
        let cancelled = false;
        setMatch(undefined);
        findDestinationByName(name)
            .then((d) => !cancelled && setMatch(d))
            .catch(() => !cancelled && setMatch(null));
        return () => {
            cancelled = true;
        };
    }, [slug]);
    return match;
}

function ExperienceCard({ experience, content }) {
    const sizeClass =
        experience.size === "large"
            ? "md:col-span-2 md:row-span-2"
            : experience.size === "wide"
              ? "md:col-span-2"
              : "";

    return (
        <div className={`${sizeClass} relative group overflow-hidden rounded-xl min-h-[280px] md:min-h-0`}>
            <img
                alt={content.alt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={experience.image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className={`absolute bottom-0 left-0 ${experience.size === "small" ? "p-6" : "p-8"}`}>
                {experience.tag && (
                    <p className="font-label text-xs text-tertiary-fixed-dim font-bold tracking-widest uppercase mb-2">
                        {content.tag}
                    </p>
                )}
                <h3
                    className={`text-white font-bold ${experience.size === "small" ? "text-lg" : "text-2xl"}`}
                >
                    {content.title}
                </h3>
            </div>
        </div>
    );
}

function HotelCard({ hotel, content }) {
    return (
        <div className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-xl mb-6 bg-surface-container-highest aspect-[4/5]">
                <img
                    alt={content.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={hotel.image}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-primary">
                    {content.price}
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-headline text-2xl font-bold tracking-tight">{content.name}</h3>
                    <div className="flex items-center space-x-1">
                        <span
                            className="material-symbols-outlined text-tertiary-fixed text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            star
                        </span>
                        <span className="text-sm font-bold">{hotel.rating}</span>
                    </div>
                </div>
                <p className="font-label text-xs text-on-surface-variant font-bold uppercase tracking-widest">
                    {content.location}
                </p>
                <p className="text-on-surface-variant text-sm line-clamp-2">{content.description}</p>
            </div>
        </div>
    );
}

/** Trang điểm đến dựng từ API (/destinations/{uuid}). */
function LiveDestinationDetail({ id }) {
    const t = useT();
    const [state, setState] = useState({ loading: true, destination: null, error: null });

    useEffect(() => {
        let cancelled = false;
        setState({ loading: true, destination: null, error: null });
        fetchDestination(id)
            .then((d) => !cancelled && setState({ loading: false, destination: d, error: null }))
            .catch((err) => !cancelled && setState({ loading: false, destination: null, error: err }));
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (state.loading) {
        return (
            <div className="-mt-20 animate-pulse">
                <div className="h-[60vh] bg-surface-container-high" />
                <div className="max-w-7xl mx-auto px-8 py-16 space-y-4">
                    <div className="h-8 w-1/3 bg-surface-container-high rounded" />
                    <div className="h-24 bg-surface-container-high rounded" />
                </div>
            </div>
        );
    }
    if (!state.destination) {
        const notFound = state.error?.status === 404;
        return (
            <div className="max-w-xl mx-auto px-8 py-32 text-center">
                <span className="material-symbols-outlined text-6xl text-outline mb-4">travel_explore</span>
                <h1 className="font-headline text-2xl font-bold text-primary mb-2">
                    {notFound ? t("destinations.live.notFound") : t("destinations.live.loadError")}
                </h1>
                {!notFound && state.error?.message && <p className="text-sm text-on-surface-variant mb-6">{state.error.message}</p>}
                <Link to="/destinations" className="inline-block mt-4 bg-primary text-on-primary px-6 py-3 rounded-lg font-bold">
                    {t("destinations.detail.backToDestinations")}
                </Link>
            </div>
        );
    }

    const d = state.destination;
    const location = [d.countryName, d.continentName].filter(Boolean).join(" · ");
    return (
        <div className="bg-surface text-on-surface font-body -mt-20">
            <section className="relative h-[min(720px,85vh)] w-full overflow-hidden">
                <img alt={d.name} className="absolute inset-0 w-full h-full object-cover" src={d.coverImageUrl || LIVE_HERO_PLACEHOLDER} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-28 left-0 right-0 px-12 lg:px-24 max-w-7xl mx-auto z-10">
                    <Link
                        to="/destinations"
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white bg-black/30 hover:bg-black/45 backdrop-blur-sm px-4 py-2 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span className="font-label text-xs uppercase tracking-widest font-semibold">
                            {t("destinations.detail.backToDestinations")}
                        </span>
                    </Link>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-12 lg:p-24 max-w-7xl mx-auto">
                    <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-[0.95] mb-6">{d.name}</h1>
                    <div className="flex flex-wrap items-center gap-4">
                        {location && (
                            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-white text-sm font-bold">
                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                {location}
                            </span>
                        )}
                        {d.isPopular && (
                            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-white text-sm font-bold">
                                <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                                {t("destinations.live.popular")}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {d.description && (
                <section className="py-20 px-8">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="font-label text-xs uppercase tracking-[0.2em] text-primary mb-6 font-bold">
                            {t("destinations.live.about", { name: d.name })}
                        </h2>
                        <p className="text-lg text-on-surface-variant leading-relaxed whitespace-pre-line">{d.description}</p>
                    </div>
                </section>
            )}

            <DestinationLiveSections destination={d} />
        </div>
    );
}

function DestinationDetail() {
    const { id } = useParams();
    if (UUID_RE.test(id)) return <LiveDestinationDetail key={id} id={id} />;
    return <CuratedDestinationDetail id={id} />;
}

/** Trang biên tập (slug tĩnh); điểm đến có trong DB thì phần lưu trú dùng dữ liệu thật + đánh giá. */
function CuratedDestinationDetail({ id }) {
    const t = useT();
    const destination = getDestinationDetail(id);
    const liveMatch = useCuratedMatch(id);
    const [email, setEmail] = useState("");

    if (!destination) {
        return <Navigate to="/destinations" replace />;
    }
    const contentKey = `destinations.content.${destination.i18nKey}.detail`;

    const handleNewsletter = (e) => {
        e.preventDefault();
        setEmail("");
    };

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed-dim selection:text-primary -mt-20">
            {/* Hero */}
            <section className="relative h-[min(870px,100vh)] w-full overflow-hidden">
                <img
                    alt={t(`${contentKey}.heroAlt`)}
                    className="absolute inset-0 w-full h-full object-cover"
                    src={destination.heroImage}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                <div className="absolute top-28 left-0 right-0 px-12 lg:px-24 max-w-7xl mx-auto z-10">
                    <Link
                        to="/destinations"
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white bg-black/30 hover:bg-black/45 backdrop-blur-sm px-4 py-2 rounded-full transition-colors group"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span className="font-label text-xs uppercase tracking-widest font-semibold">
                            {t("destinations.detail.backToDestinations")}
                        </span>
                    </Link>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-12 lg:p-24 max-w-7xl mx-auto">
                    <h1 className="font-headline text-6xl md:text-8xl font-extrabold text-white tracking-tighter leading-[0.9] mb-4">
                        {t(`${contentKey}.heroTitle.0`)} <br />
                        {t(`${contentKey}.heroTitle.1`)}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 mt-8">
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-white">
                            <span className="material-symbols-outlined text-tertiary-fixed">star</span>
                            <span className="font-label text-sm font-bold">{t(`${contentKey}.badge`)}</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-white">
                            <span className="material-symbols-outlined">wb_sunny</span>
                            <span className="font-label text-sm font-bold">{t(`${contentKey}.bestTime`)}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Curator's Perspective */}
            <section className="py-24 px-8 bg-surface">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-4">
                        <h2 className="font-label text-xs uppercase tracking-[0.2em] text-primary mb-6 font-bold">
                            {t("destinations.detail.curatorPerspective")}
                        </h2>
                        <p className="font-headline text-3xl font-bold leading-tight text-on-surface">
                            {t(`${contentKey}.curatorQuote`)}
                        </p>
                        <div className="mt-10 p-8 rounded-xl bg-surface-container-low">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                                    <img alt={t("destinations.detail.curatorImageAlt")} src={destination.curator.avatar} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{t(`${contentKey}.curator.name`)}</p>
                                    <p className="text-xs text-on-surface-variant font-medium">
                                        {t(`${contentKey}.curator.role`)}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-on-surface-variant italic leading-relaxed">
                                {t(`${contentKey}.curator.note`)}
                            </p>
                        </div>
                    </div>
                    <div className="lg:col-span-8 space-y-10">
                        <div className="columns-1 md:columns-2 gap-10">
                            {destination.paragraphs.map((paragraph, index) => (
                                <p
                                    key={index}
                                    className="font-body text-lg text-on-surface-variant leading-relaxed mb-8 break-inside-avoid"
                                >
                                    {t(`${contentKey}.paragraphs.${index}`)}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Essential Experiences */}
            <section className="py-24 bg-surface-container-low">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="mb-16">
                        <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-2">
                            {t("destinations.detail.essentialExperiences")}
                        </h2>
                        <p className="text-on-surface-variant">{t("destinations.detail.experiencesDescription")}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[800px]">
                        {destination.experiences.map((exp) => (
                            <ExperienceCard key={exp.title} experience={exp} content={{ tag: exp.tag && t(`${contentKey}.experiences.${destination.experiences.indexOf(exp)}.tag`), title: t(`${contentKey}.experiences.${destination.experiences.indexOf(exp)}.title`), alt: t(`${contentKey}.experiences.${destination.experiences.indexOf(exp)}.alt`) }} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Refined Stays Nearby: dữ liệu thật nếu điểm đến có trong DB, không thì nội dung biên tập */}
            {liveMatch ? (
                <DestinationLiveSections destination={liveMatch} showLandmarks={false} />
            ) : liveMatch === null ? (
                <section className="py-24 bg-surface">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div>
                                <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-2">
                                    {t("destinations.detail.refinedStays")}
                                </h2>
                                <p className="text-on-surface-variant max-w-md">
                                    {t("destinations.detail.staysDescription")}
                                </p>
                            </div>
                            <Link to="/hotels" className="flex items-center space-x-2 text-primary font-bold group">
                                <span>{t("destinations.detail.viewAllAccommodations")}</span>
                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                                    arrow_forward
                                </span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {destination.hotels.map((hotel) => (
                                <HotelCard key={hotel.name} hotel={hotel} content={{ name: t(`${contentKey}.hotels.${destination.hotels.indexOf(hotel)}.name`), location: t(`${contentKey}.hotels.${destination.hotels.indexOf(hotel)}.location`), price: t(`${contentKey}.hotels.${destination.hotels.indexOf(hotel)}.price`), description: t(`${contentKey}.hotels.${destination.hotels.indexOf(hotel)}.description`), alt: t(`${contentKey}.hotels.${destination.hotels.indexOf(hotel)}.alt`) }} />
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}

            {/* Newsletter CTA */}
            <section className="py-24 px-8 pb-32">
                <div className="max-w-7xl mx-auto editorial-gradient rounded-2xl p-12 md:p-24 text-center text-white">
                    <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                        {t("destinations.detail.newsletter.title")}
                    </h2>
                    <p className="text-lg text-primary-fixed-dim max-w-2xl mx-auto mb-10">
                        {t("destinations.detail.newsletter.description")}
                    </p>
                    <form
                        onSubmit={handleNewsletter}
                        className="flex flex-col sm:flex-row justify-center items-center gap-4"
                    >
                        <input
                            className="w-full sm:w-80 bg-white/10 border-0 focus:ring-2 focus:ring-tertiary-fixed-dim rounded-lg px-6 py-4 text-white placeholder:text-white/40"
                            placeholder={t("destinations.detail.newsletter.emailPlaceholder")}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-tertiary-fixed text-on-tertiary-fixed font-bold px-10 py-4 rounded-lg hover:bg-tertiary-fixed-dim transition-colors"
                        >
                            {t("destinations.detail.newsletter.joinNow")}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}

export default DestinationDetail;
