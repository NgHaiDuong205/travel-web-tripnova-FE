import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import { fetchManagerHotels } from "../../../services/managerHotelService";

/** Danh sách khách sạn do tài khoản này quản lý (admin gán). */
function ManagerHotels() {
    const [hotels, setHotels] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchManagerHotels()
            .then(setHotels)
            .catch((err) => {
                setError(err.message);
                setHotels([]);
            });
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">My hotels</h1>
            <FormAlert>{error}</FormAlert>
            {hotels === null && <p className="text-gray-500">Đang tải...</p>}
            {hotels?.length === 0 && !error && (
                <p className="bg-white rounded-xl p-10 text-center text-gray-600 border border-gray-100">
                    Tài khoản chưa được gán khách sạn nào. Vui lòng liên hệ quản trị viên TripNova.
                </p>
            )}
            {hotels?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm min-w-[720px]">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Hotel</th>
                                <th className="px-4 py-3">Location</th>
                                <th className="px-4 py-3">Rating</th>
                                <th className="px-4 py-3">Rooms</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {hotels.map((h) => (
                                <tr key={h.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-10 rounded bg-gray-100 overflow-hidden shrink-0">
                                                {h.coverImageUrl && (
                                                    <img src={h.coverImageUrl} alt="" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <span className="font-semibold text-gray-900">{h.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {[h.destinationName, h.countryName].filter(Boolean).join(", ")}
                                    </td>
                                    <td className="px-4 py-3 text-amber-500">{"★".repeat(h.starRating || 0)}</td>
                                    <td className="px-4 py-3">
                                        {h.totalRooms} rooms · {h.roomTypeCount} types
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                h.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {h.isActive ? "Active" : "Hidden"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <Link to={`/manager/hotels/${h.id}`} className="text-primary font-bold">
                                            Manage
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ManagerHotels;
