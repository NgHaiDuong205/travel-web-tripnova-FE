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

const PAGE_SIZE = 20;

function AdminHotels() {
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
        if (hotel.isActive && !window.confirm(`Ẩn khách sạn "${hotel.name}"? Khách sạn sẽ không hiện ở trang public và không nhận đặt phòng mới. Booking cũ giữ nguyên.`)) {
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
                <h1 className="text-3xl font-extrabold text-primary">Hotels</h1>
                <Link to="/admin/hotels/new" className="inline-flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">
                    <span className="material-symbols-outlined text-base">add</span>
                    New hotel
                </Link>
            </div>

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
                        placeholder="Hotel name, address..."
                        className="rounded-lg border-gray-200 text-sm w-64"
                    />
                    <button type="submit" className="bg-primary text-white px-4 rounded-lg text-sm font-bold">Search</button>
                </form>
                <select value={filters.status} onChange={(e) => changeFilter("status", e.target.value)} className="rounded-lg border-gray-200 text-sm">
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Hidden</option>
                </select>
                <span className="ml-auto text-sm text-gray-500">{result.total.toLocaleString()} hotels</span>
            </div>

            <FormAlert>{error}</FormAlert>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[900px]">
                    <thead className="bg-gray-50">
                        <tr className="text-xs uppercase text-gray-500">
                            <th className="px-4 py-3">Hotel</th>
                            <th className="px-4 py-3">Destination</th>
                            <th className="px-4 py-3">Stars</th>
                            <th className="px-4 py-3">Room types / Rooms</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>}
                        {!loading && result.items.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Không có khách sạn nào.</td></tr>
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
                                            {h.isActive ? "Active" : "Hidden"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/admin/hotels/${h.id}`} className="px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 text-primary hover:bg-blue-50">
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                disabled={busyId === h.id}
                                                onClick={() => handleToggleActive(h)}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold border disabled:opacity-50 ${
                                                    h.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-700 hover:bg-green-50"
                                                }`}
                                            >
                                                {h.isActive ? "Hide" : "Restore"}
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
