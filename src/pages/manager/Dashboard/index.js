import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import AdminStatsPanel from "../../../components/admin/AdminStatsPanel";
import { MANAGER_HOTEL_STATS } from "../../../components/admin/adminStatsConfig";
import { useAuth } from "../../../context/AuthContext";
import { fetchManagerHotels, fetchManagerStats } from "../../../services/managerHotelService";

/** Trang chủ quản lý khách sạn: chọn khách sạn (hoặc tất cả) + thống kê vận hành. */
function ManagerDashboard() {
    const { user } = useAuth();
    const [hotels, setHotels] = useState(null);
    const [hotelId, setHotelId] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchManagerHotels()
            .then(setHotels)
            .catch((err) => {
                setError(err.message);
                setHotels([]);
            });
    }, []);

    const load = useCallback((params) => fetchManagerStats({ ...params, hotelId }), [hotelId]);
    // So sánh giữa các khách sạn chỉ có nghĩa khi xem gộp nhiều khách sạn.
    const config = useMemo(
        () =>
            hotelId || (hotels?.length ?? 0) <= 1
                ? { ...MANAGER_HOTEL_STATS, charts: MANAGER_HOTEL_STATS.charts.filter((c) => c.name !== "byHotel") }
                : MANAGER_HOTEL_STATS,
        [hotelId, hotels],
    );

    if (hotels === null) return <p className="text-gray-500">Đang tải...</p>;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm text-gray-500">Xin chào, {user?.fullName}</p>
                    <h1 className="text-3xl font-extrabold text-primary">Hotel dashboard</h1>
                </div>
                {hotels.length > 1 && (
                    <label className="text-xs font-semibold text-gray-500">
                        Hotel
                        <select
                            value={hotelId}
                            onChange={(e) => setHotelId(e.target.value)}
                            className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-[240px]"
                        >
                            <option value="">All my hotels ({hotels.length})</option>
                            {hotels.map((h) => (
                                <option key={h.id} value={h.id}>
                                    {h.name}
                                    {h.isActive ? "" : " (hidden)"}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            <FormAlert>{error}</FormAlert>

            {hotels.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                    <span className="material-symbols-outlined text-5xl text-gray-300">apartment</span>
                    <p className="text-gray-600 mt-3">
                        Tài khoản chưa được gán khách sạn nào. Vui lòng liên hệ quản trị viên TripNova.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {hotels.map((h) => (
                            <Link
                                key={h.id}
                                to={`/manager/hotels/${h.id}`}
                                className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                    {h.coverImageUrl && (
                                        <img src={h.coverImageUrl} alt="" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{h.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {h.roomTypeCount} room types · {h.totalRooms} rooms
                                    </p>
                                    <span className={`text-xs font-bold ${h.isActive ? "text-green-700" : "text-gray-500"}`}>
                                        {h.isActive ? "Active" : "Hidden"}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <AdminStatsPanel section="hotel-manager" config={config} load={load} />
                </>
            )}
        </div>
    );
}

export default ManagerDashboard;
