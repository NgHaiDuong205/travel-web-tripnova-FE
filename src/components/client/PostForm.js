import { useState } from "react";
import FormAlert from "../common/FormAlert";
import StarRating from "../common/StarRating";

const inputClass = "w-full rounded-lg border-outline-variant/40 bg-surface-container-lowest text-sm";
const MAX_IMAGES = 10;

/** Form viết / sửa bài. `post` có sẵn = sửa (không đổi được đối tượng). onSubmit(body) trả Promise. */
function PostForm({ entityType, entityId, post, onSubmit, onCancel, submitLabel = "Submit review" }) {
    const [title, setTitle] = useState(post?.title || "");
    const [rating, setRating] = useState(post?.rating ?? null);
    const [content, setContent] = useState(post?.content || "");
    const [images, setImages] = useState((post?.images || []).join("\n"));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const imageList = images.split("\n").map((s) => s.trim()).filter(Boolean);
        if (imageList.length > MAX_IMAGES) {
            setError(`At most ${MAX_IMAGES} image URLs.`);
            return;
        }
        setSaving(true);
        setError("");
        try {
            await onSubmit({
                entityType: post?.entityType || entityType,
                entityId: post?.entityId || entityId,
                title: title.trim() || null,
                rating,
                content: content.trim(),
                images: imageList,
            });
        } catch (err) {
            setError(err.details?.length ? err.details.join(" · ") : err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormAlert>{error}</FormAlert>
            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-on-surface-variant">Your rating</span>
                <StarRating value={rating || 0} onChange={setRating} size="text-[26px]" />
                {rating && <span className="text-xs text-on-surface-variant">{rating}/5</span>}
            </div>
            <label className="block text-xs font-bold text-on-surface-variant">
                Title
                <input maxLength={300} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sum up your experience" className={`${inputClass} mt-1`} />
            </label>
            <label className="block text-xs font-bold text-on-surface-variant">
                Your review *
                <textarea
                    required
                    maxLength={5000}
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What did you like? What could be better?"
                    className={`${inputClass} mt-1`}
                />
                <span className="block text-right font-normal text-[11px] mt-1">{content.length}/5000</span>
            </label>
            <label className="block text-xs font-bold text-on-surface-variant">
                Photo URLs (one per line, optional)
                <textarea rows={2} value={images} onChange={(e) => setImages(e.target.value)} placeholder="https://..." className={`${inputClass} mt-1 font-mono text-xs`} />
            </label>
            <p className="text-xs text-on-surface-variant">Reviews are published after a moderator approves them. Editing a review sends it back for approval.</p>
            <div className="flex gap-3 justify-end">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container-high">
                        Cancel
                    </button>
                )}
                <button type="submit" disabled={saving || !content.trim()} className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary disabled:opacity-50">
                    {saving ? "Saving..." : submitLabel}
                </button>
            </div>
        </form>
    );
}

export default PostForm;
