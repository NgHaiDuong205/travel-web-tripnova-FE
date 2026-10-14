import { useCallback, useEffect, useMemo, useState } from "react";
import FormAlert from "../common/FormAlert";
import { useHotelApi } from "../../context/HotelApiContext";
import { IMAGE_ACCEPT, uploadImage, validateImageFile } from "../../services/accountService";
import { useT } from "../../i18n/I18nContext";

/**
 * Thư viện ảnh của một khách sạn: thêm (tải file / URL), sửa chú thích, đổi thứ tự, đặt ảnh bìa, xoá.
 * Dùng chung cho admin (/admin/hotel-images) và quản lý khách sạn (API theo HotelApiContext).
 * onCoverChanged(url) báo cho trang cha cập nhật ảnh bìa đang hiển thị.
 * `gallery` (tuỳ chọn, nên useMemo) thay bộ thao tác mặc định — VD ảnh hạng phòng (RoomTypeManager):
 * { fetch(), add(payload), update(imageId, payload), setCover(imageId), remove(imageId) }; khi đó `hotel`
 * chỉ cần { id, coverImageUrl } của đối tượng đang sửa.
 */
function HotelGalleryManager({ hotel, onCoverChanged, gallery }) {
    const t = useT();
    const api = useHotelApi();
    const hotelId = hotel.id;
    const ops = useMemo(
        () =>
            gallery ?? {
                fetch: () => api.fetchHotelImages(hotelId),
                add: (payload) => api.addHotelImage(hotelId, payload),
                update: (imageId, payload) => api.updateHotelImage(hotelId, imageId, payload),
                setCover: (imageId) => api.setHotelCover(hotelId, imageId),
                remove: (imageId) => api.deleteHotelImage(hotelId, imageId),
            },
        [gallery, api, hotelId]
    );
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
            setImages(await ops.fetch());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [ops]);

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
            await ops.add({ url: imageUrl, caption: caption.trim() });
            setUrl("");
            setCaption("");
            setNotice(t("admin.gallery.imageAdded"));
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
            await ops.setCover(image.id);
            onCoverChanged?.(image.url);
            setNotice(t("admin.gallery.coverUpdated"));
        } catch (err) {
            setError(err.message);
        }
    };

    const remove = async (image) => {
        if (!window.confirm(t("admin.gallery.confirmDelete"))) return;
        setError("");
        try {
            await ops.remove(image.id);
            setImages((prev) => prev.filter((item) => item.id !== image.id));
            setNotice(t("admin.gallery.imageDeleted"));
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
                    await ops.update(image.id, {
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
                <h3 className="font-bold mb-3">{t("admin.gallery.addImage")}</h3>
                <div className="flex flex-wrap gap-3 items-end">
                    <label className="text-xs font-semibold text-gray-500">
                        {t("admin.gallery.uploadFile")}
                        <input
                            type="file"
                            accept={IMAGE_ACCEPT}
                            disabled={uploading}
                            onChange={upload}
                            className="block mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="text-xs font-semibold text-gray-500 flex-1 min-w-[180px]">
                        {t("admin.gallery.imageUrl")}
                        <input
                            type="url"
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                            placeholder="https://"
                            className="block mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="text-xs font-semibold text-gray-500">
                        {t("admin.gallery.caption")}
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
                        {uploading ? t("admin.gallery.uploading") : t("admin.gallery.addUrl")}
                    </button>
                </div>
            </section>
            {loading ? (
                <p className="text-gray-500">{t("admin.gallery.loading")}</p>
            ) : images.length === 0 ? (
                <p className="py-12 text-center rounded-xl bg-gray-50 text-gray-500">{t("admin.gallery.empty")}</p>
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
                            onUpdate={ops.update}
                            onSaved={loadImages}
                            onError={setError}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ImageCard({ image, coverUrl, first, last, onCover, onDelete, onMoveUp, onMoveDown, onUpdate, onSaved, onError }) {
    const t = useT();
    const [caption, setCaption] = useState(image.caption || "");
    const save = async () => {
        try {
            await onUpdate(image.id, { url: image.url, caption, sortOrder: image.sortOrder });
            await onSaved();
        } catch (err) {
            onError(err.message);
        }
    };
    return (
        <article className="relative rounded-xl overflow-hidden border border-gray-100 bg-white">
            <img src={image.url} alt={image.caption || t("admin.gallery.hotelImage")} className="h-40 w-full object-cover" />
            {image.url === coverUrl && (
                <span className="absolute top-2 left-2 px-2 py-1 rounded bg-primary text-white text-xs font-bold">{t("admin.gallery.cover")}</span>
            )}
            <div className="p-3">
                <input
                    value={caption}
                    onChange={(event) => setCaption(event.target.value)}
                    placeholder={t("admin.gallery.caption")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                    <button type="button" onClick={save} className="text-xs font-bold text-primary">
                        {t("common.actions.save")}
                    </button>
                    <button type="button" disabled={first} onClick={onMoveUp} className="text-xs disabled:opacity-40">
                        ↑
                    </button>
                    <button type="button" disabled={last} onClick={onMoveDown} className="text-xs disabled:opacity-40">
                        ↓
                    </button>
                    <button type="button" onClick={onCover} className="text-xs font-bold text-primary">
                        {t("admin.gallery.setAsCover")}
                    </button>
                    <button type="button" onClick={onDelete} className="text-xs font-bold text-red-600">
                        {t("common.actions.delete")}
                    </button>
                </div>
            </div>
        </article>
    );
}

export default HotelGalleryManager;
