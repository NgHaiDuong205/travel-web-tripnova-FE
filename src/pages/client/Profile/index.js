import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import FormAlert from "../../../components/common/FormAlert";
import StatusBadge from "../../../components/common/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { fetchMyDashboard } from "../../../services/meService";
import { BOOKING_STATUS_LABELS } from "../../../services/bookingService";
import { formatDate, formatMoney } from "../../../utils/formatters";

function StatCard({ icon, label, value, footer }) {
    return (
        <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between group hover:bg-primary transition-colors duration-300">
            <div>
                <span className="material-symbols-outlined text-primary group-hover:text-white mb-4" style={{ fontSize: "32px" }}>
                    {icon}
                </span>
                <h4 className="text-on-surface-variant group-hover:text-white/80 text-sm font-medium mb-1">{label}</h4>
                <p className="text-3xl font-headline font-bold text-on-surface group-hover:text-white">{value}</p>
            </div>
            {footer && <div className="mt-6 text-xs text-secondary group-hover:text-secondary-fixed font-bold">{footer}</div>}
        </div>
    );
}

function Profile() {
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchMyDashboard()
            .then(setDashboard)
            .catch((err) => setError(err.message));
    }, []);

    const next = dashboard?.nextBooking;

    return (
        <DashboardLayout>
            <section className="mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-3 block">Member Overview</span>
                        <h1 className="text-4xl lg:text-5xl font-headline font-extrabold text-on-surface tracking-tight leading-tight">
                            Welcome back, <br />
                            {user?.fullName}
                        </h1>
                    </div>
                    {next && (
                        <Link to={`/bookings/${next.id}`} className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-8 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col">
                                <span className="text-xs text-on-surface-variant font-medium">NEXT ADVENTURE</span>
                                <span className="text-primary font-bold">{next.hotelName}</span>
                            </div>
                            <div className="w-px h-10 bg-outline-variant/30"></div>
                            <div className="flex flex-col">
                                <span className="text-xs text-on-surface-variant font-medium">DAYS UNTIL</span>
                                <span className="text-primary font-bold">
                                    {dashboard.daysUntilNextTrip === 0 ? "Today" : `${dashboard.daysUntilNextTrip} Days`}
                                </span>
                            </div>
                        </Link>
                    )}
                </div>
            </section>

            <FormAlert>{error}</FormAlert>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard
                    icon="travel_explore"
                    label="Upcoming Bookings"
                    value={dashboard ? String(dashboard.upcomingBookings).padStart(2, "0") : "–"}
                    footer={
                        <Link to="/booking-history" className="flex items-center gap-1">
                            VIEW DETAILS <span className="material-symbols-outlined text-xs">chevron_right</span>
                        </Link>
                    }
                />
                <div className="bg-tertiary-fixed p-8 rounded-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10">
                        <span className="material-symbols-outlined text-[120px]">workspace_premium</span>
                    </div>
                    <div>
                        <span className="material-symbols-outlined text-on-tertiary-fixed mb-4" style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>
                            stars
                        </span>
                        <h4 className="text-on-tertiary-fixed-variant text-sm font-medium mb-1 uppercase tracking-wider">Loyalty Points</h4>
                        <p className="text-3xl font-headline font-bold text-on-tertiary-fixed">
                            {dashboard ? `${dashboard.loyaltyPoints.toLocaleString()} pts` : "–"}
                        </p>
                    </div>
                </div>
                <StatCard
                    icon="payments"
                    label="Total Spent"
                    value={dashboard ? formatMoney(dashboard.totalSpent, dashboard.currencyCode) : "–"}
                    footer={dashboard ? `${dashboard.completedBookings} completed · ${dashboard.cancelledBookings} cancelled` : null}
                />
            </section>

            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-headline font-bold text-on-surface">Recent Bookings</h3>
                    <Link to="/booking-history" className="text-sm font-bold text-secondary hover:underline">
                        View All History
                    </Link>
                </div>
                <div className="bg-surface-container-lowest rounded-xl overflow-x-auto shadow-sm">
                    <table className="w-full text-left min-w-[640px]">
                        <thead>
                            <tr className="bg-surface-container-low/50">
                                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Property</th>
                                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                            {dashboard?.recentBookings.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-on-surface-variant">
                                        Chưa có đặt phòng nào.{" "}
                                        <Link to="/hotels" className="font-bold text-primary hover:underline">
                                            Tìm khách sạn
                                        </Link>
                                    </td>
                                </tr>
                            )}
                            {dashboard?.recentBookings.map((b) => (
                                <tr key={b.id}>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-sm">hotel</span>
                                            </div>
                                            <Link to={`/bookings/${b.id}`} className="text-sm font-bold text-on-surface hover:text-primary transition-colors">
                                                {b.hotelName}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-on-surface-variant">
                                        {formatDate(b.checkInDate)} – {formatDate(b.checkOutDate)}
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusBadge status={b.status} labels={BOOKING_STATUS_LABELS} />
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-on-surface text-right">
                                        {formatMoney(b.totalPrice, b.currencyCode)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="h-24"></div>
        </DashboardLayout>
    );
}

export default Profile;
