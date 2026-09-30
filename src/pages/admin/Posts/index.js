import { useCallback, useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StarRating from "../../../components/common/StarRating";
import StatusBadge from "../../../components/common/StatusBadge";
import { POST_STATUS_LABELS } from "../../../services/postService";
import {
    COMMENT_STATUS_LABELS,
    deleteAdminComment,
    deleteAdminPost,
    fetchAdminComments,
    fetchAdminPostComments,
    fetchAdminPosts,
    updateAdminCommentStatus,
    updateAdminPostStatus,
} from "../../../services/adminPostService";
import { formatDateTime } from "../../../utils/formatters";
import AdminStatsPanel from "../../../components/admin/AdminStatsPanel";

const PAGE_SIZE = 20;
const ENTITY_TYPES = ["hotel", "destination", "landmark", "tour", "car", "flight"];
const buttonClass = "px-3 py-1 rounded-lg text-xs font-bold border disabled:opacity-50";

/** Hàng thao tác cho một bình luận (ẩn / hiện / xoá hẳn), dùng chung cho 2 tab. */
function CommentRow({ comment, busy, onStatus, onDelete, showPost }) {
    return (
        <div className="flex flex-wrap items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="flex-1 min-w-[240px]">
                <p className="text-xs text-gray-500">
                    <span className="font-bold text-gray-800">{comment.authorName}</span> · {formatDateTime(comment.createdAt)}
                    {comment.parentId && " · reply"}
                    {showPost && ` · on "${comment.postTitle || "untitled post"}"`}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line break-words">{comment.content}</p>
            </div>
            <StatusBadge status={comment.status} labels={COMMENT_STATUS_LABELS} />
            <div className="flex gap-2">
                {comment.status === "active" ? (
                    <button type="button" disabled={busy} onClick={() => onStatus(comment, "flagged")} className={`${buttonClass} border-amber-200 text-amber-700 hover:bg-amber-50`}>
                        Hide
                    </button>
                ) : (
                    <button type="button" disabled={busy} onClick={() => onStatus(comment, "active")} className={`${buttonClass} border-green-200 text-green-700 hover:bg-green-50`}>
                        Restore
                    </button>
                )}
                <button type="button" disabled={busy} onClick={() => onDelete(comment)} className={`${buttonClass} border-red-200 text-red-600 hover:bg-red-50`}>
                    Delete
                </button>
            </div>
        </div>
    );
}

function PostComments({ postId, onError }) {
    const [comments, setComments] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(
        () => fetchAdminPostComments(postId).then(setComments).catch((err) => onError(err.message)),
        [postId, onError]
    );
    useEffect(() => {
        load();
    }, [load]);

    const run = async (comment, action) => {
        setBusyId(comment.id);
        try {
            await action();
            await load();
        } catch (err) {
            onError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    if (!comments) return <p className="text-xs text-gray-500 mt-3">Loading comments...</p>;
    if (comments.length === 0) return <p className="text-xs text-gray-500 mt-3">No comments.</p>;
    return (
        <div className="mt-3 bg-gray-50 rounded-lg px-4">
            {comments.map((c) => (
                <CommentRow
                    key={c.id}
                    comment={c}
                    busy={busyId === c.id}
                    onStatus={(comment, status) => run(comment, () => updateAdminCommentStatus(comment.id, status))}
                    onDelete={(comment) =>
                        window.confirm("Delete this comment and all replies permanently?") && run(comment, () => deleteAdminComment(comment.id))
                    }
                />
            ))}
        </div>
    );
}

function PostsTab() {
    const [filters, setFilters] = useState({ status: "pending", entityType: "", q: "" });
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);
    const [openId, setOpenId] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchAdminPosts({ ...filters, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [filters, page, reloadKey]);

    const setFilter = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const run = async (post, action) => {
        setBusyId(post.id);
        setError("");
        try {
            await action();
            setReloadKey((k) => k + 1); // bài có thể rời khỏi bộ lọc hiện tại
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setFilter("q", search.trim());
                }}
                className="flex flex-wrap items-center gap-3"
            >
                <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)} className="rounded-lg border-gray-200 text-sm">
                    <option value="">All statuses</option>
                    {Object.entries(POST_STATUS_LABELS).map(([value, cfg]) => (
                        <option key={value} value={value}>{cfg.label}</option>
                    ))}
                </select>
                <select value={filters.entityType} onChange={(e) => setFilter("entityType", e.target.value)} className="rounded-lg border-gray-200 text-sm">
                    <option value="">All targets</option>
                    {ENTITY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, content, author..." className="rounded-lg border-gray-200 text-sm w-64" />
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white">Search</button>
                <span className="ml-auto text-sm text-gray-500">{result.total.toLocaleString()} posts</span>
            </form>

            <FormAlert>{error}</FormAlert>
            {loading && <p className="text-gray-500">Đang tải...</p>}
            {!loading && result.items.length === 0 && <p className="text-gray-500">Không có bài viết nào.</p>}

            <div className="space-y-4">
                {!loading &&
                    result.items.map((p) => (
                        <article key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                                <div>
                                    <p className="font-bold text-gray-900">{p.title || "(No title)"}</p>
                                    <p className="text-sm text-gray-500">
                                        {p.authorName} · {formatDateTime(p.createdAt)} · {p.entityType}:{" "}
                                        <span className="font-semibold text-gray-700">{p.entityName || "(deleted)"}</span>
                                        {p.isVerifiedBooking && " · verified booking"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {p.rating && <StarRating value={p.rating} size="text-[16px]" />}
                                    <StatusBadge status={p.status} labels={POST_STATUS_LABELS} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-line break-words">{p.content}</p>
                            {p.images?.length > 0 && (
                                <div className="flex gap-2 mt-3 overflow-x-auto">
                                    {p.images.map((src) => (
                                        <a key={src} href={src} target="_blank" rel="noreferrer">
                                            <img src={src} alt="" className="w-24 h-16 object-cover rounded bg-gray-100" />
                                        </a>
                                    ))}
                                </div>
                            )}
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="text-xs text-gray-500 mr-auto">
                                    👍 {p.upvotes} · 👎 {p.downvotes} ·{" "}
                                    <button type="button" onClick={() => setOpenId(openId === p.id ? null : p.id)} className="font-bold text-primary hover:underline">
                                        {p.commentCount} visible comment{p.commentCount === 1 ? "" : "s"} {openId === p.id ? "▲" : "▼"}
                                    </button>
                                </span>
                                {p.status !== "approved" && (
                                    <button type="button" disabled={busyId === p.id} onClick={() => run(p, () => updateAdminPostStatus(p.id, "approved"))} className={`${buttonClass} border-green-200 text-green-700 hover:bg-green-50`}>
                                        Approve
                                    </button>
                                )}
                                {p.status !== "rejected" && (
                                    <button type="button" disabled={busyId === p.id} onClick={() => run(p, () => updateAdminPostStatus(p.id, "rejected"))} className={`${buttonClass} border-amber-200 text-amber-700 hover:bg-amber-50`}>
                                        Reject
                                    </button>
                                )}
                                <button
                                    type="button"
                                    disabled={busyId === p.id}
                                    onClick={() => window.confirm("Delete this post with all its comments and reactions?") && run(p, () => deleteAdminPost(p.id))}
                                    className={`${buttonClass} border-red-200 text-red-600 hover:bg-red-50`}
                                >
                                    Delete
                                </button>
                            </div>
                            {openId === p.id && <PostComments postId={p.id} onError={setError} />}
                        </article>
                    ))}
            </div>
            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

function CommentsTab() {
    const [status, setStatus] = useState("");
    const [q, setQ] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchAdminComments({ status, q, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [status, q, page, reloadKey]);

    const run = async (comment, action) => {
        setBusyId(comment.id);
        setError("");
        try {
            await action();
            setReloadKey((k) => k + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setQ(search.trim());
                    setPage(1);
                }}
                className="flex flex-wrap items-center gap-3"
            >
                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-lg border-gray-200 text-sm"
                >
                    <option value="">All statuses</option>
                    {Object.entries(COMMENT_STATUS_LABELS).map(([value, cfg]) => (
                        <option key={value} value={value}>{cfg.label}</option>
                    ))}
                </select>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search content, author..." className="rounded-lg border-gray-200 text-sm w-64" />
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white">Search</button>
                <span className="ml-auto text-sm text-gray-500">{result.total.toLocaleString()} comments</span>
            </form>

            <FormAlert>{error}</FormAlert>
            {loading && <p className="text-gray-500">Đang tải...</p>}
            {!loading && result.items.length === 0 && <p className="text-gray-500">Không có bình luận nào.</p>}
            {!loading && result.items.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6">
                    {result.items.map((c) => (
                        <CommentRow
                            key={c.id}
                            comment={c}
                            showPost
                            busy={busyId === c.id}
                            onStatus={(comment, next) => run(comment, () => updateAdminCommentStatus(comment.id, next))}
                            onDelete={(comment) =>
                                window.confirm("Delete this comment and all replies permanently?") && run(comment, () => deleteAdminComment(comment.id))
                            }
                        />
                    ))}
                </div>
            )}
            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

/** Kiểm duyệt bài viết / đánh giá và bình luận. */
function AdminPosts() {
    const [tab, setTab] = useState("posts");
    const tabClass = (active) =>
        `px-4 py-2 text-sm font-bold border-b-2 ${active ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800"}`;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">Reviews & comments</h1>
            <AdminStatsPanel section="reviews" />
            <div className="flex gap-2 border-b border-gray-200">
                <button type="button" onClick={() => setTab("posts")} className={tabClass(tab === "posts")}>Posts</button>
                <button type="button" onClick={() => setTab("comments")} className={tabClass(tab === "comments")}>Comments</button>
            </div>
            {tab === "posts" ? <PostsTab /> : <CommentsTab />}
        </div>
    );
}

export default AdminPosts;
