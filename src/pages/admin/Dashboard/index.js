import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import StatusBadge from "../../../components/common/StatusBadge";
import RevenueChart from "../../../components/admin/RevenueChart";
import { fetchAdminDashboard } from "../../../services/adminService";
import { BOOKING_STATUS_LABELS } from "../../../services/bookingService";
import { formatDate, formatMoney } from "../../../utils/formatters";

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

            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Revenue — last 30 days</h2>
                <p className="text-sm text-gray-500 mb-6">Tổng tiền các giao dịch thanh toán thành công theo ngày.</p>
                <RevenueChart points={data.revenueByDay} currency={data.currencyCode} />
            </section>

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
        </div>
    );
}

export default AdminDashboard;
