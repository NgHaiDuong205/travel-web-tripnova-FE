import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import StatusBadge from "../../../components/common/StatusBadge";
import RevenueChart from "../../../components/admin/RevenueChart";
import {
    fetchAdminDashboard,
    fetchAdminRecentPayments,
    fetchAdminRevenue,
    fetchAdminStatistics,
    fetchAdminTopDestinations,
    fetchAdminTopHotels,
} from "../../../services/adminService";
import { BOOKING_STATUS_LABELS } from "../../../services/bookingService";
import { PAYMENT_STATUS_LABELS } from "../../../services/paymentService";
import { formatDate, formatDateTime, formatMoney, isoDateFromToday } from "../../../utils/formatters";

function StatTile({ icon, label, value, to }) {
    const body = (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
            <span className="material-symbols-outlined text-primary mb-3">{icon}</span>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
        </div>
    );
    return to ? <Link to={to} className="block hover:-translate-y-0.5 transition-transform">{body}</Link> : body;
}

const PERIODS = [
    { key: "7d", label: "7 days", days: 7, granularity: "day" },
    { key: "30d", label: "30 days", days: 30, granularity: "day" },
    { key: "90d", label: "90 days", days: 90, granularity: "week" },
    { key: "12m", label: "12 months", days: 365, granularity: "month" },
];
const GRANULARITY_LABELS = { day: "theo ngày", week: "theo tuần (bắt đầu thứ Hai)", month: "theo tháng" };

/** % thay đổi so với kỳ trước; null nếu kỳ trước = 0 (không so sánh được). */
function changePercent(current, previous) {
    const prev = Number(previous);
    if (!prev) return null;
    return ((Number(current) - prev) / prev) * 100;
}

function PeriodTile({ label, value, current, previous }) {
    const change = previous === undefined ? undefined : changePercent(current, previous);
    return (
        <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
            {change !== undefined && (
                <p className={`text-xs mt-1 font-semibold ${change == null ? "text-gray-400" : change >= 0 ? "text-green-700" : "text-red-600"}`}>
                    {change == null ? "Không có dữ liệu kỳ trước" : `${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(1)}% so với kỳ trước`}
                </p>
            )}
        </div>
    );
}

function TopList({ title, items, currency, emptyText }) {
    return (
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
            {items.length === 0 && <p className="text-sm text-gray-500">{emptyText}</p>}
            <ol className="space-y-3">
                {items.map((item, i) => (
                    <li key={item.id} className="flex items-center gap-3">
                        <span className="w-6 text-sm font-bold text-gray-400">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                                {item.subtitle ? `${item.subtitle} · ` : ""}
                                {item.bookings} bookings · {item.nights} nights
                            </p>
                        </div>
                        <span className="font-bold text-gray-900 whitespace-nowrap">{formatMoney(item.revenue, currency)}</span>
                    </li>
                ))}
            </ol>
        </section>
    );
}

