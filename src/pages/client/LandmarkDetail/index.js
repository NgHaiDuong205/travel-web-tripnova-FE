import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import HotelListCard from "../../../components/client/HotelListCard";
import ReviewSection from "../../../components/client/ReviewSection";
import useTrackView from "../../../hooks/useTrackView";
import { fetchDestination, fetchDestinationLandmarks, fetchLandmark } from "../../../services/destinationService";
import { fetchHotels, fetchNearbyHotels } from "../../../services/hotelService";
import { useT } from "../../../i18n/I18nContext";
import { formatMoney } from "../../../utils/formatters";
import { distanceKm, hasCoords, osmEmbed, osmLink } from "../../../utils/geo";
import { categoryLabel, landmarkPath } from "../../../utils/landmarks";

const HERO_FALLBACK = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=2000&q=80";
const NEARBY_COUNT = 6;
const HOTEL_RADIUS_KM = 10;
const BODY_ZOOM = parseFloat(window.getComputedStyle(document.body).zoom) || 1;

function formatKm(km) {
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function InfoRow({ icon, label, children }) {
    return (
        <div className="flex gap-3 py-3 border-b border-outline-variant/15 last:border-b-0">
            <span className="material-symbols-outlined text-primary">{icon}</span>
            <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
                <div className="text-sm text-on-surface break-words">{children}</div>
            </div>
        </div>
    );
}

/**
 * Chi tiết một địa danh: mô tả, thông tin liên hệ, bản đồ (toạ độ geocode), địa điểm cùng điểm đến gần nhất,
 * khách sạn quanh đó (/api/hotels/nearby/) và đánh giá (posts entityType=landmark).
 */
function LandmarkDetail() {
    const t = useT();
    const { id: destinationId, landmarkId } = useParams();
    useTrackView("landmark", landmarkId);
    const [state, setState] = useState({ loading: true, error: false, landmark: null, destination: null, siblings: [] });
    const [hotels, setHotels] = useState({ loading: true, items: [], nearby: false });

    useEffect(() => {
        let cancelled = false;
        setState((s) => ({ ...s, loading: true, error: false }));
        window.scrollTo(0, 0);
        Promise.all([
            fetchLandmark(destinationId, landmarkId),
            fetchDestination(destinationId).catch(() => null),
            fetchDestinationLandmarks(destinationId).catch(() => []),
        ])
            .then(([landmark, destination, siblings]) => {
                if (!cancelled) setState({ loading: false, error: false, landmark, destination, siblings });
            })
            .catch(() => !cancelled && setState({ loading: false, error: true, landmark: null, destination: null, siblings: [] }));
        return () => {
            cancelled = true;
        };
    }, [destinationId, landmarkId]);

    const { landmark, destination, siblings } = state;

    // khách sạn: có toạ độ → quanh địa danh (kèm khoảng cách), không thì khách sạn của điểm đến
    useEffect(() => {
        if (!landmark) return undefined;
        let cancelled = false;
        setHotels({ loading: true, items: [], nearby: false });
        const load = hasCoords(landmark)
            ? fetchNearbyHotels(landmark.latitude, landmark.longitude, { radiusKm: HOTEL_RADIUS_KM, limit: NEARBY_COUNT }).then((items) => ({ items, nearby: true }))
            : fetchHotels({ destinationId, page: 1, limit: 3 }).then((r) => ({ items: r.items, nearby: false }));
        load
            .then((res) => !cancelled && setHotels({ loading: false, ...res }))
            .catch(() => !cancelled && setHotels({ loading: false, items: [], nearby: false }));
        return () => {
            cancelled = true;
        };
    }, [landmark, destinationId]);

    // địa điểm khác cùng điểm đến: gần nhất theo toạ độ, không có toạ độ thì ưu tiên cùng loại
    const nearbyPlaces = useMemo(() => {
        if (!landmark) return [];
        const others = siblings.filter((x) => x.id !== landmark.id);
        if (hasCoords(landmark)) {
            return others
                .filter(hasCoords)
                .map((x) => ({ ...x, km: distanceKm(landmark.latitude, landmark.longitude, x.latitude, x.longitude) }))
                .sort((a, b) => a.km - b.km)
                .slice(0, NEARBY_COUNT);
        }
        return [...others.filter((x) => x.category === landmark.category), ...others.filter((x) => x.category !== landmark.category)].slice(0, NEARBY_COUNT);
    }, [landmark, siblings]);

    if (state.loading) {
        return (
            <div className="animate-pulse">
                <div className="h-[420px] bg-surface-container-high" />
                <div className="max-w-7xl mx-auto px-8 py-12 grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 h-64 rounded-xl bg-surface-container-high" />
                    <div className="h-64 rounded-xl bg-surface-container-high" />
                </div>
            </div>
        );
    }

    if (state.error || !landmark) {
        return (
            <div className="pt-12 pb-24 text-center px-8">
                <span className="material-symbols-outlined text-5xl text-outline mb-4">travel_explore</span>
                <h1 className="font-headline text-3xl font-bold text-primary mb-4">{t("destinations.landmarkDetail.notFound")}</h1>
                <Link to={`/destinations/${destinationId}`} className="text-primary font-bold hover:underline">
                    {t("destinations.landmarkDetail.backToDestination")}
                </Link>
            </div>
        );
    }

    const coords = hasCoords(landmark);
    const destinationName = destination?.name;
    const place = [destinationName, destination?.countryName].filter(Boolean).join(", ");

    return (
        <div className="bg-surface text-on-surface">
            {/* Hero */}
            <section className="relative h-[420px] overflow-hidden">
                <img src={landmark.coverImageUrl || HERO_FALLBACK} alt={landmark.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
                <div className="absolute top-6 inset-x-0 max-w-7xl mx-auto px-8 z-10">
                    <Link
                        to={`/destinations/${destinationId}`}
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white bg-black/30 hover:bg-black/45 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        {destinationName ? t("destinations.landmarkDetail.backTo", { name: destinationName }) : t("destinations.landmarkDetail.backToDestination")}
                    </Link>
                </div>
                <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-8 pb-10">
                    {landmark.category && (
                        <span className="block w-fit bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-3">
                            {categoryLabel(t, landmark.category)}
                        </span>
                    )}
                    <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-white tracking-tight">{landmark.name}</h1>
                    {place && (
                        <p className="mt-3 flex items-center gap-1 text-white/85">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            {place}
                        </p>
                    )}
                </div>
            </section>

            {/* Mô tả + thông tin */}
            <section className="max-w-7xl mx-auto px-8 py-14 grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <h2 className="font-headline text-2xl font-bold text-primary mb-4">{t("destinations.landmarkDetail.about")}</h2>
                    {landmark.description ? (
                        <div className="text-on-surface-variant leading-relaxed whitespace-pre-line">{landmark.description}</div>
                    ) : (
                        <p className="text-on-surface-variant">{t("destinations.landmarkDetail.noDescription")}</p>
                    )}

                    {coords && (
                        <div className="mt-10">
                            <h2 className="font-headline text-2xl font-bold text-primary mb-4">{t("destinations.landmarkDetail.map")}</h2>
                            <div className="rounded-xl overflow-hidden border border-outline-variant/20 h-96">
                                {/* body có zoom 0.75 toàn site → bù zoom cho iframe (kích thước %, không bị nhân), giống Globe3D */}
                                <div style={{ zoom: 1 / BODY_ZOOM, width: "100%", height: "100%" }}>
                                    <iframe
                                        title={t("destinations.landmarkDetail.map")}
                                        src={osmEmbed(landmark.latitude, landmark.longitude)}
                                        className="w-full h-full border-0"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-on-surface-variant">{t("destinations.landmarkDetail.mapNote")}</p>
                        </div>
                    )}
                </div>

                <aside className="bg-surface-container-low rounded-xl p-6 h-fit lg:sticky lg:top-28">
                    <h2 className="font-headline text-lg font-bold mb-2">{t("destinations.landmarkDetail.info")}</h2>
                    {landmark.address && (
                        <InfoRow icon="location_on" label={t("destinations.landmarkDetail.address")}>{landmark.address}</InfoRow>
                    )}
                    {landmark.openingHours && (
                        <InfoRow icon="schedule" label={t("destinations.landmarkDetail.openingHours")}>{landmark.openingHours}</InfoRow>
                    )}
                    {landmark.entryFee != null && (
                        <InfoRow icon="confirmation_number" label={t("destinations.landmarkDetail.entryFee")}>
                            {Number(landmark.entryFee) > 0 ? formatMoney(landmark.entryFee) : t("destinations.live.freeEntry")}
                        </InfoRow>
                    )}
                    {landmark.phone && (
                        <InfoRow icon="call" label={t("destinations.landmarkDetail.phone")}>
                            <a href={`tel:${landmark.phone.replace(/[^\d+]/g, "")}`} className="text-primary hover:underline">{landmark.phone}</a>
                        </InfoRow>
                    )}
                    {landmark.website && (
                        <InfoRow icon="language" label={t("destinations.landmarkDetail.website")}>
                            <a href={landmark.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {landmark.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                            </a>
                        </InfoRow>
                    )}
                    {coords && (
                        <a
                            href={osmLink(landmark.latitude, landmark.longitude)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded-lg font-bold hover:bg-primary-container"
                        >
                            <span className="material-symbols-outlined text-base">map</span>
                            {t("destinations.landmarkDetail.openMap")}
                        </a>
                    )}
                </aside>
            </section>

            {/* Địa điểm gần đó */}
            {nearbyPlaces.length > 0 && (
                <section className="bg-surface-container-low py-16">
                    <div className="max-w-7xl mx-auto px-8">
                        <h2 className="font-headline text-3xl font-extrabold tracking-tight mb-2">{t("destinations.landmarkDetail.nearbyPlaces")}</h2>
                        <p className="text-on-surface-variant mb-8">{t("destinations.landmarkDetail.nearbyPlacesSubtitle", { name: destinationName || "" })}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {nearbyPlaces.map((p) => (
                                <Link
                                    key={p.id}
                                    to={landmarkPath(p)}
                                    className="group bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 flex hover:shadow-lg transition-shadow"
                                >
                                    {p.coverImageUrl && (
                                        <img src={p.coverImageUrl} alt={p.name} loading="lazy" className="w-28 h-auto object-cover shrink-0" />
                                    )}
                                    <div className="p-4 min-w-0">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{categoryLabel(t, p.category)}</span>
                                        <h3 className="font-headline font-bold text-on-surface group-hover:text-primary line-clamp-2">{p.name}</h3>
                                        {p.km != null && (
                                            <p className="mt-1 text-xs text-on-surface-variant flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">near_me</span>
                                                {t("destinations.landmarkDetail.away", { distance: formatKm(p.km) })}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Khách sạn */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-8">
                    <h2 className="font-headline text-3xl font-extrabold tracking-tight mb-2">
                        {hotels.nearby ? t("destinations.landmarkDetail.nearbyHotels") : t("destinations.live.hotelsTitle", { name: destinationName || "" })}
                    </h2>
                    {hotels.nearby && (
                        <p className="text-on-surface-variant mb-8">{t("destinations.landmarkDetail.nearbyHotelsSubtitle", { km: HOTEL_RADIUS_KM })}</p>
                    )}
                    {hotels.loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
                            {[0, 1, 2].map((i) => <div key={i} className="h-80 rounded-xl bg-surface-container-high" />)}
                        </div>
                    ) : hotels.items.length === 0 ? (
                        <p className="text-on-surface-variant">{t("destinations.landmarkDetail.noHotels")}</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {hotels.items.map((hotel) => (
                                <div key={hotel.id} className="flex flex-col gap-2">
                                    {hotel.distanceKm != null && (
                                        <span className="text-xs font-bold text-primary flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">near_me</span>
                                            {t("destinations.landmarkDetail.away", { distance: formatKm(hotel.distanceKm) })}
                                        </span>
                                    )}
                                    <HotelListCard hotel={hotel} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <ReviewSection entityType="landmark" entityId={landmark.id} title={t("destinations.landmarkDetail.reviewsTitle")} />
        </div>
    );
}

export default LandmarkDetail;
