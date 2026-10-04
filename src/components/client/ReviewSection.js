import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FormAlert from "../common/FormAlert";
import Pagination from "../common/Pagination";
import StarRating from "../common/StarRating";
import PostCard from "./PostCard";
import PostForm from "./PostForm";
import { POST_SORTS, createPost, fetchPosts, fetchRatingSummary } from "../../services/postService";
import { useT } from "../../i18n/I18nContext";

const PAGE_SIZE = 5;

function RatingSummary({ summary, t }) {
    const total = summary?.totalReviews || 0;
    return (
        <div className="bg-surface-container-low rounded-xl p-6 space-y-4">
            <div className="flex items-end gap-3">
                <span className="text-5xl font-headline font-bold text-primary">
                    {summary?.averageRating != null ? summary.averageRating.toFixed(1) : "–"}
                </span>
                <div className="pb-1">
                    <StarRating value={summary?.averageRating || 0} />
                    <p className="text-xs text-on-surface-variant">
                        {t("reviews.summary.ratedReviews", { count: total })}
                    </p>
                </div>
            </div>
            <ul className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = summary?.distribution?.[star] || 0;
                    const pct = total ? Math.round((count * 100) / total) : 0;
                    return (
                        <li key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-3 font-bold">{star}</span>
                            <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-8 text-right text-on-surface-variant">{count}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/** Khối đánh giá của một hotel / destination / landmark: tổng điểm, danh sách, viết đánh giá. */
function ReviewSection({ entityType, entityId, title }) {
    const t = useT();
    const { isLoggedIn } = useAuth();
    const location = useLocation();
    const [summary, setSummary] = useState(null);
    const [posts, setPosts] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState("newest");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [writing, setWriting] = useState(false);
    const [notice, setNotice] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [list, stats] = await Promise.all([
                fetchPosts({ entityType, entityId, sort, page, limit: PAGE_SIZE }),
                fetchRatingSummary(entityType, entityId),
            ]);
            setPosts(list.items);
            setTotal(list.total);
            setSummary(stats);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [entityType, entityId, sort, page]);

    useEffect(() => {
        if (entityId) load();
    }, [entityId, load]);

    const replacePost = (updated) => {
        // Bài vừa sửa quay về "pending" -> không còn hiện công khai.
        if (updated.status !== "approved") {
            setPosts((prev) => prev.filter((p) => p.id !== updated.id));
            setNotice(t("reviews.section.updatedPending"));
            return;
        }
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    };

    const handleCreate = async (body) => {
        const created = await createPost(body);
        setWriting(false);
        if (created.status === "approved") {
            setNotice("");
            setPage(1);
            await load();
        } else {
            setNotice(t("reviews.section.submittedPending"));
        }
    };

    return (
        <section className="max-w-screen-xl mx-auto px-8 mb-24">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
                <h2 className="text-3xl font-headline font-bold">{title || t("reviews.section.defaultTitle")}</h2>
                {isLoggedIn ? (
                    !writing && (
                        <button type="button" onClick={() => setWriting(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-bold">
                            <span className="material-symbols-outlined text-[18px]">rate_review</span>
                            {t("reviews.section.writeReview")}
                        </button>
                    )
                ) : (
                    <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`} className="text-sm font-bold text-primary hover:underline">
                        {t("reviews.section.signInToWrite")}
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <aside className="lg:col-span-4 lg:sticky lg:top-28">
                    <RatingSummary summary={summary} t={t} />
                </aside>
                <div className="lg:col-span-8 space-y-6">
                    <FormAlert type="success">{notice}</FormAlert>
                    <FormAlert>{error}</FormAlert>
                    {writing && (
                        <div className="bg-surface-container-lowest rounded-xl p-6 border border-primary/30">
                            <PostForm entityType={entityType} entityId={entityId} onSubmit={handleCreate} onCancel={() => setWriting(false)} />
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-on-surface-variant">
                            {t("common.units.review", { count: total })}
                        </p>
                        <select
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                setPage(1);
                            }}
                            className="rounded-lg border-outline-variant/40 bg-surface-container-lowest text-sm"
                        >
                            {POST_SORTS.map((s) => (
                                <option key={s.value} value={s.value}>{t(`reviews.sort.${s.value}`)}</option>
                            ))}
                        </select>
                    </div>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-32 rounded-xl bg-surface-container-high animate-pulse" />
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-12 bg-surface-container-low rounded-xl">
                            <span className="material-symbols-outlined text-4xl text-outline mb-2">reviews</span>
                            <p className="text-sm text-on-surface-variant">{t("reviews.section.empty")}</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onChange={replacePost}
                                onDeleted={() => load()}
                            />
                        ))
                    )}
                    <Pagination page={page} total={total} limit={PAGE_SIZE} onChange={setPage} />
                </div>
            </div>
        </section>
    );
}

export default ReviewSection;
