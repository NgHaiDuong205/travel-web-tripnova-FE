import { useEffect, useState } from "react";
import { fetchReviewSummary } from "../../services/aiSummaryService";
import { useI18n } from "../../i18n/I18nContext";
import { formatDate } from "../../utils/formatters";

function SummaryList({ icon, iconClass, title, items }) {
    if (!items?.length) return null;
    return (
        <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{title}</h4>
            <ul className="space-y-1.5">
                {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                        <span className={`material-symbols-outlined text-[18px] leading-5 ${iconClass}`}>{icon}</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Tóm tắt review bằng AI (sinh nền ở BE khi tập review đã duyệt thay đổi). Chưa có → không hiện gì.
 * `reloadKey` đổi (VD tổng số review) → tải lại.
 */
function AiReviewSummary({ entityType, entityId, reloadKey }) {
    const { t, lang } = useI18n();
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        if (!entityId) return undefined;
        let cancelled = false;
        fetchReviewSummary(entityType, entityId, lang)
            .then((data) => !cancelled && setSummary(data))
            .catch(() => !cancelled && setSummary(null)); // tóm tắt chỉ là phần phụ: lỗi thì ẩn
        return () => {
            cancelled = true;
        };
    }, [entityType, entityId, lang, reloadKey]);

    if (!summary?.overview) return null;
    return (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-5" data-testid="ai-review-summary">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-headline font-bold text-lg">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                    {t("reviews.aiSummary.title")}
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {t("reviews.aiSummary.basedOn", { count: summary.basedOnCount || 0 })}
                </span>
            </div>
            <p className="text-sm leading-relaxed">{summary.overview}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <SummaryList icon="check_circle" iconClass="text-green-700 dark:text-green-400"
                             title={t("reviews.aiSummary.pros")} items={summary.pros} />
                <SummaryList icon="info" iconClass="text-amber-600 dark:text-amber-400"
                             title={t("reviews.aiSummary.cons")} items={summary.cons} />
            </div>
            {summary.bestFor?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        {t("reviews.aiSummary.bestFor")}
                    </span>
                    {summary.bestFor.map((item) => (
                        <span key={item} className="text-xs px-2.5 py-1 rounded-full bg-surface-container-high">{item}</span>
                    ))}
                </div>
            )}
            <p className="text-[11px] text-on-surface-variant">
                {t("reviews.aiSummary.disclaimer", { date: formatDate(summary.generatedAt) })}
                {summary.stale && <> · {t("reviews.aiSummary.updating")}</>}
            </p>
        </div>
    );
}

export default AiReviewSummary;
