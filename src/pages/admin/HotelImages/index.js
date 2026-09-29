import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import { fetchAdminHotel, fetchAdminHotels } from "../../../services/adminHotelService";
import {
    addHotelImage,
    deleteHotelImage,
    fetchHotelImages,
    setHotelCover,
    updateHotelImage,
} from "../../../services/adminLogService";
import { IMAGE_ACCEPT, uploadImage, validateImageFile } from "../../../services/accountService";

const HOTEL_LIMIT = 50;

function AdminHotelImages() {
    const [searchParams, setSearchParams] = useSearchParams();
    const hotelId = searchParams.get("hotelId") || "";
    const [hotelQuery, setHotelQuery] = useState("");
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [images, setImages] = useState([]);
    const [url, setUrl] = useState("");
    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(true);
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

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

    const loadImages = useCallback(async () => {
        if (!hotelId) {
            setImages([]);
            return;
        }
        setGalleryLoading(true);
        setError("");
        try {
            setImages(await fetchHotelImages(hotelId));
        } catch (err) {
            setError(err.message);
        } finally {
            setGalleryLoading(false);
        }
    }, [hotelId]);

    useEffect(() => {
        loadImages();
    }, [loadImages]);

    const selectHotel = (hotel) => {
        setSearchParams({ hotelId: String(hotel.id) });
        setNotice("");
    };

    const add = async (imageUrl) => {
        if (!hotelId || !imageUrl) return;
        setUploading(true);
        setError("");
        setNotice("");
        try {
            await addHotelImage(hotelId, { url: imageUrl, caption: caption.trim() });
            setUrl("");
            setCaption("");
            setNotice("Image added.");
            await loadImages();
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const upload = async (event) => {
        const file = event.target.files?.[0];
        const validationError = validateImageFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }
        setUploading(true);
        setError("");
        try {
            const uploadedUrl = await uploadImage(file);
            await add(uploadedUrl);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    const updateCover = async (image) => {
        setError("");
        try {
            await setHotelCover(hotelId, image.id);
            setSelectedHotel((hotel) => hotel && { ...hotel, coverImageUrl: image.url });
            setHotels((prev) =>
                prev.map((hotel) => (String(hotel.id) === hotelId ? { ...hotel, coverImageUrl: image.url } : hotel)),
            );
            setNotice("Cover image updated.");
        } catch (err) {
            setError(err.message);
        }
    };

    const remove = async (image) => {
        if (!window.confirm("Delete this image?")) return;
        setError("");
        try {
            await deleteHotelImage(hotelId, image.id);
            setImages((prev) => prev.filter((item) => item.id !== image.id));
            setNotice("Image deleted.");
        } catch (err) {
            setError(err.message);
        }
    };

    /** Đổi chỗ với ảnh kề bên rồi đánh lại sortOrder = vị trí (0, 1, 2...) để không bị trùng thứ tự. */
    const reorder = async (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= images.length) return;
        const next = [...images];
        [next[index], next[target]] = [next[target], next[index]];
        setError("");
        try {
            for (const [position, image] of next.entries()) {
                if (image.sortOrder !== position) {
                    await updateHotelImage(hotelId, image.id, {
                        url: image.url,
                        caption: image.caption || "",
                        sortOrder: position,
                    });
                }
            }
            await loadImages();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">Hotel Images</h1>
            <FormAlert type="success">{notice}</FormAlert>
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
                            <section className="p-4 rounded-xl border border-gray-100 bg-white mb-6">
                                <h3 className="font-bold mb-3">Add image</h3>
                                <div className="flex flex-wrap gap-3 items-end">
                                    <label className="text-xs font-semibold text-gray-500">
                                        Upload file
                                        <input
                                            type="file"
                                            accept={IMAGE_ACCEPT}
                                            disabled={uploading}
                                            onChange={upload}
                                            className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </label>
                                    <label className="text-xs font-semibold text-gray-500 flex-1 min-w-[180px]">
                                        Image URL
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(event) => setUrl(event.target.value)}
                                            placeholder="https://"
                                            className="block mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </label>
                                    <label className="text-xs font-semibold text-gray-500">
                                        Caption
                                        <input
                                            value={caption}
                                            onChange={(event) => setCaption(event.target.value)}
                                            className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        disabled={uploading || !url.trim()}
                                        onClick={() => add(url.trim())}
                                        className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white disabled:opacity-50"
                                    >
                                        {uploading ? "Uploading..." : "Add URL"}
                                    </button>
                                </div>
                            </section>
                            {galleryLoading ? (
                                <p className="text-gray-500">Loading gallery...</p>
                            ) : images.length === 0 ? (
                                <p className="py-12 text-center rounded-xl bg-gray-50 text-gray-500">No gallery images yet.</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {images.map((image, index) => (
                                        <ImageCard
                                            key={image.id}
                                            image={image}
                                            coverUrl={selectedHotel.coverImageUrl}
                                            first={index === 0}
                                            last={index === images.length - 1}
                                            onCover={() => updateCover(image)}
                                            onDelete={() => remove(image)}
                                            onMoveUp={() => reorder(index, -1)}
                                            onMoveDown={() => reorder(index, 1)}
                                            hotelId={hotelId}
                                            onSaved={loadImages}
                                            onError={setError}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

function ImageCard({ image, coverUrl, first, last, onCover, onDelete, onMoveUp, onMoveDown, hotelId, onSaved, onError }) {
    const [caption, setCaption] = useState(image.caption || "");
    const save = async () => {
        try {
            await updateHotelImage(hotelId, image.id, { url: image.url, caption, sortOrder: image.sortOrder });
            await onSaved();
        } catch (err) {
            onError(err.message);
        }
    };
    return (
        <article className="relative rounded-xl overflow-hidden border border-gray-100 bg-white">
            <img src={image.url} alt={image.caption || "Hotel"} className="h-40 w-full object-cover" />
            {image.url === coverUrl && (
                <span className="absolute top-2 left-2 px-2 py-1 rounded bg-primary text-white text-xs font-bold">Cover</span>
            )}
            <div className="p-3">
                <input
                    value={caption}
                    onChange={(event) => setCaption(event.target.value)}
                    placeholder="Caption"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                    <button type="button" onClick={save} className="text-xs font-bold text-primary">
                        Save
                    </button>
                    <button type="button" disabled={first} onClick={onMoveUp} className="text-xs disabled:opacity-40">
                        ↑
                    </button>
                    <button type="button" disabled={last} onClick={onMoveDown} className="text-xs disabled:opacity-40">
                        ↓
                    </button>
                    <button type="button" onClick={onCover} className="text-xs font-bold text-primary">
                        Set as cover
                    </button>
                    <button type="button" onClick={onDelete} className="text-xs font-bold text-red-600">
                        Delete
                    </button>
                </div>
            </div>
        </article>
    );
}

export default AdminHotelImages;
