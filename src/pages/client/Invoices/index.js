import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../../components/common/StatusBadge";
import InvoiceDetail from "../../../components/common/InvoiceDetail";
import { ORDER_STATUS_LABELS, downloadMyInvoice, fetchMyInvoice, fetchMyInvoices } from "../../../services/invoiceService";
import { formatDateTime, formatMoney } from "../../../utils/formatters";

const PAGE_SIZE = 10;

/** Hoá đơn của user: mỗi order đã thanh toán có một hoá đơn, tải được file PDF. */
function Invoices() {
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openId, setOpenId] = useState(null);
    const [details, setDetails] = useState({});
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchMyInvoices({ page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [page]);

    const toggle = async (invoiceId) => {
        if (openId === invoiceId) {
            setOpenId(null);
            return;
        }
        setOpenId(invoiceId);
        if (!details[invoiceId]) {
            try {
                const detail = await fetchMyInvoice(invoiceId);
                setDetails((prev) => ({ ...prev, [invoiceId]: detail }));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleDownload = async (invoiceId) => {
        setDownloadingId(invoiceId);
        setError("");
        try {
            await downloadMyInvoice(invoiceId);
        } catch (err) {
            setError(err.message);
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <DashboardLayout>
            <section className="mb-10">
                <span className="text-[0.75rem] uppercase tracking-[0.2em] text-on-tertiary-fixed-variant mb-2 block">Billing</span>
                <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-2">Invoices</h1>
                <p className="text-on-surface-variant text-lg">An invoice is issued automatically for every paid order.</p>
            </section>

            <FormAlert>{error}</FormAlert>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 rounded-xl bg-surface-container-high animate-pulse" />
                    ))}
                </div>
            ) : result.items.length === 0 ? (
                <div className="text-center py-16 bg-surface-container-low rounded-xl">
                    <span className="material-symbols-outlined text-5xl text-outline mb-3">receipt_long</span>
                    <p className="text-on-surface-variant mb-4">No invoices yet. They appear here once a booking is paid.</p>
                    <Link to="/hotels" className="text-sm font-bold text-primary hover:underline">Book a stay</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {result.items.map((invoice) => (
                        <article key={invoice.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                            <div className="flex flex-wrap items-center gap-4 p-5">
                                <div className="w-11 h-11 rounded-lg bg-primary-fixed-dim flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">receipt_long</span>
                                </div>
                                <div className="flex-1 min-w-[180px]">
                                    <p className="font-bold">{invoice.invoiceNumber}</p>
                                    <p className="text-xs text-on-surface-variant">
                                        Order {invoice.orderCode} · issued {formatDateTime(invoice.issuedAt)}
                                    </p>
                                </div>
                                <StatusBadge status={invoice.orderStatus} labels={ORDER_STATUS_LABELS} />
                                <div className="text-right">
                                    <p className="font-headline font-bold text-lg">{formatMoney(invoice.totalAmount, invoice.currencyCode)}</p>
                                    {invoice.refundedAmount > 0 && (
                                        <p className="text-xs text-red-600">Refunded {formatMoney(invoice.refundedAmount, invoice.currencyCode)}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => toggle(invoice.id)} className="px-3 py-2 rounded-lg text-xs font-bold hover:bg-surface-container-high">
                                        {openId === invoice.id ? "Hide" : "Details"}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={downloadingId === invoice.id}
                                        onClick={() => handleDownload(invoice.id)}
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold bg-primary text-on-primary disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">download</span>
                                        {downloadingId === invoice.id ? "Preparing..." : "PDF"}
                                    </button>
                                </div>
                            </div>
                            {openId === invoice.id && (
                                <div className="border-t border-outline-variant/20 p-5">
                                    {details[invoice.id] ? (
                                        <InvoiceDetail invoice={details[invoice.id]} bookingLink={(id) => `/bookings/${id}`} />
                                    ) : (
                                        <p className="text-sm text-on-surface-variant">Loading...</p>
                                    )}
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}

            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </DashboardLayout>
    );
}

export default Invoices;
