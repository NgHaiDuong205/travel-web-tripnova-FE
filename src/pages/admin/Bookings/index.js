import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../../components/common/StatusBadge";
import {
    BOOKING_NEXT_STATUSES,
    deleteAdminBooking,
    fetchAdminBookings,
    refundAdminBooking,
    remainingRefundable,
    updateAdminBookingStatus,
} from "../../../services/adminService";
import { BOOKING_STATUS_LABELS } from "../../../services/bookingService";
import { formatDate, formatMoney } from "../../../utils/formatters";
import AdminStatsPanel from "../../../components/admin/AdminStatsPanel";
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 20;
function AdminBookings() {
    const t = useT();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState(searchParams.get("status") || "all");
    const [keyword, setKeyword] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setResult(await fetchAdminBookings({ status, q: query, page, limit: PAGE_SIZE }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [status, query, page]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSearch = (e) => {
        e.preventDefault();
        setQuery(keyword.trim());
        setPage(1);
    };

    const handleAction = async (booking, nextStatus) => {
        let reason;
        if (nextStatus === "cancelled") {
            reason = window.prompt(
                booking.status === "confirmed"
                    ? t("admin.bookings.cancelConfirmedPrompt")
                    : t("admin.bookings.cancelReasonPrompt"),
                ""
            );
            if (reason === null) return;
        }
        setBusyId(booking.id);
        setError("");
        try {
            replaceItem(await updateAdminBookingStatus(booking.id, nextStatus, reason));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const replaceItem = (updated) =>
        setResult((prev) => ({ ...prev, items: prev.items.map((b) => (b.id === updated.id ? updated : b)) }));

    const handleRefund = async (booking) => {
        const remaining = remainingRefundable(booking);
        const input = window.prompt(
            t("admin.bookings.refundPrompt", { amount: formatMoney(remaining, booking.currencyCode) }),
            String(remaining)
        );
        if (input === null) return;
        const amount = Number(input);
        if (!Number.isFinite(amount) || amount <= 0 || amount > remaining) {
            setError(t("admin.bookings.invalidRefund", { amount: remaining }));
            return;
        }
        const reason = window.prompt(t("admin.bookings.refundReasonPrompt"), "");
        if (reason === null) return;
        setBusyId(booking.id);
        setError("");
        try {
            replaceItem(await refundAdminBooking(booking.id, { amount, reason }));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (booking) => {
        if (!window.confirm(t("admin.bookings.confirmDelete", { order: booking.orderCode }))) return;
        setBusyId(booking.id);
        setError("");
        try {
            await deleteAdminBooking(booking.id);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">{t("admin.bookings.title")}</h1>
            <AdminStatsPanel section="bookings" />

            <div className="flex flex-wrap gap-3 items-center">
                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-lg border-gray-200 text-sm"
                >
                    <option value="all">{t("common.status.all")}</option>
                    {Object.entries(BOOKING_STATUS_LABELS).map(([value, cfg]) => (
                        <option key={value} value={value}>{t(`admin.status.${value}`, { defaultValue: cfg.label })}</option>
                    ))}
                </select>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder={t("admin.bookings.searchPlaceholder")}
                        className="rounded-lg border-gray-200 text-sm w-72"
                    />
                    <button type="submit" className="bg-primary text-white px-4 rounded-lg text-sm font-bold">{t("common.actions.search")}</button>
                </form>
                <span className="ml-auto text-sm text-gray-500">{t("admin.bookings.count", { count: result.total })}</span>
            </div>

            <FormAlert>{error}</FormAlert>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[960px]">
                    <thead className="bg-gray-50">
                        <tr className="text-xs uppercase text-gray-500">
                            <th className="px-4 py-3">{t("admin.bookings.order")}</th>
                            <th className="px-4 py-3">{t("admin.bookings.guest")}</th>
                            <th className="px-4 py-3">{t("admin.bookings.hotelRoom")}</th>
                            <th className="px-4 py-3">{t("admin.bookings.stay")}</th>
                            <th className="px-4 py-3">{t("common.fields.status")}</th>
                            <th className="px-4 py-3 text-right">{t("common.fields.total")}</th>
                            <th className="px-4 py-3 text-right">{t("admin.bookings.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">{t("common.state.loading")}</td></tr>
                        )}
                        {!loading && result.items.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">{t("admin.bookings.empty")}</td></tr>
                        )}
                        {!loading &&
                            result.items.map((b) => (
                                <tr key={b.id} className="border-t border-gray-100 align-top">
                                    <td className="px-4 py-3 font-mono">{b.orderCode}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold">{b.userFullName}</p>
                                        <p className="text-xs text-gray-500">{b.userEmail}</p>
                                    </td>
                                    <td className="px-4 py-3 max-w-[220px]">
                                        <p className="font-semibold truncate">{b.hotelName}</p>
                                        <p className="text-xs text-gray-500">
                                            {b.roomTypeName}
                                            {b.roomNumber ? t("admin.bookings.roomNumber", { room: b.roomNumber }) : ""}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}
                                        <p className="text-xs text-gray-500">{t("admin.bookings.staySummary", { nights: b.numNights, guests: b.numAdults + (b.numChildren || 0) })}</p>
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge status={b.status} labels={BOOKING_STATUS_LABELS} /></td>
                                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                                        {formatMoney(b.totalPrice, b.currencyCode)}
                                        {Number(b.refundAmount) > 0 && (
                                            <p className="text-xs font-normal text-purple-700" title={b.refundReason || ""}>
                                                {t("admin.bookings.refunded", { amount: formatMoney(b.refundAmount, b.currencyCode) })}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            {(BOOKING_NEXT_STATUSES[b.status] || []).map((next) => (
                                                <button
                                                    key={next}
                                                    type="button"
                                                    disabled={busyId === b.id}
                                                    onClick={() => handleAction(b, next)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold border disabled:opacity-50 ${
                                                        next === "cancelled" || next === "no_show"
                                                            ? "border-red-200 text-red-600 hover:bg-red-50"
                                                            : "border-blue-200 text-primary hover:bg-blue-50"
                                                    }`}
                                                >
                                                    {t(`admin.bookings.actionsByStatus.${next}`, { defaultValue: next })}
                                                </button>
                                            ))}
                                            {remainingRefundable(b) > 0 && (
                                                <button
                                                    type="button"
                                                    disabled={busyId === b.id}
                                                    onClick={() => handleRefund(b)}
                                                    className="px-3 py-1 rounded-lg text-xs font-bold border border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                                                >
                                                    {t("admin.bookings.refund")}
                                                </button>
                                            )}
                                            {b.status === "cancelled" && !b.refundedAt && (
                                                <button
                                                    type="button"
                                                    disabled={busyId === b.id}
                                                    onClick={() => handleDelete(b)}
                                                    className="px-3 py-1 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    {t("common.actions.delete")}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

export default AdminBookings;
