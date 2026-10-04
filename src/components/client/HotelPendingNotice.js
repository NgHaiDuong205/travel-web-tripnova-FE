import PendingOrderNotice, { usePendingOrders } from "../catalog/PendingOrderNotice";
import { fetchMyBookings } from "../../services/meService";
import { cancelHotelBooking } from "../../services/bookingService";
import { formatDate } from "../../utils/formatters";

/**
 * Đơn đặt phòng chưa thanh toán của user tại khách sạn `hotelId` (VD bấm Back từ trang /payment):
 * thanh toán tiếp (/payment/:id) hoặc huỷ (huỷ 1 booking pending = huỷ cả order ở BE).
 * `onChanged` được gọi sau khi huỷ (để trang tải lại tình trạng phòng nếu cần).
 */
function HotelPendingNotice({ hotelId, onChanged }) {
    const { orders, reload } = usePendingOrders(fetchMyBookings, (b) => b.hotelId === hotelId, hotelId);
    return (
        <PendingOrderNotice
            orders={orders}
            paymentPath="/payment"
            describe={(bookings) =>
                bookings
                    .map((b) => `${b.roomTypeName}${b.roomNumber ? ` #${b.roomNumber}` : ""} · ${formatDate(b.checkInDate)} → ${formatDate(b.checkOutDate)}`)
                    .join("; ")
            }
            onCancel={(bookings) => cancelHotelBooking(bookings[0].id, "Cancelled by customer before payment")}
            onChanged={() => {
                reload();
                onChanged?.();
            }}
        />
    );
}

export default HotelPendingNotice;
