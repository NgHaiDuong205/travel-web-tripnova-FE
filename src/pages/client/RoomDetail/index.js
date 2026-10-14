import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchRoomDetails } from "../../../services/roomService";
import { fetchHotelById } from "../../../services/hotelService";
import { formatMoney, isoDateFromToday, nightsBetween } from "../../../utils/formatters";
import { useT } from "../../../i18n/I18nContext";
import HotelPendingNotice from "../../../components/client/HotelPendingNotice";
import PhotoLightbox from "../../../components/common/PhotoLightbox";

const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1631049301164-da64c29e0a5a?w=1200&q=80";

function getAmenityIcon(name) {
    const lowercase = name.toLowerCase();
    if (lowercase.includes("bar")) return "local_bar";
    if (lowercase.includes("balcony") || lowercase.includes("terrace")) return "balcony";
    if (lowercase.includes("safe")) return "safe";
    if (lowercase.includes("sauna") || lowercase.includes("spa")) return "spa";
    if (lowercase.includes("yoga") || lowercase.includes("gym") || lowercase.includes("fitness")) return "fitness_center";
    if (lowercase.includes("coffee") || lowercase.includes("cafe")) return "coffee";
    if (lowercase.includes("service")) return "room_service";
    if (lowercase.includes("wifi") || lowercase.includes("internet")) return "wifi";
    if (lowercase.includes("tv") || lowercase.includes("screen")) return "tv";
    if (lowercase.includes("bath") || lowercase.includes("shower")) return "bathtub";
    if (lowercase.includes("bed")) return "king_bed";
    if (lowercase.includes("ac") || lowercase.includes("condition")) return "ac_unit";
    return "done_all";
}

