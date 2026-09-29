import { Link } from "react-router-dom";
import { formatDate, formatDateTime, formatMoney } from "../../utils/formatters";

/**
 * Nội dung chi tiết hoá đơn (các dòng booking + tổng tiền), dùng chung cho trang khách và admin.
 * `bookingLink(bookingId)` trả về đường dẫn chi tiết booking (bỏ trống = không gắn link).
 */
function InvoiceDetail({ invoice, bookingLink }) {
    const currency = invoice.currencyCode;
    const net = Number(invoice.totalAmount) - Number(invoice.refundedAmount || 0);
    return (
        <div className="space-y-5 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Bill to</p>
                    <p className="font-bold">{invoice.billingName || invoice.customerName}</p>
                    <p className="text-on-surface-variant">{invoice.customerEmail}</p>
                    {invoice.billingAddress && <p className="text-on-surface-variant">{invoice.billingAddress}</p>}
                    {invoice.billingTaxCode && <p className="text-on-surface-variant">Tax code: {invoice.billingTaxCode}</p>}
                </div>
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Payment</p>
                    <p>{invoice.paymentMethod || "—"}</p>
                    {invoice.transactionId && <p className="text-on-surface-variant break-all">Transaction {invoice.transactionId}</p>}
                    {invoice.paidAt && <p className="text-on-surface-variant">Paid {formatDateTime(invoice.paidAt)}</p>}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30">
                            <th className="py-2 pr-3">Item</th>
                            <th className="py-2 pr-3">Period</th>
                            <th className="py-2 pr-3">Nights / days</th>
                            <th className="py-2 pr-3">Status</th>
                            <th className="py-2 text-right">Amount</th>
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
                                        {item.guests != null && ` · ${item.guests} guest${item.guests === 1 ? "" : "s"}`}
                                    </p>
                                </td>
                                <td className="py-2 pr-3 whitespace-nowrap">{formatDate(item.checkInDate)} → {formatDate(item.checkOutDate)}</td>
                                <td className="py-2 pr-3">{item.nights}</td>
                                <td className="py-2 pr-3 capitalize">{item.status?.replace(/_/g, " ")}</td>
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
                <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(invoice.subtotal, currency)}</dd></div>
                {invoice.discountTotal > 0 && (
                    <div className="flex justify-between"><dt>Discount</dt><dd>−{formatMoney(invoice.discountTotal, currency)}</dd></div>
                )}
                <div className="flex justify-between"><dt>Tax</dt><dd>{formatMoney(invoice.taxAmount, currency)}</dd></div>
                <div className="flex justify-between font-bold border-t border-outline-variant/30 pt-1"><dt>Total paid</dt><dd>{formatMoney(invoice.totalAmount, currency)}</dd></div>
                {invoice.refundedAmount > 0 && (
                    <>
                        <div className="flex justify-between text-red-600"><dt>Refunded</dt><dd>−{formatMoney(invoice.refundedAmount, currency)}</dd></div>
                        <div className="flex justify-between font-bold"><dt>Net amount</dt><dd>{formatMoney(net, currency)}</dd></div>
                    </>
                )}
            </dl>
        </div>
    );
}

export default InvoiceDetail;
