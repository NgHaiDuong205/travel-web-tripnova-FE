import { useState } from "react";
import FormAlert from "../common/FormAlert";
import FormInput from "../common/FormInput";
import { updateMyInvoiceBilling } from "../../services/invoiceService";
import { useT } from "../../i18n/I18nContext";

const TAX_CODE_RE = /^[A-Za-z0-9][A-Za-z0-9-]{4,29}$/; // khớp InvoiceBillingRequestDTO

/** Sửa thông tin xuất hoá đơn (tên cá nhân / công ty, địa chỉ, MST). onSaved(invoice) sau khi lưu. */
function InvoiceBillingForm({ invoice, onSaved, onCancel }) {
    const t = useT();
    const [form, setForm] = useState({
        billingName: invoice.billingName || invoice.customerName || "",
        billingAddress: invoice.billingAddress || "",
        billingTaxCode: invoice.billingTaxCode || "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const taxCode = form.billingTaxCode.trim();
        if (!form.billingName.trim()) {
            setError(t("account.invoiceBilling.nameRequired"));
            return;
        }
        if (taxCode && !TAX_CODE_RE.test(taxCode)) {
            setError(t("account.invoiceBilling.invalidTaxCode"));
            return;
        }
        setSaving(true);
        setError("");
        try {
            const updated = await updateMyInvoiceBilling(invoice.id, {
                billingName: form.billingName.trim(),
                billingAddress: form.billingAddress.trim(),
                billingTaxCode: taxCode,
            });
            onSaved(updated);
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 bg-surface-container-low rounded-xl p-5 space-y-4">
            <div>
                <h3 className="font-headline font-bold text-on-surface">{t("account.invoiceBilling.title")}</h3>
                <p className="text-xs text-on-surface-variant mt-1">{t("account.invoiceBilling.hint")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label={t("account.invoiceBilling.name")} maxLength={150} value={form.billingName} onChange={set("billingName")} required />
                <FormInput label={t("account.invoiceBilling.taxCode")} maxLength={30} value={form.billingTaxCode} onChange={set("billingTaxCode")} placeholder="0101234567" />
                <FormInput className="md:col-span-2" label={t("account.invoiceBilling.address")} maxLength={500} value={form.billingAddress} onChange={set("billingAddress")} />
            </div>
            <FormAlert>{error}</FormAlert>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant">
                    {t("common.actions.cancel")}
                </button>
                <button type="submit" disabled={saving} className="bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                    {saving ? t("common.state.saving") : t("common.actions.save")}
                </button>
            </div>
        </form>
    );
}

export default InvoiceBillingForm;
