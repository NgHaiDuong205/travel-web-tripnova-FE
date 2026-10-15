import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import RoomSearchPanel from "../../../components/client/RoomSearchPanel";
import RoomCard from "../../../components/client/RoomCard";
import FavoriteButton from "../../../components/common/FavoriteButton";
import ReviewSection from "../../../components/client/ReviewSection";
import SimilarHotels from "../../../components/recommendation/SimilarHotels";
import useTrackView from "../../../hooks/useTrackView";
import PhotoLightbox from "../../../components/common/PhotoLightbox";
import HotelPendingNotice from "../../../components/client/HotelPendingNotice";
import { filterRooms, roomTypeOptionsFrom } from "../../../constants/rooms";
import { fetchHotelById, fetchHotelImages } from "../../../services/hotelService";
import { fetchRooms } from "../../../services/roomService";
import { useT } from "../../../i18n/I18nContext";
import { formatMoney } from "../../../utils/formatters";
import { fromDisplayToUsd } from "../../../utils/currency";

const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80";
// Ô phụ khi khách sạn chưa có đủ ảnh gallery
const FALLBACK_SIDE_IMAGES = [
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
];

const getAmenityIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("wifi") || lower.includes("internet")) return "wifi";
    if (lower.includes("pool") || lower.includes("swim")) return "pool";
    if (lower.includes("spa") || lower.includes("massage") || lower.includes("sauna")) return "spa";
    if (lower.includes("rest") || lower.includes("din") || lower.includes("food")) return "restaurant";
    if (lower.includes("gym") || lower.includes("fit") || lower.includes("sport")) return "fitness_center";
    if (lower.includes("bar") || lower.includes("drink")) return "local_bar";
    if (lower.includes("park")) return "local_parking";
    if (lower.includes("ac") || lower.includes("air cond")) return "ac_unit";
    if (lower.includes("room service")) return "room_service";
    if (lower.includes("laundry") || lower.includes("wash")) return "local_laundry_service";
    if (lower.includes("pet")) return "pets";
    if (lower.includes("tv") || lower.includes("television")) return "tv";
    return "check_circle"; // fallback icon
};

