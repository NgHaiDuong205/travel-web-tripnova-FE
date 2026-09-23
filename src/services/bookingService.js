import apiClient from "../config/axiosConfig";

/** Kiểm tra phòng trống + giá (public). */
export async function checkHotelAvailability({ hotelId, roomTypeId, roomId, checkIn, checkOut }) {
    const { data } = await apiClient.get("/api/hotel-bookings/check-availability/", {
        params: { hotelId, roomTypeId, roomId: roomId || undefined, checkIn, checkOut },
    });
    return data;
}

/**
 * Tạo booking (giai đoạn 1) — trả về { orderId, orderCode, bookingId, paymentId, amount, currencyCode, paymentUrl, holdExpiresAt }.
 * @param {{hotelId, roomTypeId, roomId?, checkIn, checkOut, adults, children, specialRequests?, paymentMethod}} payload
 */
export async function createHotelBooking(payload) {
    const { data } = await apiClient.post("/api/hotel-bookings/", payload);
    return data;
}

export async function fetchHotelBooking(bookingId) {
    const { data } = await apiClient.get(`/api/hotel-bookings/${bookingId}/`);
    return data;
}

export async function cancelHotelBooking(bookingId, reason) {
    const { data } = await apiClient.post(`/api/hotel-bookings/${bookingId}/cancel/`, { reason });
    return data;
}

export const PAYMENT_METHODS = [
    { value: "vnpay", label: "VNPay", icon: "account_balance" },
    { value: "momo", label: "MoMo", icon: "account_balance_wallet" },
    { value: "zalopay", label: "ZaloPay", icon: "account_balance_wallet" },
    { value: "credit_card", label: "Credit card", icon: "credit_card" },
    { value: "bank_transfer", label: "Bank transfer", icon: "account_balance" },
];

export const BOOKING_STATUS_LABELS = {
    pending: { label: "Awaiting payment", className: "bg-amber-50 text-amber-700 border-amber-200" },
    confirmed: { label: "Confirmed", className: "bg-green-50 text-green-700 border-green-200" },
    checked_in: { label: "Checked in", className: "bg-blue-50 text-blue-700 border-blue-200" },
    checked_out: { label: "Checked out", className: "bg-gray-50 text-gray-700 border-gray-200" },
    completed: { label: "Completed", className: "bg-gray-50 text-gray-700 border-gray-200" },
    cancelled: { label: "Cancelled", className: "bg-red-50 text-red-700 border-red-200" },
    refunded: { label: "Refunded", className: "bg-purple-50 text-purple-700 border-purple-200" },
    no_show: { label: "No show", className: "bg-red-50 text-red-700 border-red-200" },
};
