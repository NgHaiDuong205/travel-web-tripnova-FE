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
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 20;
const ENTITY_TYPES = ["hotel", "destination", "landmark", "tour", "car", "flight"];
const buttonClass = "px-3 py-1 rounded-lg text-xs font-bold border disabled:opacity-50";

/** Hàng thao tác cho một bình luận (ẩn / hiện / xoá hẳn), dùng chung cho 2 tab. */
function CommentRow({ comment, busy, onStatus, onDelete, showPost }) {
    const t = useT();
    return (
        <div className="flex flex-wrap items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="flex-1 min-w-[240px]">
                <p className="text-xs text-gray-500">
                    <span className="font-bold text-gray-800">{comment.authorName}</span> · {formatDateTime(comment.createdAt)}
                    {comment.parentId && t("admin.posts.replySuffix")}
                    {showPost && t("admin.posts.onPost", { title: comment.postTitle || t("admin.posts.untitledPost") })}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line break-words">{comment.content}</p>
            </div>
            <StatusBadge status={comment.status} labels={Object.fromEntries(Object.entries(COMMENT_STATUS_LABELS).map(([value, cfg]) => [value, { ...cfg, label: t(`admin.status.${value}`, { defaultValue: cfg.label }) }]))} />
            <div className="flex gap-2">
                {comment.status === "active" ? (
                    <button type="button" disabled={busy} onClick={() => onStatus(comment, "flagged")} className={`${buttonClass} border-amber-200 text-amber-700 hover:bg-amber-50`}>
                        {t("admin.posts.hide")}
                    </button>
                ) : (
                    <button type="button" disabled={busy} onClick={() => onStatus(comment, "active")} className={`${buttonClass} border-green-200 text-green-700 hover:bg-green-50`}>
                        {t("admin.posts.restore")}
                    </button>
                )}
                <button type="button" disabled={busy} onClick={() => onDelete(comment)} className={`${buttonClass} border-red-200 text-red-600 hover:bg-red-50`}>
                    {t("common.actions.delete")}
                </button>
            </div>
        </div>
    );
}

function PostComments({ postId, onError }) {
    const t = useT();
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

    if (!comments) return <p className="text-xs text-gray-500 mt-3">{t("admin.posts.loadingComments")}</p>;
    if (comments.length === 0) return <p className="text-xs text-gray-500 mt-3">{t("admin.posts.noComments")}</p>;
    return (
        <div className="mt-3 bg-gray-50 rounded-lg px-4">
            {comments.map((c) => (
                <CommentRow
                    key={c.id}
                    comment={c}
                    busy={busyId === c.id}
                    onStatus={(comment, status) => run(comment, () => updateAdminCommentStatus(comment.id, status))}
                    onDelete={(comment) =>
                        window.confirm(t("admin.posts.confirmDeleteComment")) && run(comment, () => deleteAdminComment(comment.id))
                    }
                />
            ))}
        </div>
    );
}