function HotelDetail() {
    const t = useT();
    const { id: hotelId } = useParams();
    useTrackView("hotel", hotelId);
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const roomTypeOptions = useMemo(() => roomTypeOptionsFrom(rooms), [rooms]);
    const [images, setImages] = useState([]);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [hotelData, roomsData] = await Promise.all([
                fetchHotelById(hotelId),
                fetchRooms({ hotelId })
            ]);
            setHotel(hotelData);
            setRooms(roomsData.items || []);
        } catch (err) {
            setError(err.message || t("hotels.errors.loadHotelDetails"));
        } finally {
            setLoading(false);
        }
    }, [hotelId, t]);

    useEffect(() => {
        if (hotelId) {
            loadData();
        }
    }, [hotelId, loadData]);

    // Gallery tải riêng: lỗi ảnh không làm hỏng cả trang
    useEffect(() => {
        if (!hotelId) return undefined;
        let cancelled = false;
        setImages([]);
        fetchHotelImages(hotelId)
            .then((data) => !cancelled && setImages(Array.isArray(data) ? data : []))
            .catch(() => null);
        return () => {
            cancelled = true;
        };
    }, [hotelId]);

    // Ảnh bìa đứng đầu, sau đó ảnh gallery (bỏ trùng với ảnh bìa)
    const photos = useMemo(() => {
        const list = hotel?.imageUrl ? [{ url: hotel.imageUrl, caption: null }] : [];
        images.forEach((img) => {
            if (img?.url && !list.some((p) => p.url === img.url)) list.push({ url: img.url, caption: img.caption });
        });
        return list;
    }, [hotel?.imageUrl, images]);

    if (loading) {
        return (
            <div className="max-w-screen-2xl mx-auto px-8 pt-32 pb-24 animate-pulse">
                <div className="h-6 w-32 bg-surface-container-high rounded mb-8"></div>
                <div className="h-[500px] lg:h-[700px] bg-surface-container-high rounded-xl mb-12"></div>
                <div className="h-10 w-1/2 bg-surface-container-high rounded mb-6"></div>
                <div className="h-32 bg-surface-container-high rounded"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-screen-xl mx-auto px-8 pt-32 pb-24 text-center">
                <span className="material-symbols-outlined text-6xl text-outline mb-4">error</span>
                <h2 className="text-2xl font-display font-bold text-primary mb-2">{t("hotels.errors.loadHotel")}</h2>
                <p className="text-on-surface-variant text-sm mb-6 max-w-md mx-auto">{error}</p>
                <button
                    onClick={loadData}
                    className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold hover:bg-primary-container transition-all"
                >
                    {t("common.actions.retry")}
                </button>
            </div>
        );
    }

    const hotelName = hotel?.name || t("hotels.detail.backToHotels");
    const imageSrc = photos[0]?.url || PLACEHOLDER_IMAGE;
    const sideImages = [1, 2].map((i, slot) => ({
        src: photos[i]?.url || FALLBACK_SIDE_IMAGES[slot],
        photoIndex: photos[i] ? i : null,
    }));
    const location = [hotel?.destinationName, hotel?.countryName]
        .filter(Boolean)
        .join(", ") || t("hotels.detail.locationInfo");
    const rating = hotel?.starRating || 5;

    return (
        <main className="pb-40 pt-24">
            <div className="max-w-screen-2xl mx-auto px-8 mb-6">
                <Link to="/hotels" className="inline-flex items-center gap-2 text-primary font-headline font-semibold text-sm hover:opacity-70 transition-opacity">
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    {t("hotels.detail.backToHotels")}
                </Link>
            </div>
            <div className="max-w-screen-2xl mx-auto px-8">
                <HotelPendingNotice hotelId={hotelId} />
            </div>
            
            {/* Hero Gallery Section */}
            <section className="max-w-screen-2xl mx-auto px-8 mb-14">
                <div className="grid grid-cols-12 gap-4 h-[500px] lg:h-[700px]">
                    <div className="col-span-12 md:col-span-8 overflow-hidden rounded-xl relative group h-full">
                        <img
                            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${photos.length ? "cursor-zoom-in" : ""}`}
                            alt={hotelName}
                            src={imageSrc}
                            onClick={photos.length ? () => setLightboxIndex(0) : undefined}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        <div className="absolute top-6 right-6">
                            <FavoriteButton itemType="hotel" itemId={hotelId} className="w-12 h-12" />
                        </div>
                        <div className="absolute bottom-8 left-8">
                            <span className="editorial-gradient text-white text-[10px] px-3 py-1 rounded-full tracking-[0.2em] font-bold uppercase mb-4 inline-block shadow-md">{t("hotels.detail.iconicLandmark")}</span>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold text-white tracking-tighter drop-shadow-lg">{hotelName}</h1>
                        </div>
                    </div>
                    <div className="hidden md:grid col-span-4 grid-rows-2 gap-4 h-full">
                        {sideImages.map((side, slot) => (
                            <div
                                key={slot}
                                className={`overflow-hidden rounded-xl group relative h-full ${side.photoIndex !== null ? "cursor-zoom-in" : ""}`}
                                onClick={side.photoIndex !== null ? () => setLightboxIndex(side.photoIndex) : undefined}
                            >
                                <img
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    alt={slot === 0 ? t("hotels.detail.poolTerraceAlt") : t("hotels.detail.suiteInteriorAlt")}
                                    src={side.src}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {photos.length > 0 && (
                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setLightboxIndex(0)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-outline-variant bg-white text-primary font-semibold text-sm hover:bg-surface-container-low transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">photo_library</span>
                            {t("hotels.detail.viewAllPhotos", { count: photos.length })}
                        </button>
                    </div>
                )}
            </section>
            {lightboxIndex !== null && (
                <PhotoLightbox
                    photos={photos}
                    index={lightboxIndex}
                    onIndexChange={setLightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    title={hotelName}
                />
            )}
            
            {/* Editorial Content */}
            <section className="max-w-screen-xl mx-auto px-8 mb-24 grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
                <div className="md:col-span-7">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                        <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant">{t("hotels.detail.curatorPick")}</span>
                    </div>
                    <h2 className="text-4xl font-headline font-bold mb-8 tracking-tight">{t("hotels.detail.introTitle")}</h2>
                    <p className="text-lg text-on-surface-variant font-body leading-relaxed">
                        {hotel?.description || t("hotels.detail.defaultDescription")}
                    </p>
                </div>
                <div className="md:col-span-5 bg-surface-container-low p-10 rounded-xl space-y-8">
                    <div>
                        <h3 className="font-headline font-bold text-xl mb-4">{t("hotels.detail.locationHighlights")}</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-4 text-on-surface-variant">
                                <span className="material-symbols-outlined text-primary">location_on</span>
                                <span>{location}</span>
                            </li>
                            {hotel?.address && (
                                <li className="flex items-center gap-4 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-primary">pin_drop</span>
                                    <span className="text-sm">{hotel.address}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                    <div className="pt-6 border-t border-outline-variant/20">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-3xl font-headline font-bold text-primary">{rating}.0</span>
                            <span className="text-on-surface-variant">{t("hotels.detail.starRating")}</span>
                        </div>
                        <p className="text-sm text-on-surface-variant italic">{t("hotels.detail.ratingDescription")}</p>
                    </div>
                </div>
            </section>
            
            {/* Amenities Grid */}
            {hotel?.amenities && hotel.amenities.length > 0 && (
                <section className="bg-surface-container-low py-24 mb-24">
                    <div className="max-w-screen-2xl mx-auto px-8">
                        <h2 className="text-3xl font-headline font-bold mb-14 text-center">{t("hotels.detail.amenitiesTitle")}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 animate-fade-in">
                            {hotel.amenities.map((amenity, idx) => (
                                <div
                                    key={idx}
                                    className="bg-surface-container-lowest p-8 rounded-xl text-center flex flex-col items-center space-y-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg border border-outline-variant/10"
                                >
                                    <div className="w-16 h-16 rounded-full bg-primary-fixed-dim flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-3xl">
                                            {getAmenityIcon(amenity)}
                                        </span>
                                    </div>
                                    <h4 className="font-headline font-bold text-sm tracking-tight text-on-surface">{amenity}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            
            {/* Rooms — Search & List */}
            <section id="rooms" className="max-w-screen-2xl mx-auto px-8 mb-24 scroll-mt-28">
                <RoomSearchPanel
                    title={t("hotels.detail.selectExperience")}
                    subtitle={t("hotels.rooms.title")}
                    compact
                    roomTypeOptions={roomTypeOptions}
                >
                    {(applied) => {
                        const filteredRooms = filterRooms(rooms, applied);
                        return (
                            <>
                                <p className="text-sm text-on-surface-variant font-medium mb-8">
                                    <span className="text-on-surface font-bold">
                                        {t("hotels.detail.roomsMatchCount", { count: filteredRooms.length })}
                                    </span>{" "}
                                    {t("hotels.detail.matchCriteria")}
                                    {applied.checkIn && applied.checkOut && (
                                        <span>
                                            {" · "}
                                            {t("hotels.detail.availableRange", { checkIn: applied.checkIn, checkOut: applied.checkOut })}
                                        </span>
                                    )}
                                    {(applied.minPrice !== "" || applied.maxPrice !== "") && (
                                        <span>
                                            {" · "}
                                            {applied.minPrice !== "" && applied.maxPrice !== ""
                                                ? t("hotels.detail.priceBetween", { min: formatMoney(fromDisplayToUsd(applied.minPrice)), max: formatMoney(fromDisplayToUsd(applied.maxPrice)) })
                                                : applied.minPrice !== ""
                                                  ? t("hotels.detail.priceFrom", { min: formatMoney(fromDisplayToUsd(applied.minPrice)) })
                                                  : t("hotels.detail.priceTo", { max: formatMoney(fromDisplayToUsd(applied.maxPrice)) })}
                                        </span>
                                    )}
                                </p>
                                {filteredRooms.length === 0 ? (
                                    <div className="text-center py-16 bg-surface-container-low rounded-xl">
                                        <span className="material-symbols-outlined text-4xl text-outline mb-3">
                                            event_busy
                                        </span>
                                        <p className="text-on-surface-variant text-sm">
                                            {t("hotels.detail.noRoomsForFilters")}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-12">
                                        {filteredRooms.map((room) => (
                                            <RoomCard key={room.id} room={room} />
                                        ))}
                                    </div>
                                )}
                            </>
                        );
                    }}
                </RoomSearchPanel>
            </section>
            
            {/* Guest reviews */}
            <ReviewSection entityType="hotel" entityId={hotelId} title={t("hotels.detail.guestChronicles")} />
            <SimilarHotels hotelId={hotelId} />
        </main>
    );
}

export default HotelDetail;