function PeriodPerformance({ currency }) {
    const [periodKey, setPeriodKey] = useState("30d");
    const [state, setState] = useState({ loading: true, error: "", stats: null, revenue: [], topHotels: [], topDestinations: [] });
    const period = PERIODS.find((p) => p.key === periodKey);

    useEffect(() => {
        let cancelled = false;
        const range = { from: isoDateFromToday(-(period.days - 1)), to: isoDateFromToday(0) };
        setState((prev) => ({ ...prev, loading: true, error: "" }));
        Promise.all([
            fetchAdminStatistics({ ...range, granularity: period.granularity }),
            fetchAdminRevenue({ ...range, groupBy: period.granularity }),
            fetchAdminTopHotels(range),
            fetchAdminTopDestinations(range),
        ])
            .then(([stats, revenue, topHotels, topDestinations]) => {
                if (!cancelled) setState({ loading: false, error: "", stats, revenue, topHotels, topDestinations });
            })
            .catch((err) => !cancelled && setState((prev) => ({ ...prev, loading: false, error: err.message })));
        return () => {
            cancelled = true;
        };
    }, [period]);

    const { stats } = state;
    return (
        <div className="space-y-8">
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Performance</h2>
                        {stats && (
                            <p className="text-sm text-gray-500">
                                {formatDate(stats.from)} – {formatDate(stats.to)}, so với {period.label} liền trước
                            </p>
                        )}
                    </div>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden" role="group" aria-label="Chọn khoảng thời gian">
                        {PERIODS.map((p) => (
                            <button
                                key={p.key}
                                type="button"
                                aria-pressed={p.key === periodKey}
                                onClick={() => setPeriodKey(p.key)}
                                className={`px-3 py-1.5 text-xs font-bold ${p.key === periodKey ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <FormAlert>{state.error}</FormAlert>
                {state.loading && !stats && <p className="text-gray-500">Đang tải...</p>}

                {stats && (
                    <div className={`space-y-6 ${state.loading ? "opacity-60" : ""}`}>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            <PeriodTile label="Revenue" value={formatMoney(stats.revenue, currency)} current={stats.revenue} previous={stats.previousRevenue} />
                            <PeriodTile label="Bookings" value={stats.totalBookings.toLocaleString()} current={stats.totalBookings} previous={stats.previousBookings} />
                            <PeriodTile label="New users" value={stats.newUsers.toLocaleString()} current={stats.newUsers} previous={stats.previousNewUsers} />
                            <PeriodTile label="Refunded" value={formatMoney(stats.refundedAmount, currency)} />
                            <PeriodTile label="Avg. booking value" value={formatMoney(stats.averageBookingValue, currency)} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-4">
                                Doanh thu = tổng giao dịch thanh toán thành công {GRANULARITY_LABELS[period.granularity]}.
                            </p>
                            <RevenueChart points={state.revenue} currency={currency} emptyText={`Chưa có doanh thu trong ${period.label} qua`} />
                        </div>
                    </div>
                )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TopList title="Top hotels" items={state.topHotels} currency={currency} emptyText="Chưa có đặt phòng đã thanh toán trong kỳ." />
                <TopList title="Top destinations" items={state.topDestinations} currency={currency} emptyText="Chưa có đặt phòng đã thanh toán trong kỳ." />
            </div>
            <p className="text-xs text-gray-500 -mt-6">Xếp hạng theo doanh thu ròng (đã trừ tiền hoàn) của đặt phòng tạo trong kỳ.</p>
        </div>
    );
}

function RecentPayments({ currency }) {
    const [payments, setPayments] = useState(null);
    useEffect(() => {
        fetchAdminRecentPayments(8).then(setPayments).catch(() => setPayments([]));
    }, []);
    return (
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent payments</h2>
                <Link to="/admin/payments" className="text-sm font-bold text-primary hover:underline">View all</Link>
            </div>
            {payments === null && <p className="text-sm text-gray-500">Đang tải...</p>}
            {payments?.length === 0 && <p className="text-sm text-gray-500">Chưa có giao dịch.</p>}
            {payments?.length > 0 && (
                <table className="w-full text-left text-sm min-w-[560px]">
                    <thead>
                        <tr className="text-xs uppercase text-gray-500">
                            <th className="py-2">Order</th>
                            <th className="py-2">Customer</th>
                            <th className="py-2">Date</th>
                            <th className="py-2">Status</th>
                            <th className="py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((p) => (
                            <tr key={p.id} className="border-t border-gray-100">
                                <td className="py-2 font-mono">{p.orderCode}</td>
                                <td className="py-2 max-w-[200px] truncate">{p.userEmail}</td>
                                <td className="py-2 whitespace-nowrap">{formatDateTime(p.paidAt || p.createdAt)}</td>
                                <td className="py-2"><StatusBadge status={p.status} labels={PAYMENT_STATUS_LABELS} /></td>
                                <td className="py-2 text-right font-semibold">{formatMoney(p.amount, p.currencyCode || currency)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}

function AdminDashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAdminDashboard().then(setData).catch((err) => setError(err.message));
    }, []);

    if (!data) {
        return error ? <FormAlert>{error}</FormAlert> : <p className="text-gray-500">Đang tải...</p>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-extrabold text-primary">Dashboard</h1>

            <section className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                <StatTile icon="payments" label="Total revenue" value={formatMoney(data.totalRevenue, data.currencyCode)} to="/admin/payments" />
                <StatTile icon="hotel" label="Bookings" value={data.totalBookings.toLocaleString()} to="/admin/bookings" />
                <StatTile icon="group" label="Users" value={data.totalUsers.toLocaleString()} to="/admin/users" />
                <StatTile icon="apartment" label="Active hotels" value={`${data.activeHotels.toLocaleString()} / ${data.totalHotels.toLocaleString()}`} />
                <StatTile icon="mail" label="New messages" value={data.newContactMessages.toLocaleString()} to="/admin/messages" />
            </section>

            <PeriodPerformance currency={data.currencyCode} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Bookings by status</h2>
                    {Object.keys(data.bookingsByStatus).length === 0 && <p className="text-sm text-gray-500">Chưa có đặt phòng.</p>}
                    <ul className="space-y-3">
                        {Object.entries(data.bookingsByStatus).map(([status, count]) => (
                            <li key={status} className="flex items-center justify-between">
                                <Link to={`/admin/bookings?status=${status}`}>
                                    <StatusBadge status={status} labels={BOOKING_STATUS_LABELS} />
                                </Link>
                                <span className="font-bold text-gray-900">{count.toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="xl:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Recent bookings</h2>
                        <Link to="/admin/bookings" className="text-sm font-bold text-primary hover:underline">View all</Link>
                    </div>
                    <table className="w-full text-left text-sm min-w-[560px]">
                        <thead>
                            <tr className="text-xs uppercase text-gray-500">
                                <th className="py-2">Order</th>
                                <th className="py-2">Guest</th>
                                <th className="py-2">Hotel</th>
                                <th className="py-2">Stay</th>
                                <th className="py-2">Status</th>
                                <th className="py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentBookings.map((b) => (
                                <tr key={b.id} className="border-t border-gray-100">
                                    <td className="py-2 font-mono">{b.orderCode}</td>
                                    <td className="py-2">{b.userFullName}</td>
                                    <td className="py-2 max-w-[180px] truncate">{b.hotelName}</td>
                                    <td className="py-2 whitespace-nowrap">{formatDate(b.checkInDate)}</td>
                                    <td className="py-2"><StatusBadge status={b.status} labels={BOOKING_STATUS_LABELS} /></td>
                                    <td className="py-2 text-right font-semibold">{formatMoney(b.totalPrice, b.currencyCode)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>

            <RecentPayments currency={data.currencyCode} />
        </div>
    );
}

export default AdminDashboard;