function RoomDetail() {
    const t = useT();
    const { hotelId, roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form booking state
    const [checkIn, setCheckIn] = useState(() => isoDateFromToday(7));
    const [checkOut, setCheckOut] = useState(() => isoDateFromToday(10));
    const [guests, setGuests] = useState(2);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [roomData, hotelData] = await Promise.all([
                fetchRoomDetails(hotelId, roomId),
                fetchHotelById(hotelId).catch(() => null) // Fallback if hotel API fails/is not implemented
            ]);
            setRoom(roomData);
            if (hotelData) setHotel(hotelData);
        } catch (err) {
            setError(err.message || t("hotels.errors.loadRoomDetails"));
        } finally {
            setLoading(false);
        }
    }, [hotelId, roomId, t]);

    useEffect(() => {
        if (hotelId && roomId) {
            loadData();
        }
    }, [hotelId, roomId, loadData]);

    const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);

    // Ảnh hạng phòng (thư viện), không có thì ảnh bìa hạng phòng
    const photos = useMemo(() => {
        const list = room?.images?.length ? room.images : room?.image ? [{ url: room.image }] : [];
        const seen = new Set();
        return list.filter((p) => !seen.has(p.url) && seen.add(p.url));
    }, [room]);

    // Tổng tiền tạm tính; giá chính thức do backend tính ở bước Checkout.
    const total = useMemo(() => (room?.price ?? 0) * nights, [room, nights]);

    const handleReserve = () => {
        const params = new URLSearchParams({
            hotelId,
            roomTypeId: room.roomTypeId,
            roomId,
            checkIn,
            checkOut,
            guests: String(guests),
        });
        navigate(`/checkout?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="max-w-screen-2xl mx-auto px-8 pt-32 pb-24 animate-pulse">
                <div className="h-6 w-64 bg-surface-container-high rounded mb-8"></div>
                <div className="h-[500px] lg:h-[700px] bg-surface-container-high rounded-xl mb-12"></div>
                <div className="grid grid-cols-12 gap-16">
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        <div className="h-10 w-3/4 bg-surface-container-high rounded"></div>
                        <div className="h-32 bg-surface-container-high rounded"></div>
                    </div>
                    <div className="col-span-12 lg:col-span-4 h-96 bg-surface-container-high rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-screen-xl mx-auto px-8 pt-32 pb-24 text-center">
                <span className="material-symbols-outlined text-6xl text-outline mb-4">error</span>
                <h2 className="text-2xl font-display font-bold text-primary mb-2">{t("hotels.errors.loadRoom")}</h2>
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

    const roomName = room.roomTypeName || room.name || t("hotels.roomTypes.superiorRoom");
    const displayPrice = room.price ?? 0;
    const currency = "USD";
    const maxOccupancy = room.maxGuests || 2;

    return (
        <main className="max-w-screen-2xl mx-auto px-8 pt-32 pb-24">
            <HotelPendingNotice hotelId={hotelId} />
            {/* Breadcrumbs & Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <nav className="flex items-center gap-2 text-sm font-label uppercase tracking-widest text-on-surface-variant">
                    <Link to={`/hotel/${hotelId}`} className="hover:text-primary transition-colors">
                        {hotel?.name || t("hotels.card.hotelAlt")}
                    </Link>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <Link to={`/hotel/${hotelId}#rooms`} className="hover:text-primary transition-colors">{t("hotels.rooms.title")}</Link>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <span className="text-on-surface font-semibold">{roomName}</span>
                </nav>
                <Link
                    to={`/hotel/${hotelId}#rooms`}
                    className="flex items-center gap-2 group text-primary font-medium hover:translate-x-[-4px] transition-transform duration-300"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span>{t("hotels.detail.backToHotelRooms")}</span>
                </Link>
            </div>

            {/* Hero Section & Immersive Gallery */}
            <div className="grid grid-cols-12 gap-4 mb-20 h-[500px] lg:h-[716px]">
                <div
                    className={`col-span-12 md:col-span-8 relative overflow-hidden rounded-xl h-full ${photos.length ? "cursor-zoom-in" : ""}`}
                    onClick={photos.length ? () => setLightboxIndex(0) : undefined}
                >
                    <img
                        className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        alt={roomName}
                        src={photos[0]?.url || PLACEHOLDER_IMAGE}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 text-white">
                        <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest bg-white/20 backdrop-blur rounded-full mb-3 inline-block">
                            {t("hotels.detail.roomNumber", { number: room.roomNumber || t("hotels.detail.notAvailable") })}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tighter mb-2 drop-shadow-lg">
                            {roomName}
                        </h1>
                        <p className="text-lg opacity-90 drop-shadow-md">
                            {room.status === "available" ? t("hotels.detail.availableForBooking") : t("hotels.detail.currentlyUnavailable")}
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex flex-col col-span-4 gap-4 h-full">
                    <div className="h-1/2 overflow-hidden rounded-xl relative">
                        <img
                            className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            alt={t("hotels.detail.suiteTerraceAlt")}
                            src={photos[1]?.url || photos[0]?.url || PLACEHOLDER_IMAGE}
                        />
                    </div>
                    <div className="h-1/2 overflow-hidden rounded-xl relative">
                        <img
                            className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            alt={t("hotels.detail.suiteBathroomAlt")}
                            src={photos[2]?.url || photos[1]?.url || photos[0]?.url || PLACEHOLDER_IMAGE}
                        />
                        <div
                            className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer group"
                            onClick={photos.length ? () => setLightboxIndex(Math.min(2, photos.length - 1)) : undefined}
                        >
                            <span className="px-6 py-3 bg-white/90 backdrop-blur text-primary font-bold rounded-lg group-hover:bg-white transition-all">
                                {photos.length > 1
                                    ? t("hotels.detail.viewAllPhotos", { count: photos.length })
                                    : t("hotels.actions.viewGallery")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {lightboxIndex !== null && (
                <PhotoLightbox
                    photos={photos}
                    index={lightboxIndex}
                    onIndexChange={setLightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    title={roomName}
                />
            )}

            {/* Main Content Area with Sticky Booking Card */}
            <div className="grid grid-cols-12 gap-16 relative">
                {/* Left Side: Content */}
                <div className="col-span-12 lg:col-span-8 space-y-20">
                    {/* Description */}
                    <section>
                        <span className="text-tertiary font-label text-xs uppercase tracking-[0.2em] block mb-4">
                            {t("hotels.detail.premiumLivingSpace")}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-8 leading-tight">
                            {t("hotels.detail.roomIntroTitle")}
                        </h2>
                        <div className="space-y-6 text-on-surface-variant leading-relaxed text-lg max-w-2xl">
                            <p>
                                {room.description ||
                                    t("hotels.detail.defaultRoomDescription")}
                            </p>
                            <p>
                                {t("hotels.detail.roomDescriptionExtra")}
                            </p>
                        </div>
                    </section>

                    {/* Amenities Grid */}
                    <section className="bg-surface-container-low p-12 rounded-xl">
                        <h3 className="text-2xl font-display font-bold text-primary mb-10">{t("hotels.detail.roomAmenities")}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8">
                            {/* Standard Specs */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary-fixed-dim/30 rounded-lg">
                                    <span className="material-symbols-outlined text-primary">straighten</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{t("hotels.detail.roomArea")}</h4>
                                    <p className="text-xs text-on-surface-variant mt-1">{t("hotels.detail.squareMeters", { count: room.areaSqM || 40 })}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary-fixed-dim/30 rounded-lg">
                                    <span className="material-symbols-outlined text-primary">king_bed</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{t("hotels.detail.bedConfiguration")}</h4>
                                    <p className="text-xs text-on-surface-variant mt-1">{room.bedType || t("hotels.detail.defaultBed")}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary-fixed-dim/30 rounded-lg">
                                    <span className="material-symbols-outlined text-primary">layers</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{t("hotels.detail.floorLocation")}</h4>
                                    <p className="text-xs text-on-surface-variant mt-1">{t("hotels.detail.floor", { number: room.floor || t("hotels.detail.notAvailable") })}</p>
                                </div>
                            </div>

                            {/* Dynamic Backend Amenities */}
                            {room.amenityIds?.map((amenity) => (
                                <div key={amenity} className="flex items-start gap-4">
                                    <div className="p-3 bg-primary-fixed-dim/30 rounded-lg">
                                        <span className="material-symbols-outlined text-primary">
                                            {getAmenityIcon(amenity)}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{amenity}</h4>
                                        <p className="text-xs text-on-surface-variant mt-1">{t("hotels.detail.includedInRoom")}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Experience Section */}
                    <section>
                        <h3 className="text-2xl font-display font-bold text-primary mb-8">{t("hotels.detail.stayExperience")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 border border-outline-variant/15 rounded-xl hover:bg-surface-container-low transition-colors duration-300">
                                <h4 className="font-display font-bold text-lg mb-4">{t("hotels.detail.dedicatedButler")}</h4>
                                <p className="text-on-surface-variant text-sm leading-relaxed">
                                    {t("hotels.detail.butlerDescription")}
                                </p>
                            </div>
                            <div className="p-8 border border-outline-variant/15 rounded-xl hover:bg-surface-container-low transition-colors duration-300">
                                <h4 className="font-display font-bold text-lg mb-4">{t("hotels.detail.exclusivePerks")}</h4>
                                <p className="text-on-surface-variant text-sm leading-relaxed">
                                    {t("hotels.detail.perksDescription")}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Side: Sticky Booking Card */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="sticky top-28 bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(27,28,28,0.06)] p-8 border border-outline-variant/10">
                        <div className="flex justify-between items-baseline mb-8">
                            <div className="flex flex-col">
                                <span className="text-3xl font-display font-extrabold text-primary">
                                    {formatMoney(displayPrice, currency)}
                                </span>
                                <span className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">
                                    {t("common.units.perNight")}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-tertiary-fixed-dim">
                                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    star
                                </span>
                                <span className="text-on-surface font-bold text-sm">4.8</span>
                            </div>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="grid grid-cols-2 gap-px bg-outline-variant/20 rounded-lg overflow-hidden border border-outline-variant/20">
                                <div className="bg-surface-container-lowest p-4">
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                                        {t("common.fields.checkIn")}
                                    </label>
                                    <input
                                        className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 cursor-pointer"
                                        type="date"
                                        min={isoDateFromToday(0)}
                                        value={checkIn}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                    />
                                </div>
                                <div className="bg-surface-container-lowest p-4 border-l border-outline-variant/20">
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                                        {t("common.fields.checkOut")}
                                    </label>
                                    <input
                                        className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 cursor-pointer"
                                        type="date"
                                        min={checkIn}
                                        value={checkOut}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20">
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                                    {t("common.fields.guests")}
                                </label>
                                <select
                                    className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 cursor-pointer"
                                    value={guests}
                                    onChange={(e) => setGuests(Number(e.target.value))}
                                >
                                    {Array.from({ length: maxOccupancy }, (_, i) => i + 1).map((n) => (
                                        <option key={n} value={n}>
                                            {t("common.units.guest", { count: n })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={handleReserve}
                            disabled={room.status !== "available" || nights <= 0}
                            className={`w-full py-4 rounded-lg font-bold text-sm tracking-wide shadow-lg transition-all duration-300 ${
                                room.status === "available" && nights > 0
                                    ? "editorial-gradient text-white hover:opacity-90 active:scale-[0.98]"
                                    : "bg-surface-container-high text-on-surface-variant cursor-not-allowed"
                            }`}
                        >
                            {room.status === "available" ? t("hotels.actions.reserveStay") : t("hotels.detail.roomUnavailable")}
                        </button>
                        <p className="text-center text-xs text-on-surface-variant mt-6">
                            {t("hotels.detail.paymentNotice")}
                        </p>
                        {nights > 0 && (
                            <div className="mt-8 pt-8 border-t border-outline-variant/15 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">
                                        {t("hotels.detail.nightsAtPrice", { count: nights, price: formatMoney(displayPrice, currency) })}
                                    </span>
                                    <span className="font-semibold">{formatMoney(total, currency)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-display font-bold text-primary pt-2 border-t border-outline-variant/10">
                                    <span>{t("common.fields.total")}</span>
                                    <span>{formatMoney(total, currency)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default RoomDetail;
