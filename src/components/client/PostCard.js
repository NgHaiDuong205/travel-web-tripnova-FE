import { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../common/UserAvatar";
import StarRating from "../common/StarRating";
import StatusBadge from "../common/StatusBadge";
import CommentThread from "./CommentThread";
import PostForm from "./PostForm";
import { POST_STATUS_LABELS, deletePost, reactToPost, removePostReaction, updatePost } from "../../services/postService";
import { formatDate } from "../../utils/formatters";

// Trang DestinationDetail hiện dùng dữ liệu tĩnh (id không phải UUID) nên chưa liên kết destination.
const ENTITY_LINKS = {
    hotel: (id) => `/hotel/${id}`,
};

/**
 * Một bài đánh giá: điểm, nội dung, ảnh, like/dislike, bình luận; tác giả được sửa / xoá.
 * `showEntity` hiện tên đối tượng được đánh giá (dùng ở trang "My reviews").
 * onChange(post) sau khi sửa / reaction, onDeleted(id) sau khi xoá.
 */
function PostCard({ post, showEntity = false, onChange, onDeleted }) {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [editing, setEditing] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(post.commentCount);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const isMine = user?.id && post.authorId === user.id;
    const approved = post.status === "approved";
    const handleCount = useCallback((n) => setCommentCount(n), []);

    const handleReact = async (type) => {
        if (!isLoggedIn) {
            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
            return;
        }
        if (busy) return;
        setBusy(true);
        setError("");
        try {
            const updated = post.myReaction === type ? await removePostReaction(post.id) : await reactToPost(post.id, type);
            onChange?.(updated);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this review? This cannot be undone.")) return;
        try {
            await deletePost(post.id);
            onDeleted?.(post.id);
        } catch (err) {
            setError(err.message);
        }
    };

    if (editing) {
        return (
            <article className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20">
                <PostForm
                    post={post}
                    submitLabel="Save changes"
                    onCancel={() => setEditing(false)}
                    onSubmit={async (body) => {
                        const updated = await updatePost(post.id, body);
                        setEditing(false);
                        onChange?.(updated);
                    }}
                />
            </article>
        );
    }

    const entityLink = ENTITY_LINKS[post.entityType]?.(post.entityId);
    const reactionClass = (active) =>
        `inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors disabled:opacity-50 ${
            active ? "bg-primary text-on-primary border-primary" : "border-outline-variant/40 hover:bg-surface-container-high"
        }`;

    return (
        <article className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 space-y-4">
            <header className="flex items-start gap-3">
                <UserAvatar user={{ fullName: post.authorName, avatarUrl: post.authorAvatar }} rounded="rounded-full" />
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm">{post.authorName}</span>
                        {post.isVerifiedBooking && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700">
                                <span className="material-symbols-outlined text-[14px]">verified</span>
                                Verified stay
                            </span>
                        )}
                        {!approved && <StatusBadge status={post.status} labels={POST_STATUS_LABELS} />}
                    </div>
                    <p className="text-xs text-on-surface-variant">
                        {formatDate(post.createdAt)}
                        {showEntity && post.entityName && (
                            <>
                                {" · "}
                                {entityLink ? (
                                    <Link to={entityLink} className="font-bold text-primary hover:underline">{post.entityName}</Link>
                                ) : (
                                    <span className="font-bold">{post.entityName}</span>
                                )}
                            </>
                        )}
                    </p>
                </div>
                {post.rating && <StarRating value={post.rating} />}
            </header>

            {post.title && <h3 className="font-headline font-bold text-lg">{post.title}</h3>}
            <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line break-words">{post.content}</p>

            {post.images?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                    {post.images.map((src) => (
                        <a key={src} href={src} target="_blank" rel="noreferrer" className="shrink-0">
                            <img src={src} alt="" className="w-28 h-20 object-cover rounded-lg bg-surface-container-high" />
                        </a>
                    ))}
                </div>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}

            <footer className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/20">
                {approved && (
                    <>
                        <button type="button" disabled={busy || isMine} onClick={() => handleReact("like")} className={reactionClass(post.myReaction === "like")} title={isMine ? "You can't vote on your own review" : "Helpful"}>
                            <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                            {post.upvotes}
                        </button>
                        <button type="button" disabled={busy || isMine} onClick={() => handleReact("dislike")} className={reactionClass(post.myReaction === "dislike")} title={isMine ? "You can't vote on your own review" : "Not helpful"}>
                            <span className="material-symbols-outlined text-[16px]">thumb_down</span>
                            {post.downvotes}
                        </button>
                        <button type="button" onClick={() => setShowComments((v) => !v)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-surface-container-high">
                            <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                            {commentCount} comment{commentCount === 1 ? "" : "s"}
                        </button>
                    </>
                )}
                {isMine && (
                    <div className="ml-auto flex gap-1">
                        <button type="button" onClick={() => setEditing(true)} className="px-3 py-1.5 rounded-full text-xs font-bold hover:bg-surface-container-high">
                            Edit
                        </button>
                        <button type="button" onClick={handleDelete} className="px-3 py-1.5 rounded-full text-xs font-bold text-red-600 hover:bg-red-50">
                            Delete
                        </button>
                    </div>
                )}
            </footer>

            {approved && showComments && <CommentThread postId={post.id} onCountChange={handleCount} />}
        </article>
    );
}

export default PostCard;
