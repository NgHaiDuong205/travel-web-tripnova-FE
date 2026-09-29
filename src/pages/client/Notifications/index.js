import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import {
    deleteNotification,
    fetchNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    notificationStyle,
} from "../../../services/notificationService";
import { formatDateTime } from "../../../utils/formatters";

const PAGE_SIZE = 15;

function Notifications() {
    const navigate = useNavigate();
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0, unread: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchNotifications({ unread: unreadOnly, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [unreadOnly, page]);

    const markRead = async (id) => {
        try {
            await markNotificationRead(id);
            setResult((prev) => ({
                ...prev,
                unread: Math.max(0, prev.unread - 1),
                items: prev.items.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const openNotification = async (item) => {
        if (!item.link) return;
        if (!item.isRead) {
            try {
                await markNotificationRead(item.id);
                setResult((prev) => ({
                    ...prev,
                    unread: Math.max(0, prev.unread - 1),
                    items: prev.items.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry)),
                }));
            } catch (err) {
                // Bỏ qua lỗi khi mở liên kết.
            }
        }
        navigate(item.link);
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this notification?")) return;
        setError("");
        try {
            const item = result.items.find((entry) => entry.id === id);
            await deleteNotification(id);
            setResult((prev) => ({
                ...prev,
                total: Math.max(0, prev.total - 1),
                unread: item && !item.isRead ? Math.max(0, prev.unread - 1) : prev.unread,
                items: prev.items.filter((entry) => entry.id !== id),
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const markAll = async () => {
        setError("");
        try {
            await markAllNotificationsRead();
            setResult((prev) => ({ ...prev, unread: 0, items: prev.items.map((item) => ({ ...item, isRead: true })) }));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <DashboardLayout>
            <section className="mb-10">
                <span className="text-[0.75rem] uppercase tracking-[0.2em] text-on-tertiary-fixed-variant mb-2 block">Inbox</span>
                <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-2">Notifications</h1>
                <p className="text-on-surface-variant text-lg">Booking updates, refunds and replies to your reviews.</p>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setUnreadOnly(false);
                            setPage(1);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold ${!unreadOnly ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface"}`}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setUnreadOnly(true);
                            setPage(1);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold ${unreadOnly ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface"}`}
                    >
                        Unread ({result.unread})
                    </button>
                </div>
                <button
                    type="button"
                    disabled={result.unread === 0}
                    onClick={markAll}
                    className="px-4 py-2 rounded-lg text-sm font-bold border border-outline-variant/40 text-primary disabled:opacity-50"
                >
                    Mark all as read
                </button>
            </div>

            <FormAlert>{error}</FormAlert>
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-24 rounded-xl bg-surface-container-high animate-pulse" />
                    ))}
                </div>
            ) : result.items.length === 0 ? (
                <div className="text-center py-16 bg-surface-container-low rounded-xl">
                    <span className="material-symbols-outlined text-5xl text-outline mb-3">notifications_off</span>
                    <p className="text-on-surface-variant">You&apos;re all caught up.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {result.items.map((item) => {
                        const style = notificationStyle(item.type);
                        return (
                            <article
                                key={item.id}
                                className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20"
                            >
                                <button
                                    type="button"
                                    onClick={() => openNotification(item)}
                                    className="flex flex-1 min-w-0 items-center gap-4 text-left"
                                >
                                    <span
                                        className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center ${style.className}`}
                                    >
                                        <span className="material-symbols-outlined">{style.icon}</span>
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span
                                            className={`block ${item.isRead ? "font-normal text-on-surface-variant" : "font-bold"}`}
                                        >
                                            {item.title}
                                        </span>
                                        {item.body && (
                                            <span className="block text-sm text-on-surface-variant mt-1">{item.body}</span>
                                        )}
                                        <span className="block text-xs text-on-surface-variant mt-1">
                                            {formatDateTime(item.createdAt)}
                                        </span>
                                    </span>
                                    {!item.isRead && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />}
                                </button>
                                <div className="flex shrink-0 gap-1">
                                    {!item.isRead && (
                                        <button
                                            type="button"
                                            onClick={() => markRead(item.id)}
                                            title="Mark read"
                                            className="p-2 rounded-lg text-primary hover:bg-surface-container-high"
                                        >
                                            <span className="material-symbols-outlined text-lg">done</span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => remove(item.id)}
                                        title="Delete"
                                        className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </DashboardLayout>
    );
}

export default Notifications;
