import { useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../../components/common/StatusBadge";
import InvoiceDetail from "../../../components/common/InvoiceDetail";
import { ORDER_STATUS_LABELS } from "../../../services/invoiceService";
import {
    downloadAdminInvoice,
    fetchAdminInvoice,
    fetchAdminInvoices,
    resendAdminInvoice,
} from "../../../services/adminInvoiceService";
import { formatDateTime, formatMoney } from "../../../utils/formatters";
import AdminStatsPanel from "../../../components/admin/AdminStatsPanel";
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 20;
const EMPTY_FILTERS = { q: "", from: "", to: "" };
const buttonClass = "px-3 py-1 rounded-lg text-xs font-bold border disabled:opacity-50";

function AdminInvoices() {
    const t = useT();
    const [form, setForm] = useState(EMPTY_FILTERS);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [busyId, setBusyId] = useState(null);
    const [openId, setOpenId] = useState(null);
    const [details, setDetails] = useState({});

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchAdminInvoices({ ...filters, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [filters, page]);

    const run = async (invoiceId, action) => {
        setBusyId(invoiceId);
        setError("");
        setNotice("");
        try {
            await action();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const toggle = (invoiceId) => {
        if (openId === invoiceId) {
            setOpenId(null);
            return;
        }
        setOpenId(invoiceId);
        if (!details[invoiceId]) {
            run(invoiceId, async () => {
                const detail = await fetchAdminInvoice(invoiceId);
                setDetails((prev) => ({ ...prev, [invoiceId]: detail }));
            });
        }
    };

    const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">{t("admin.invoices.title")}</h1>
            <AdminStatsPanel section="invoices" />

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setFilters({ ...form, q: form.q.trim() });
                    setPage(1);
                }}
                className="flex flex-wrap items-end gap-3"
            >
                <label className="text-xs font-semibold text-gray-500">
                    {t("common.actions.search")}
                    <input value={form.q} onChange={set("q")} placeholder={t("admin.invoices.searchPlaceholder")} className="block mt-1 rounded-lg border-gray-200 text-sm w-72" />
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    {t("admin.invoices.issuedFrom")}
                    <input type="date" value={form.from} onChange={set("from")} className="block mt-1 rounded-lg border-gray-200 text-sm" />
                </label>
                <label className="text-xs font-semibold text-gray-500">
                    {t("common.fields.to")}
                    <input type="date" value={form.to} min={form.from || undefined} onChange={set("to")} className="block mt-1 rounded-lg border-gray-200 text-sm" />
                </label>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white">{t("admin.invoices.filter")}</button>
                <button
                    type="button"
                    onClick={() => {
                        setForm(EMPTY_FILTERS);
                        setFilters(EMPTY_FILTERS);
                        setPage(1);
                    }}
                    className="px-4 py-2 rounded-lg text-sm border border-gray-200 text-gray-600"
                >
                    {t("common.actions.reset")}
                </button>
                <span className="ml-auto text-sm text-gray-500">{t("admin.invoices.count", { count: result.total })}</span>
            </form>

            <FormAlert type="success">{notice}</FormAlert>
            <FormAlert>{error}</FormAlert>
            {loading && <p className="text-gray-500">{t("common.state.loading")}</p>}
            {!loading && result.items.length === 0 && <p className="text-gray-500">{t("admin.invoices.empty")}</p>}

            {!loading && result.items.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3 text-left">{t("admin.invoices.invoice")}</th>
                                <th className="px-4 py-3 text-left">{t("admin.invoices.customer")}</th>
                                <th className="px-4 py-3 text-left">{t("admin.invoices.issued")}</th>
                                <th className="px-4 py-3 text-left">{t("admin.invoices.orderStatus")}</th>
                                <th className="px-4 py-3 text-right">{t("common.fields.total")}</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {result.items.map((inv) => (
                                <InvoiceRow
                                    key={inv.id}
                                    inv={inv}
                                    open={openId === inv.id}
                                    busy={busyId === inv.id}
                                    detail={details[inv.id]}
                                    onToggle={() => toggle(inv.id)}
                                    onDownload={() => run(inv.id, () => downloadAdminInvoice(inv.id))}
                                    onResend={() =>
                                        run(inv.id, async () => {
                                            await resendAdminInvoice(inv.id);
                                            setNotice(t("admin.invoices.resent", { invoice: inv.invoiceNumber, email: inv.customerEmail }));
                                        })
                                    }
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

function InvoiceRow({ inv, open, busy, detail, onToggle, onDownload, onResend }) {
    const t = useT();
    const statusLabels = Object.fromEntries(
        Object.entries(ORDER_STATUS_LABELS).map(([value, cfg]) => [
            value,
            { ...cfg, label: t(`admin.status.${value}`, { defaultValue: cfg.label }) },
        ]),
    );
    return (
        <>
            <tr className="border-t border-gray-100 align-top">
                <td className="px-4 py-3">
                    <p className="font-bold text-gray-900">{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">{t("admin.invoices.order", { order: inv.orderCode })}</p>
                </td>
                <td className="px-4 py-3">
                    <p className="font-semibold">{inv.customerName}</p>
                    <p className="text-xs text-gray-500">{inv.customerEmail}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(inv.issuedAt)}</td>
                <td className="px-4 py-3"><StatusBadge status={inv.orderStatus} labels={statusLabels} /></td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                    <p className="font-bold">{formatMoney(inv.totalAmount, inv.currencyCode)}</p>
                    {inv.refundedAmount > 0 && <p className="text-xs text-red-600">−{formatMoney(inv.refundedAmount, inv.currencyCode)}</p>}
                </td>
                <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onToggle} className={`${buttonClass} border-gray-200 text-gray-700 hover:bg-gray-50`}>
                            {open ? t("admin.invoices.hide") : t("admin.invoices.details")}
                        </button>
                        <button type="button" disabled={busy} onClick={onDownload} className={`${buttonClass} border-blue-200 text-primary hover:bg-blue-50`}>
                            PDF
                        </button>
                        <button type="button" disabled={busy} onClick={onResend} className={`${buttonClass} border-green-200 text-green-700 hover:bg-green-50`}>
                            {t("admin.invoices.resend")}
                        </button>
                    </div>
                </td>
            </tr>
            {open && (
                <tr className="bg-gray-50/60">
                    <td colSpan={6} className="px-6 py-5">
                        {detail ? <InvoiceDetail invoice={detail} /> : <p className="text-gray-500">{t("common.state.loading")}</p>}
                    </td>
                </tr>
            )}
        </>
    );
}

export default AdminInvoices;
