import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import BookingListItem from "../../../components/client/BookingListItem";
import Pagination from "../../../components/common/Pagination";
import FormAlert from "../../../components/common/FormAlert";
import { fetchMyBookings, fetchMyDashboard } from "../../../services/meService";
import { formatMoney } from "../../../utils/formatters";
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 5;

function BookingHistory() {
    const t = useT();
    const statusFilters = [
        { value: "all", label: t("common.status.all") },
        { value: "upcoming", label: t("common.status.upcoming") },
        { value: "pending", label: t("booking.statuses.awaitingPayment") },
        { value: "completed", label: t("common.status.completed") },
        { value: "cancelled", label: t("common.status.cancelled") },
    ];
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchMyDashboard().then(setStats).catch(() => null);
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchMyBookings({ status, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [status, page]);

    const changeStatus = (value) => {
        setStatus(value);
        setPage(1);
    };

    return (
        <DashboardLayout>
            <section className="mb-10">
                <span className="uppercase tracking-[0.15em] text-[10px] font-bold text-primary-container mb-2 block">{t("booking.history.memberDashboard")}</span>
                <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface font-headline">{t("booking.history.title")}</h2>
            </section>

            <section className="grid grid-cols-12 gap-6 mb-12">
                <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-6 rounded-xl">
                    <span className="uppercase text-[9px] font-bold text-on-surface-variant mb-2 block">{t("common.fields.status")}</span>
                    <div className="flex flex-wrap gap-2">
                        {statusFilters.map((f) => (
                            <button
                                key={f.value}
                                type="button"
                                onClick={() => changeStatus(f.value)}
                                className={`px-4 py-1.5 rounded-full text-xs transition-colors ${
                                    status === f.value
                                        ? "bg-primary text-white font-bold"
                                        : "bg-surface-container-lowest text-on-surface-variant font-medium hover:bg-white"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-4 bg-primary text-white p-6 rounded-xl relative overflow-hidden flex items-center">
                    <div className="z-10">
                        <p className="text-[10px] font-bold tracking-widest uppercase opacity-70 mb-1">{t("booking.history.totalTrips")}</p>
                        <h3 className="text-3xl font-black font-headline">{stats?.totalBookings ?? "–"}</h3>
                    </div>
                    <div className="ml-auto z-10 text-right">
                        <p className="text-[10px] font-bold tracking-widest uppercase opacity-70 mb-1">{t("booking.history.totalSpent")}</p>
                        <h3 className="text-xl font-bold font-headline">
                            {stats ? formatMoney(stats.totalSpent, stats.currencyCode) : "–"}
                        </h3>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-container rounded-full blur-3xl opacity-50"></div>
                </div>
            </section>

            <FormAlert>{error}</FormAlert>

            <section className="space-y-6">
                {loading &&
                    Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="h-36 bg-surface-container-high rounded-xl animate-pulse" />
                    ))}
                {!loading && result.items.length === 0 && !error && (
                    <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
                        <span className="material-symbols-outlined text-5xl text-outline mb-3">luggage</span>
                        <p className="text-on-surface-variant mb-6">{t("booking.history.empty")}</p>
                        <Link to="/hotels" className="bg-primary text-white px-6 py-3 rounded-lg font-bold">
                            {t("booking.history.findHotel")}
                        </Link>
                    </div>
                )}
                {!loading && result.items.map((booking) => <BookingListItem key={booking.id} booking={booking} />)}
            </section>

            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
            {!loading && result.total > 0 && (
                <p className="mt-4 text-center text-xs font-medium text-on-surface-variant opacity-60">
                    {t("booking.history.showingBookings", { shown: result.items.length, total: result.total })}
                </p>
            )}
            <div className="h-24"></div>
        </DashboardLayout>
    );
}

export default BookingHistory;