function PostsTab() {
    const t = useT();
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
                    <option value="">{t("common.status.all")}</option>
                    {Object.entries(POST_STATUS_LABELS).map(([value, cfg]) => (
                        <option key={value} value={value}>{t(`admin.status.${value}`, { defaultValue: cfg.label })}</option>
                    ))}
                </select>
                <select value={filters.entityType} onChange={(e) => setFilter("entityType", e.target.value)} className="rounded-lg border-gray-200 text-sm">
                    <option value="">{t("admin.posts.allTargets")}</option>
                    {ENTITY_TYPES.map((type) => (
                        <option key={type} value={type}>{t(`admin.posts.entityTypes.${type}`, { defaultValue: type })}</option>
                    ))}
                </select>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.posts.searchPostsPlaceholder")} className="rounded-lg border-gray-200 text-sm w-64" />
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white">{t("common.actions.search")}</button>
                <span className="ml-auto text-sm text-gray-500">{t("admin.posts.postCount", { count: result.total })}</span>
            </form>

            <FormAlert>{error}</FormAlert>
            {loading && <p className="text-gray-500">{t("common.state.loading")}</p>}
            {!loading && result.items.length === 0 && <p className="text-gray-500">{t("admin.posts.emptyPosts")}</p>}

            <div className="space-y-4">
                {!loading &&
                    result.items.map((p) => (
                        <article key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                                <div>
                                    <p className="font-bold text-gray-900">{p.title || t("admin.posts.noTitle")}</p>
                                    <p className="text-sm text-gray-500">
                                        {p.authorName} · {formatDateTime(p.createdAt)} · {t(`admin.posts.entityTypes.${p.entityType}`, { defaultValue: p.entityType })}:{" "}
                                        <span className="font-semibold text-gray-700">{p.entityName || t("admin.posts.deleted")}</span>
                                        {p.isVerifiedBooking && t("admin.posts.verifiedBooking")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {p.rating && <StarRating value={p.rating} size="text-[16px]" />}
                                    <StatusBadge status={p.status} labels={Object.fromEntries(Object.entries(POST_STATUS_LABELS).map(([value, cfg]) => [value, { ...cfg, label: t(`admin.status.${value}`, { defaultValue: cfg.label }) }]))} />
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
                                        {t("admin.posts.visibleCommentCount", { count: p.commentCount })} {openId === p.id ? "▲" : "▼"}
                                    </button>
                                </span>
                                {p.status !== "approved" && (
                                    <button type="button" disabled={busyId === p.id} onClick={() => run(p, () => updateAdminPostStatus(p.id, "approved"))} className={`${buttonClass} border-green-200 text-green-700 hover:bg-green-50`}>
                                        {t("admin.posts.approve")}
                                    </button>
                                )}
                                {p.status !== "rejected" && (
                                    <button type="button" disabled={busyId === p.id} onClick={() => run(p, () => updateAdminPostStatus(p.id, "rejected"))} className={`${buttonClass} border-amber-200 text-amber-700 hover:bg-amber-50`}>
                                        {t("admin.posts.reject")}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    disabled={busyId === p.id}
                                    onClick={() => window.confirm(t("admin.posts.confirmDeletePost")) && run(p, () => deleteAdminPost(p.id))}
                                    className={`${buttonClass} border-red-200 text-red-600 hover:bg-red-50`}
                                >
                                    {t("common.actions.delete")}
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
    const t = useT();
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
                    <option value="">{t("common.status.all")}</option>
                    {Object.entries(COMMENT_STATUS_LABELS).map(([value, cfg]) => (
                        <option key={value} value={value}>{t(`admin.status.${value}`, { defaultValue: cfg.label })}</option>
                    ))}
                </select>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.posts.searchCommentsPlaceholder")} className="rounded-lg border-gray-200 text-sm w-64" />
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white">{t("common.actions.search")}</button>
                <span className="ml-auto text-sm text-gray-500">{t("admin.posts.commentCount", { count: result.total })}</span>
            </form>

            <FormAlert>{error}</FormAlert>
            {loading && <p className="text-gray-500">{t("common.state.loading")}</p>}
            {!loading && result.items.length === 0 && <p className="text-gray-500">{t("admin.posts.emptyComments")}</p>}
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
                                window.confirm(t("admin.posts.confirmDeleteComment")) && run(comment, () => deleteAdminComment(comment.id))
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
    const t = useT();
    const [tab, setTab] = useState("posts");
    const tabClass = (active) =>
        `px-4 py-2 text-sm font-bold border-b-2 ${active ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800"}`;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">{t("admin.posts.title")}</h1>
            <AdminStatsPanel section="reviews" />
            <div className="flex gap-2 border-b border-gray-200">
                <button type="button" onClick={() => setTab("posts")} className={tabClass(tab === "posts")}>{t("admin.posts.posts")}</button>
                <button type="button" onClick={() => setTab("comments")} className={tabClass(tab === "comments")}>{t("admin.posts.comments")}</button>
            </div>
            {tab === "posts" ? <PostsTab /> : <CommentsTab />}
        </div>
    );
}

export default AdminPosts;
