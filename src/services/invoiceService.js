import apiClient from "../config/axiosConfig";
import { downloadFile } from "../utils/download";

function readList(response) {
    const total = Number(response.headers?.["x-total-count"]);
    return { items: response.data, total: Number.isNaN(total) ? response.data.length : total };
}

/** Fetch the current user's invoices. */
export async function fetchMyInvoices({ page = 1, limit = 10 } = {}) {
    const response = await apiClient.get("/api/me/invoices/", {
        params: { page: page || undefined, limit: limit || undefined },
    });
    return readList(response);
}

/** Fetch one of the current user's invoices. */
export async function fetchMyInvoice(invoiceId) {
    const { data } = await apiClient.get(`/api/me/invoices/${invoiceId}/`);
    return data;
}

/** Update billing details (name / address / tax code) of one of the current user's invoices. */
export async function updateMyInvoiceBilling(invoiceId, body) {
    const { data } = await apiClient.put(`/api/me/invoices/${invoiceId}/billing/`, body);
    return data;
}

/** Download one of the current user's invoices. */
export async function downloadMyInvoice(invoiceId) {
    return downloadFile(`/api/me/invoices/${invoiceId}/download/`);
}

export const ORDER_STATUS_LABELS = {
    paid: { label: "Paid", className: "bg-green-50 text-green-700 border-green-200" },
    partially_refunded: { label: "Partially refunded", className: "bg-amber-50 text-amber-700 border-amber-200" },
    refunded: { label: "Refunded", className: "bg-gray-50 text-gray-600 border-gray-200" },
    pending: { label: "Pending", className: "bg-blue-50 text-blue-700 border-blue-200" },
    cancelled: { label: "Cancelled", className: "bg-red-50 text-red-600 border-red-200" },
};
