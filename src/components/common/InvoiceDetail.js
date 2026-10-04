import { Link } from "react-router-dom";
import { formatDate, formatDateTime, formatMoney } from "../../utils/formatters";
import { useT } from "../../i18n/I18nContext";

/**
 * Nội dung chi tiết hoá đơn (các dòng booking + tổng tiền), dùng chung cho trang khách và admin.
 * `bookingLink(bookingId)` trả về đường dẫn chi tiết booking (bỏ trống = không gắn link).
 */
function InvoiceDetail({ invoice, bookingLink }) {
    const t = useT();
    const currency = invoice.currencyCode;
    const net = Number(invoice.totalAmount) - Number(invoice.refundedAmount || 0);
    const paymentMethodKeys = {
        vnpay: "common.paymentMethods.vnpay",
        momo: "common.paymentMethods.momo",
        zalopay: "common.paymentMethods.zalopay",
        credit_card: "common.paymentMethods.credit_card",
        bank_transfer: "common.paymentMethods.bank_transfer",
    };
    return (
        <div className="space-y-5 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{t("account.invoiceDetail.billTo")}</p>
                    <p className="font-bold">{invoice.billingName || invoice.customerName}</p>
                    <p className="text-on-surface-variant">{invoice.customerEmail}</p>
                    {invoice.billingAddress && <p className="text-on-surface-variant">{invoice.billingAddress}</p>}
                    {invoice.billingTaxCode && <p className="text-on-surface-variant">{t("account.invoiceDetail.taxCode", { code: invoice.billingTaxCode })}</p>}
                </div>
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{t("account.invoiceDetail.payment")}</p>
                    <p>{invoice.paymentMethod ? paymentMethodKeys[invoice.paymentMethod] ? t(paymentMethodKeys[invoice.paymentMethod]) : invoice.paymentMethod : "—"}</p>
                    {invoice.transactionId && <p className="text-on-surface-variant break-all">{t("account.invoiceDetail.transaction", { id: invoice.transactionId })}</p>}
                    {invoice.paidAt && <p className="text-on-surface-variant">{t("account.invoiceDetail.paid", { date: formatDateTime(invoice.paidAt) })}</p>}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30">
                            <th className="py-2 pr-3">{t("account.invoiceDetail.item")}</th>
                            <th className="py-2 pr-3">{t("account.invoiceDetail.period")}</th>
                            <th className="py-2 pr-3">{t("account.invoiceDetail.nightsDays")}</th>
                            <th className="py-2 pr-3">{t("common.fields.status")}</th>
                            <th className="py-2 text-right">{t("account.invoiceDetail.amount")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(invoice.items || []).map((item) => (
                            <tr key={item.bookingId} className="border-b border-outline-variant/20 align-top">
                                <td className="py-2 pr-3">
                                    {bookingLink && item.itemType !== "car" ? (
                                        <Link to={bookingLink(item.bookingId)} className="font-bold text-primary hover:underline">{item.title || item.hotelName}</Link>
                                    ) : (
                                        <span className="font-bold">{item.title || item.hotelName}</span>
                                    )}
                                    <p className="text-xs text-on-surface-variant">
                                        {item.subtitle || item.roomTypeName}
                                        {item.guests != null && t("account.invoiceDetail.guests", { count: item.guests })}
                                    </p>
                                </td>
                                <td className="py-2 pr-3 whitespace-nowrap">{formatDate(item.checkInDate)} → {formatDate(item.checkOutDate)}</td>
                                <td className="py-2 pr-3">{item.nights}</td>
                                <td className="py-2 pr-3 capitalize">{t(`common.status.${item.status}`, { defaultValue: item.status?.replace(/_/g, " ") })}</td>
                                <td className="py-2 text-right whitespace-nowrap">
                                    {formatMoney(item.amount, currency)}
                                    {item.refundAmount > 0 && <p className="text-xs text-red-600">−{formatMoney(item.refundAmount, currency)}</p>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <dl className="ml-auto max-w-xs space-y-1">
                <div className="flex justify-between"><dt>{t("account.invoiceDetail.subtotal")}</dt><dd>{formatMoney(invoice.subtotal, currency)}</dd></div>
                {invoice.discountTotal > 0 && (
                    <div className="flex justify-between"><dt>{t("account.invoiceDetail.discount")}</dt><dd>−{formatMoney(invoice.discountTotal, currency)}</dd></div>
                )}
                <div className="flex justify-between"><dt>{t("account.invoiceDetail.tax")}</dt><dd>{formatMoney(invoice.taxAmount, currency)}</dd></div>
                <div className="flex justify-between font-bold border-t border-outline-variant/30 pt-1"><dt>{t("account.invoiceDetail.totalPaid")}</dt><dd>{formatMoney(invoice.totalAmount, currency)}</dd></div>
                {invoice.refundedAmount > 0 && (
                    <>
                        <div className="flex justify-between text-red-600"><dt>{t("common.status.refunded")}</dt><dd>−{formatMoney(invoice.refundedAmount, currency)}</dd></div>
                        <div className="flex justify-between font-bold"><dt>{t("account.invoiceDetail.netAmount")}</dt><dd>{formatMoney(net, currency)}</dd></div>
                    </>
                )}
            </dl>
        </div>
    );
}

export default InvoiceDetail;
