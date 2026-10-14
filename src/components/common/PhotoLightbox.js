import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useT } from "../../i18n/I18nContext";

/**
 * Xem ảnh toàn màn hình. `photos`: [{ url, caption? }], `index`: ảnh đang xem,
 * `onIndexChange(i)` khi chuyển ảnh, `onClose()` khi đóng (nút X, click nền, phím Esc).
 */
function PhotoLightbox({ photos, index, onIndexChange, onClose, title }) {
    const t = useT();
    const count = photos.length;
    const go = useCallback((delta) => onIndexChange((index + delta + count) % count), [index, count, onIndexChange]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowLeft") go(-1);
            else if (e.key === "ArrowRight") go(1);
        };
        window.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [go, onClose]);

    const photo = photos[index];
    if (!photo) return null;

    // Portal ra body: phần tử cha trong <main> có thể tạo stacking context (hiệu ứng hiện dần) làm header đè lên.
    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-[70] bg-black/90 flex flex-col"
            onClick={onClose}
        >
            <div className="flex items-center justify-between px-6 py-4 text-white" onClick={(e) => e.stopPropagation()}>
                <span className="text-sm font-semibold text-white/80">
                    {title ? `${title} · ` : ""}
                    {index + 1} / {count}
                </span>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t("common.actions.close")}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            <div className="flex-1 min-h-0 flex items-center justify-center gap-4 px-4">
                {count > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); go(-1); }}
                        aria-label={t("common.actions.previous")}
                        className="shrink-0 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                )}
                <figure className="min-w-0 max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                    <img src={photo.url} alt={photo.caption || title || ""} className="max-h-[75vh] max-w-full object-contain rounded-lg" />
                    {photo.caption && <figcaption className="mt-3 text-sm text-white/80 text-center">{photo.caption}</figcaption>}
                </figure>
                {count > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); go(1); }}
                        aria-label={t("common.actions.next")}
                        className="shrink-0 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                )}
            </div>

            {count > 1 && (
                <div className="flex gap-2 overflow-x-auto px-6 py-4 justify-center" onClick={(e) => e.stopPropagation()}>
                    {photos.map((p, i) => (
                        <button
                            key={p.url + i}
                            type="button"
                            onClick={() => onIndexChange(i)}
                            aria-label={`${i + 1} / ${count}`}
                            aria-current={i === index}
                            className={`shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 ${i === index ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}
                        >
                            <img src={p.url} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>,
        document.body
    );
}

export default PhotoLightbox;
