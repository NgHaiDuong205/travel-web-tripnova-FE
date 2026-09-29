import apiClient from "../config/axiosConfig";
import { downloadFile } from "../utils/download";

function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

/** Fetch admin invoices. */
export async function fetchAdminInvoices({ q, from, to, page = 1, limit = 20 } = {}) {
    const response = await apiClient.get("/api/admin/invoices/", {
        params: {
            q: q || undefined,
            from: from || undefined,
            to: to || undefined,
            page: page || undefined,
            limit: limit || undefined,
        },
    });
    return readList(response);
}

/** Fetch one admin invoice. */
export async function fetchAdminInvoice(invoiceId) {
    const { data } = await apiClient.get(`/api/admin/invoices/${invoiceId}/`);
    return data;
}

/** Download one admin invoice. */
export async function downloadAdminInvoice(invoiceId) {
    return downloadFile(`/api/admin/invoices/${invoiceId}/download/`);
}

/** Resend one admin invoice. */
export async function resendAdminInvoice(invoiceId) {
    const { data } = await apiClient.post(`/api/admin/invoices/${invoiceId}/resend/`);
    return data;
}
