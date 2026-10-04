import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import PostCard from "../../../components/client/PostCard";
import { POST_STATUS_LABELS, fetchMyPosts } from "../../../services/postService";
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 10;

/** Đánh giá của chính mình ở mọi trạng thái (chờ duyệt / đã đăng / bị từ chối). */
function MyReviews() {
    const t = useT();
    const tabs = [
        { value: "", label: t("common.status.all") },
        ...Object.keys(POST_STATUS_LABELS).map((value) => ({ value, label: t(`reviews.status.${value}`) })),
    ];
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchMyPosts({ status, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [status, page, reloadKey]);

    const replacePost = (updated) =>
        setResult((prev) => ({ ...prev, items: prev.items.map((p) => (p.id === updated.id ? updated : p)) }));

    return (
        <DashboardLayout>
            <section className="mb-10">
                <span className="text-[0.75rem] uppercase tracking-[0.2em] text-on-tertiary-fixed-variant mb-2 block">{t("reviews.myReviews.community")}</span>
                <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-2">{t("reviews.myReviews.title")}</h1>
                <p className="text-on-surface-variant text-lg">{t("reviews.myReviews.subtitle")}</p>
            </section>

            <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => {
                            setStatus(tab.value);
                            setPage(1);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                            status === tab.value ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <FormAlert>{error}</FormAlert>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-32 rounded-xl bg-surface-container-high animate-pulse" />
                    ))}
                </div>
            ) : result.items.length === 0 ? (
                <div className="text-center py-16 bg-surface-container-low rounded-xl">
                    <span className="material-symbols-outlined text-5xl text-outline mb-3">rate_review</span>
                    <p className="text-on-surface-variant mb-4">{t(status ? "reviews.myReviews.emptyFiltered" : "reviews.myReviews.empty")}</p>
                    <Link to="/hotels" className="text-sm font-bold text-primary hover:underline">{t("reviews.myReviews.findHotel")}</Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {result.items.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            showEntity
                            onChange={replacePost}
                            onDeleted={() => setReloadKey((k) => k + 1)}
                        />
                    ))}
                </div>
            )}

            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </DashboardLayout>
    );
}

export default MyReviews;
