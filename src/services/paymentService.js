import apiClient from "../config/axiosConfig";

export async function fetchPayment(paymentId) {
    const { data } = await apiClient.get(`/api/payments/${paymentId}/`);
    return data;
}

/** Cổng thanh toán giả lập (backend bật app.payment.mock-enabled). */
export async function confirmMockPayment(paymentId, success) {
    const { data } = await apiClient.post(`/api/payments/${paymentId}/mock-confirm/`, { success });
    return data;
}

export const PAYMENT_STATUS_LABELS = {
    pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
    success: { label: "Paid", className: "bg-green-50 text-green-700 border-green-200" },
    failed: { label: "Failed", className: "bg-red-50 text-red-700 border-red-200" },
    refunded: { label: "Refunded", className: "bg-purple-50 text-purple-700 border-purple-200" },
};
