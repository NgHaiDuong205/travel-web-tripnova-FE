import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import HotelGalleryManager from "../../../components/admin/HotelGalleryManager";
import { fetchAdminHotel, fetchAdminHotels } from "../../../services/adminHotelService";

const HOTEL_LIMIT = 50;

function AdminHotelImages() {
    const [searchParams, setSearchParams] = useSearchParams();
    const hotelId = searchParams.get("hotelId") || "";
    const [hotelQuery, setHotelQuery] = useState("");
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchAdminHotels({ q: hotelQuery, page: 1, limit: HOTEL_LIMIT })
            .then((data) => !cancelled && setHotels(data.items))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [hotelQuery]);

    // Khách sạn đang chọn lấy riêng theo id (có thể không nằm trong danh sách đang lọc).
    useEffect(() => {
        if (!hotelId) {
            setSelectedHotel(null);
            return undefined;
        }
        let cancelled = false;
        fetchAdminHotel(hotelId)
            .then((hotel) => !cancelled && setSelectedHotel(hotel))
            .catch((err) => !cancelled && setError(err.message));
        return () => {
            cancelled = true;
        };
    }, [hotelId]);

    const selectHotel = (hotel) => {
        setSearchParams({ hotelId: String(hotel.id) });
    };

    const handleCoverChanged = (url) => {
        setSelectedHotel((hotel) => hotel && { ...hotel, coverImageUrl: url });
        setHotels((prev) => prev.map((hotel) => (String(hotel.id) === hotelId ? { ...hotel, coverImageUrl: url } : hotel)));
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">Hotel Images</h1>
            <FormAlert>{error}</FormAlert>
            <div className="grid lg:grid-cols-[20rem_1fr] gap-6">
                <aside className="rounded-xl border border-gray-100 bg-white p-4">
                    <label className="text-xs font-semibold text-gray-500">
                        Find hotel
                        <input
                            value={hotelQuery}
                            onChange={(event) => setHotelQuery(event.target.value)}
                            placeholder="Hotel name"
                            className="block mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </label>
                    <div className="mt-4 space-y-2 max-h-[580px] overflow-y-auto">
                        {loading ? (
                            <p className="text-sm text-gray-500">Loading...</p>
                        ) : (
                            hotels.map((hotel) => (
                                <button
                                    key={hotel.id}
                                    type="button"
                                    onClick={() => selectHotel(hotel)}
                                    className={`w-full p-3 rounded-lg text-left ${String(hotel.id) === hotelId ? "bg-blue-50 ring-1 ring-primary" : "hover:bg-gray-50"}`}
                                >
                                    <p className="font-bold">{hotel.name}</p>
                                    <p className="text-sm text-amber-500">{"★".repeat(hotel.starRating || 0)}</p>
                                    {hotel.destinationName && <p className="text-xs text-gray-500">{hotel.destinationName}</p>}
                                    {typeof hotel.isActive === "boolean" && (
                                        <span
                                            className={`inline-block mt-1 text-xs font-bold ${hotel.isActive ? "text-green-700" : "text-gray-500"}`}
                                        >
                                            {hotel.isActive ? "Active" : "Inactive"}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                        {!loading && hotels.length === 0 && <p className="text-sm text-gray-500">No hotels found.</p>}
                    </div>
                </aside>
                <main>
                    {!selectedHotel ? (
                        <div className="py-20 text-center rounded-xl bg-gray-50 text-gray-500">
                            Select a hotel to manage its gallery.
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="w-28 h-20 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                                    {selectedHotel.coverImageUrl ? (
                                        <img
                                            src={selectedHotel.coverImageUrl}
                                            alt="Current cover"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="material-symbols-outlined text-gray-400">image</span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold">{selectedHotel.name}</h2>
                                    <p className="text-sm text-gray-500">Current cover image</p>
                                </div>
                            </div>
                            <HotelGalleryManager
                                key={selectedHotel.id}
                                hotel={selectedHotel}
                                onCoverChanged={handleCoverChanged}
                            />
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default AdminHotelImages;
