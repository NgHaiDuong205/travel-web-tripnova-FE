import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import AdminStatsPanel from "../../../components/admin/AdminStatsPanel";
import { MANAGER_HOTEL_STATS } from "../../../components/admin/adminStatsConfig";
import { useAuth } from "../../../context/AuthContext";
import { fetchManagerHotels, fetchManagerStats } from "../../../services/managerHotelService";
import { useT } from "../../../i18n/I18nContext";

const SELECT_LIMIT = 100; // số khách sạn trong ô chọn (thống kê "All" vẫn tính mọi khách sạn)
const CARD_LIMIT = 6;

/** Trang chủ quản lý khách sạn: chọn khách sạn (hoặc tất cả) + thống kê vận hành. */
function ManagerDashboard() {
    const t = useT();
    const { user } = useAuth();
    const [hotels, setHotels] = useState(null);
    const [totalHotels, setTotalHotels] = useState(0);
    const [hotelId, setHotelId] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchManagerHotels({ page: 1, limit: SELECT_LIMIT })
            .then((res) => {
                setHotels(res.items);
                setTotalHotels(res.total);
            })
            .catch((err) => {
                setError(err.message);
                setHotels([]);
            });
    }, []);

    const load = useCallback((params) => fetchManagerStats({ ...params, hotelId }), [hotelId]);
    // So sánh giữa các khách sạn chỉ có nghĩa khi xem gộp nhiều khách sạn.
    const config = useMemo(
        () =>
            hotelId || totalHotels <= 1
                ? { ...MANAGER_HOTEL_STATS, charts: MANAGER_HOTEL_STATS.charts.filter((c) => c.name !== "byHotel") }
                : MANAGER_HOTEL_STATS,
        [hotelId, totalHotels],
    );

    if (hotels === null) return <p className="text-gray-500">{t("common.state.loading")}</p>;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm text-gray-500">{t("manager.dashboard.greeting", { name: user?.fullName })}</p>
                    <h1 className="text-3xl font-extrabold text-primary">{t("manager.dashboard.title")}</h1>
                </div>
                {hotels.length > 1 && (
                    <label className="text-xs font-semibold text-gray-500">
                        {t("manager.dashboard.hotel")}
                        <select
                            value={hotelId}
                            onChange={(e) => setHotelId(e.target.value)}
                            className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-[240px]"
                        >
                            <option value="">{t("manager.dashboard.allHotels", { count: totalHotels })}</option>
                            {hotels.map((h) => (
                                <option key={h.id} value={h.id}>
                                    {h.name}
                                    {h.isActive ? "" : t("manager.dashboard.hiddenSuffix")}
                                </option>
                            ))}
                            {totalHotels > hotels.length && (
                                <option disabled>{t("manager.dashboard.moreHotels", { shown: hotels.length, total: totalHotels })}</option>
                            )}
                        </select>
                    </label>
                )}
            </div>

            <FormAlert>{error}</FormAlert>

            {hotels.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                    <span className="material-symbols-outlined text-5xl text-gray-300">apartment</span>
                    <p className="text-gray-600 mt-3">
                        {t("manager.hotels.noHotels")}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {hotels.slice(0, CARD_LIMIT).map((h) => (
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
                                        {t("manager.hotelEdit.roomSummary", { roomTypes: h.roomTypeCount, rooms: h.totalRooms })}
                                    </p>
                                    <span className={`text-xs font-bold ${h.isActive ? "text-green-700" : "text-gray-500"}`}>
                                        {t(h.isActive ? "common.status.active" : "manager.hotels.hidden")}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {totalHotels > CARD_LIMIT && (
                        <Link to="/manager/hotels" className="inline-block text-primary font-bold text-sm">
                            {t("manager.dashboard.viewAllHotels", { count: totalHotels })}
                        </Link>
                    )}
                    <AdminStatsPanel section="hotel-manager" config={config} load={load} />
                </>
            )}
        </div>
    );
}

export default ManagerDashboard;
