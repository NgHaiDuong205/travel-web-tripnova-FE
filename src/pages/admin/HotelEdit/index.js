import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import HotelForm from "../../../components/admin/HotelForm";
import RoomManager from "../../../components/admin/RoomManager";
import RoomTypeManager from "../../../components/admin/RoomTypeManager";
import { createAdminHotel, fetchAdminHotel, fetchAdminRoomTypes, updateAdminHotel } from "../../../services/adminHotelService";
import { useT } from "../../../i18n/I18nContext";

/** /admin/hotels/new (tạo) và /admin/hotels/:hotelId (sửa + hạng phòng + phòng). */
function AdminHotelEdit() {
    const t = useT();
    const { hotelId } = useParams();
    const isNew = !hotelId;
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(!isNew);
    const [error, setError] = useState("");

    const loadHotel = useCallback(async () => {
        if (isNew) return;
        const [detail, types] = await Promise.all([fetchAdminHotel(hotelId), fetchAdminRoomTypes(hotelId)]);
        setHotel(detail);
        setRoomTypes(types);
    }, [hotelId, isNew]);

    useEffect(() => {
        if (isNew) return;
        setLoading(true);
        setError("");
        loadHotel()
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [isNew, loadHotel]);

    const handleSubmit = async (payload) => {
        if (isNew) {
            const created = await createAdminHotel(payload);
            navigate(`/admin/hotels/${created.id}`, { replace: true });
        } else {
            setHotel(await updateAdminHotel(hotelId, payload));
        }
    };

    // Số phòng / hạng phòng thay đổi → tải lại để cập nhật totalRooms
    const refresh = async () => {
        try {
            await loadHotel();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/admin/hotels" className="text-gray-500 hover:text-primary">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-3xl font-extrabold text-primary">{isNew ? t("admin.hotelEdit.newHotel") : hotel?.name || t("admin.hotelEdit.hotel")}</h1>
                {hotel && (
                    <span className="ml-auto text-sm text-gray-500">
                        {t("admin.hotelEdit.summary", { roomTypes: hotel.roomTypeCount, rooms: hotel.totalRooms, status: hotel.isActive ? t("common.status.active") : t("admin.hotelEdit.hidden") })}
                    </span>
                )}
            </div>

            <FormAlert>{error}</FormAlert>
            {loading && <p className="text-gray-500">{t("common.state.loading")}</p>}

            {!loading && (isNew || hotel) && (
                // key: khởi tạo lại form khi chuyển từ "new" sang khách sạn vừa tạo
                <HotelForm key={hotel?.id || "new"} hotel={hotel} onSubmit={handleSubmit} />
            )}

            {!isNew && hotel && (
                <>
                    <RoomTypeManager hotelId={hotelId} roomTypes={roomTypes} onChanged={refresh} />
                    <RoomManager hotelId={hotelId} roomTypes={roomTypes} onChanged={refresh} />
                </>
            )}
        </div>
    );
}

export default AdminHotelEdit;
