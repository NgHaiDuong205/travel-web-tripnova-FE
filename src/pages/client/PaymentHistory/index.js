import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import Pagination from "../../../components/common/Pagination";
import FormAlert from "../../../components/common/FormAlert";
import StatusBadge from "../../../components/common/StatusBadge";
import { fetchMyPayments, fetchMyPaymentSummary } from "../../../services/meService";
import { PAYMENT_METHODS } from "../../../services/bookingService";
import { formatDateTime, formatMoney } from "../../../utils/formatters";
import { useT } from "../../../i18n/I18nContext";

const STATUS_FILTERS = [
    { value: "all", labelKey: "account.payments.allTransactions" },
    { value: "success", labelKey: "common.status.paid" },
    { value: "pending", labelKey: "common.status.pending" },
    { value: "failed", labelKey: "common.status.failed" },
    { value: "refunded", labelKey: "common.status.refunded" },
];
const PAGE_SIZE = 10;

function methodLabel(t, value) {
    const method = PAYMENT_METHODS.find((m) => m.value === value);
    const labels = {
        vnpay: "common.paymentMethods.vnpay",
        momo: "common.paymentMethods.momo",
        zalopay: "common.paymentMethods.zalopay",
        credit_card: "common.paymentMethods.credit_card",
        bank_transfer: "common.paymentMethods.bank_transfer",
    };
    return method ? { ...method, label: t(labels[value]) } : { label: value, icon: "payments" };
}

function PaymentHistory() {
    const t = useT();
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchMyPaymentSummary().then(setSummary).catch(() => null);
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchMyPayments({ status, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [status, page]);

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-10">
                <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-on-tertiary-fixed-variant font-semibold">{t("account.payments.financialLedger")}</p>
                        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">{t("nav.sidebar.paymentHistory")}</h1>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(27,28,28,0.06)] min-w-[180px] border-b-2 border-primary">
                            <p className="text-[0.65rem] uppercase tracking-widest text-on-surface-variant mb-1">{t("account.payments.totalPaid")}</p>
                            <p className="text-2xl font-headline font-bold text-primary">
                                {summary ? formatMoney(summary.totalPaid, summary.currencyCode) : "–"}
                            </p>
                        </div>
                        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(27,28,28,0.06)] min-w-[180px] border-b-2 border-tertiary-fixed-dim">
                            <p className="text-[0.65rem] uppercase tracking-widest text-on-surface-variant mb-1">{t("common.status.refunded")}</p>
                            <p className="text-2xl font-headline font-bold text-on-surface">
                                {summary ? formatMoney(summary.totalRefunded, summary.currencyCode) : "–"}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-surface-container-low p-4 rounded-xl flex flex-wrap items-center gap-2">
                    {STATUS_FILTERS.map((f) => (
                        <button
                            key={f.value}
                            type="button"
                            onClick={() => {
                                setStatus(f.value);
                                setPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                status === f.value
                                    ? "bg-primary text-white font-bold"
                                    : "bg-surface-container-lowest text-on-surface-variant hover:bg-white"
                            }`}
                        >
                            {t(f.labelKey)}
                        </button>
                    ))}
                </section>

                <FormAlert>{error}</FormAlert>

                <section className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(27,28,28,0.06)] overflow-x-auto">
                    <div className="min-w-[760px]">
                        <div className="grid grid-cols-6 gap-4 px-8 py-6 border-b border-surface-container-low text-[0.65rem] uppercase tracking-widest text-on-surface-variant font-bold">
                            <div className="col-span-2">{t("account.payments.order")}</div>
                            <div>{t("common.fields.date")}</div>
                            <div>{t("account.payments.method")}</div>
                            <div>{t("account.payments.amount")}</div>
                            <div className="text-right">{t("common.fields.status")}</div>
                        </div>
                        {loading && <p className="px-8 py-10 text-center text-on-surface-variant">{t("common.state.loading")}</p>}
                        {!loading && result.items.length === 0 && !error && (
                            <p className="px-8 py-10 text-center text-on-surface-variant">{t("account.payments.noTransactions")}</p>
                        )}
                        {!loading &&
                            result.items.map((p) => {
                                const method = methodLabel(t, p.paymentMethod);
                                return (
                                    <div
                                        key={p.id}
                                        className="grid grid-cols-6 gap-4 px-8 py-6 items-center hover:bg-surface-container-low transition-all border-b border-surface-container-low/50"
                                    >
                                        <div className="col-span-2 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-primary-fixed-dim flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary-container">apartment</span>
                                            </div>
                                            <div>
                                                {p.bookingId ? (
                                                    <Link to={`/bookings/${p.bookingId}`} className="font-bold text-on-surface text-sm font-mono hover:text-primary">
                                                        {p.orderCode}
                                                    </Link>
                                                ) : (
                                                    <p className="font-bold text-on-surface text-sm font-mono">{p.orderCode}</p>
                                                )}
                                                <p className="text-xs text-on-surface-variant">{t("account.payments.hotelBooking")}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-on-surface">{formatDateTime(p.paidAt || p.createdAt)}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg text-blue-600">{method.icon}</span>
                                            <span className="text-sm text-on-surface">{method.label}</span>
                                        </div>
                                        <div className="font-headline font-bold text-on-surface">{formatMoney(p.amount, p.currencyCode)}</div>
                                        <div className="text-right">
                                            {p.status === "pending" ? (
                                                <Link to={`/payment/${p.id}`} className="text-primary text-xs font-bold hover:underline">
                                                    {t("account.payments.payNow")}
                                                </Link>
                                            ) : (
                                                <StatusBadge status={p.status} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </section>

                <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
            </div>
            <div className="h-24"></div>
        </DashboardLayout>
    );
}

export default PaymentHistory;
