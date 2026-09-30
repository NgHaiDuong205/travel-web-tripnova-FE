import { useCallback, useEffect, useState } from "react";
import FormAlert from "../common/FormAlert";
import { useHotelApi } from "../../context/HotelApiContext";
import { IMAGE_ACCEPT, uploadImage, validateImageFile } from "../../services/accountService";

/**
 * Thư viện ảnh của một khách sạn: thêm (tải file / URL), sửa chú thích, đổi thứ tự, đặt ảnh bìa, xoá.
 * Dùng chung cho admin (/admin/hotel-images) và quản lý khách sạn (API theo HotelApiContext).
 * onCoverChanged(url) báo cho trang cha cập nhật ảnh bìa đang hiển thị.
 */
function HotelGalleryManager({ hotel, onCoverChanged }) {
    const api = useHotelApi();
    const hotelId = hotel.id;
    const [images, setImages] = useState([]);
    const [url, setUrl] = useState("");
    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const loadImages = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setImages(await api.fetchHotelImages(hotelId));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [api, hotelId]);

    useEffect(() => {
        setNotice("");
        loadImages();
    }, [loadImages]);

    const add = async (imageUrl) => {
        if (!imageUrl) return;
        setUploading(true);
        setError("");
        setNotice("");
        try {
            await api.addHotelImage(hotelId, { url: imageUrl, caption: caption.trim() });
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
            await api.setHotelCover(hotelId, image.id);
            onCoverChanged?.(image.url);
            setNotice("Cover image updated.");
        } catch (err) {
            setError(err.message);
        }
    };

    const remove = async (image) => {
        if (!window.confirm("Delete this image?")) return;
        setError("");
        try {
            await api.deleteHotelImage(hotelId, image.id);
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
                    await api.updateHotelImage(hotelId, image.id, {
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
        <div>
            <FormAlert type="success">{notice}</FormAlert>
            <FormAlert>{error}</FormAlert>
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
            {loading ? (
                <p className="text-gray-500">Loading gallery...</p>
            ) : images.length === 0 ? (
                <p className="py-12 text-center rounded-xl bg-gray-50 text-gray-500">No gallery images yet.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                        <ImageCard
                            key={image.id}
                            image={image}
                            coverUrl={hotel.coverImageUrl}
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
        </div>
    );
}

function ImageCard({ image, coverUrl, first, last, onCover, onDelete, onMoveUp, onMoveDown, hotelId, onSaved, onError }) {
    const api = useHotelApi();
    const [caption, setCaption] = useState(image.caption || "");
    const save = async () => {
        try {
            await api.updateHotelImage(hotelId, image.id, { url: image.url, caption, sortOrder: image.sortOrder });
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

export default HotelGalleryManager;
