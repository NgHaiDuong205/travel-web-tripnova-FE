import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import {
    deactivateAdminHotel,
    fetchAdminHotel,
    fetchAdminHotels,
    hotelToPayload,
    updateAdminHotel,
} from "../../../services/adminHotelService";
import AdminStatsPanel from "../../../components/admin/AdminStatsPanel";
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 20;

function AdminHotels() {
    const t = useT();
    const [filters, setFilters] = useState({ q: "", status: "all" });
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setResult(await fetchAdminHotels({ ...filters, page, limit: PAGE_SIZE }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        load();
    }, [load]);

    const changeFilter = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleToggleActive = async (hotel) => {
        if (hotel.isActive && !window.confirm(t("admin.hotels.confirmHide", { name: hotel.name }))) {
            return;
        }
        setBusyId(hotel.id);
        setError("");
        try {
            if (hotel.isActive) {
                await deactivateAdminHotel(hotel.id);
            } else {
                // Khôi phục: PUT cần đủ trường nên lấy chi tiết trước
                const detail = await fetchAdminHotel(hotel.id);
                await updateAdminHotel(hotel.id, { ...hotelToPayload(detail), isActive: true });
            }
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-3xl font-extrabold text-primary">{t("admin.hotels.title")}</h1>
                <Link to="/admin/hotels/new" className="inline-flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">
                    <span className="material-symbols-outlined text-base">add</span>
                    {t("admin.hotels.newHotel")}
                </Link>
            </div>

            <AdminStatsPanel section="hotels" />

            <div className="flex flex-wrap gap-3 items-center">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        changeFilter("q", keyword.trim());
                    }}
                    className="flex gap-2"
                >
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder={t("admin.hotels.searchPlaceholder")}
                        className="rounded-lg border-gray-200 text-sm w-64"
                    />
                    <button type="submit" className="bg-primary text-white px-4 rounded-lg text-sm font-bold">{t("common.actions.search")}</button>
                </form>
                <select value={filters.status} onChange={(e) => changeFilter("status", e.target.value)} className="rounded-lg border-gray-200 text-sm">
                    <option value="all">{t("common.status.all")}</option>
                    <option value="active">{t("common.status.active")}</option>
                    <option value="inactive">{t("admin.hotels.hidden")}</option>
                </select>
                <span className="ml-auto text-sm text-gray-500">{t("admin.hotels.count", { count: result.total })}</span>
            </div>

            <FormAlert>{error}</FormAlert>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[900px]">
                    <thead className="bg-gray-50">
                        <tr className="text-xs uppercase text-gray-500">
                            <th className="px-4 py-3">{t("admin.hotels.hotel")}</th>
                            <th className="px-4 py-3">{t("common.fields.destination")}</th>
                            <th className="px-4 py-3">{t("admin.hotels.stars")}</th>
                            <th className="px-4 py-3">{t("admin.hotels.roomTypesRooms")}</th>
                            <th className="px-4 py-3">{t("common.fields.status")}</th>
                            <th className="px-4 py-3 text-right">{t("admin.hotels.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{t("common.state.loading")}</td></tr>}
                        {!loading && result.items.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{t("admin.hotels.empty")}</td></tr>
                        )}
                        {!loading &&
                            result.items.map((h) => (
                                <tr key={h.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {h.coverImageUrl ? (
                                                <img src={h.coverImageUrl} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <span className="material-symbols-outlined">hotel</span>
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-semibold truncate">{h.name}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-xs">{h.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {h.destinationName}
                                        {h.countryName && <span className="text-gray-500">, {h.countryName}</span>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-amber-500">{"★".repeat(h.starRating || 0)}</td>
                                    <td className="px-4 py-3">{h.roomTypeCount} / {h.totalRooms}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${h.isActive ? "text-green-700" : "text-gray-500"}`}>
                                            <span className="material-symbols-outlined text-sm">{h.isActive ? "check_circle" : "visibility_off"}</span>
                                            {h.isActive ? t("common.status.active") : t("admin.hotels.hidden")}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/admin/hotels/${h.id}`} className="px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 text-primary hover:bg-blue-50">
                                                {t("common.actions.edit")}
                                            </Link>
                                            <button
                                                type="button"
                                                disabled={busyId === h.id}
                                                onClick={() => handleToggleActive(h)}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold border disabled:opacity-50 ${
                                                    h.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-700 hover:bg-green-50"
                                                }`}
                                            >
                                                {h.isActive ? t("admin.hotels.hide") : t("admin.hotels.restore")}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

export default AdminHotels;
