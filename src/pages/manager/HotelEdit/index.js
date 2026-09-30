import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import HotelForm from "../../../components/admin/HotelForm";
import HotelGalleryManager from "../../../components/admin/HotelGalleryManager";
import RoomManager from "../../../components/admin/RoomManager";
import RoomTypeManager from "../../../components/admin/RoomTypeManager";
import {
    deactivateManagerHotel,
    fetchManagerHotel,
    fetchManagerRoomTypes,
    updateManagerHotel,
} from "../../../services/managerHotelService";

const TABS = [
    { key: "info", label: "Hotel info", icon: "info" },
    { key: "rooms", label: "Room types & rooms", icon: "bed" },
    { key: "gallery", label: "Photos", icon: "photo_library" },
];

/**
 * Quản lý một khách sạn của mình: thông tin, hạng phòng + phòng + lịch khoá phòng, ảnh; ẩn (xoá mềm) khách sạn.
 * Các component dùng chung với admin gọi API /api/manager/** nhờ HotelApiContext ở ManagerRoutes.
 */
function ManagerHotelEdit() {
    const { hotelId } = useParams();
    const [hotel, setHotel] = useState(null);
    const [roomTypes, setRoomTypes] = useState([]);
    const [tab, setTab] = useState("info");
    const [error, setError] = useState("");
    const [notFound, setNotFound] = useState(false);
    const [hiding, setHiding] = useState(false);

    const load = useCallback(async () => {
        const [detail, types] = await Promise.all([fetchManagerHotel(hotelId), fetchManagerRoomTypes(hotelId)]);
        setHotel(detail);
        setRoomTypes(types);
    }, [hotelId]);

    useEffect(() => {
        setError("");
        setNotFound(false);
        load().catch((err) => (err.status === 404 ? setNotFound(true) : setError(err.message)));
    }, [load]);

    const refresh = async () => {
        try {
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (payload) => {
        setHotel(await updateManagerHotel(hotelId, payload));
    };

    const handleHide = async () => {
        if (
            !window.confirm(
                `Ẩn "${hotel.name}" khỏi trang public? Booking hiện có vẫn giữ nguyên; chỉ quản trị viên mới hiện lại được.`,
            )
        ) {
            return;
        }
        setHiding(true);
        setError("");
        try {
            await deactivateManagerHotel(hotelId);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setHiding(false);
        }
    };

    if (notFound) {
        return (
            <div className="space-y-4">
                <Link to="/manager/hotels" className="text-primary font-bold">
                    ← My hotels
                </Link>
                <FormAlert>Không tìm thấy khách sạn, hoặc khách sạn không thuộc tài khoản của bạn.</FormAlert>
            </div>
        );
    }
    if (!hotel) return error ? <FormAlert>{error}</FormAlert> : <p className="text-gray-500">Đang tải...</p>;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
                <Link to="/manager/hotels" className="text-gray-500 hover:text-primary" aria-label="Back to my hotels">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-3xl font-extrabold text-primary">{hotel.name}</h1>
                <span className="text-sm text-gray-500">
                    {hotel.roomTypeCount} room types · {hotel.totalRooms} rooms
                </span>
                <div className="ml-auto flex items-center gap-3">
                    {hotel.isActive && (
                        <button
                            type="button"
                            onClick={handleHide}
                            disabled={hiding}
                            className="px-4 py-2 rounded-lg text-sm font-bold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                            {hiding ? "Hiding..." : "Hide hotel"}
                        </button>
                    )}
                </div>
            </div>

            {!hotel.isActive && (
                <FormAlert type="warning">
                    Khách sạn đang bị ẩn khỏi trang public (không nhận đặt phòng mới). Liên hệ quản trị viên TripNova để hiện lại.
                </FormAlert>
            )}
            <FormAlert>{error}</FormAlert>

            <div className="flex gap-2 border-b border-gray-200">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 -mb-px ${
                            tab === t.key ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "info" && <HotelForm key={hotel.id} hotel={hotel} onSubmit={handleSubmit} canChangeStatus={false} />}
            {tab === "rooms" && (
                <>
                    <RoomTypeManager hotelId={hotelId} roomTypes={roomTypes} onChanged={refresh} />
                    <RoomManager hotelId={hotelId} roomTypes={roomTypes} onChanged={refresh} />
                </>
            )}
            {tab === "gallery" && (
                <HotelGalleryManager hotel={hotel} onCoverChanged={(url) => setHotel((h) => ({ ...h, coverImageUrl: url }))} />
            )}
        </div>
    );
}

export default ManagerHotelEdit;
