import PendingOrderNotice, { usePendingOrders } from "../catalog/PendingOrderNotice";
import { fetchMyBookings } from "../../services/meService";
import { cancelHotelBooking } from "../../services/bookingService";
import { cancelFlightBooking, fetchMyFlightBookings } from "../../services/flightService";
import { cancelCarBooking, fetchMyCarBookings } from "../../services/carService";
import { cancelTourBooking, fetchMyTourBookings } from "../../services/tourService";
import { formatDate, formatDateTime } from "../../utils/formatters";
import { useT } from "../../i18n/I18nContext";

const ALL = () => true;
const REASON = "Cancelled by customer before payment";

/**
 * Mọi đơn chưa thanh toán (còn hạn giữ chỗ) của user — khách sạn, vé máy bay, thuê xe, tour.
 * Đặt ở trang giỏ hàng: thanh toán từ giỏ rồi bấm Back thì dòng đã rời giỏ, vẫn cần lối thanh toán tiếp / huỷ.
 */
function AllPendingOrders() {
    const t = useT();
    const hotel = usePendingOrders(fetchMyBookings, ALL, "all-hotel");
    const flight = usePendingOrders(fetchMyFlightBookings, ALL, "all-flight");
    const car = usePendingOrders(fetchMyCarBookings, ALL, "all-car");
    const tour = usePendingOrders(fetchMyTourBookings, ALL, "all-tour");
    const title = t("catalog.pending.cartTitle");

    return (
        <>
            <PendingOrderNotice
                title={title}
                orders={hotel.orders}
                paymentPath="/payment"
                describe={(bs) => bs.map((b) => `${b.hotelName} · ${b.roomTypeName} · ${formatDate(b.checkInDate)} → ${formatDate(b.checkOutDate)}`).join("; ")}
                onCancel={(bs) => cancelHotelBooking(bs[0].id, REASON)}
                onChanged={hotel.reload}
            />
            <PendingOrderNotice
                title={title}
                orders={flight.orders}
                describe={(bs) =>
                    `${bs[0].flightNumber} ${bs[0].departureAirportCode} → ${bs[0].arrivalAirportCode} · ${formatDateTime(bs[0].departureTime)} · ` +
                    t("catalog.pending.flightSeats", { count: bs.length, seats: bs.map((b) => b.seatNumber).join(", ") })
                }
                onCancel={(bs) => cancelFlightBooking(bs[0].id, REASON)}
                onChanged={flight.reload}
            />
            <PendingOrderNotice
                title={title}
                orders={car.orders}
                describe={(bs) => bs.map((b) => `${b.carName} · ${formatDateTime(b.pickupDate)} → ${formatDateTime(b.returnDate)}`).join("; ")}
                onCancel={(bs) => cancelCarBooking(bs[0].id, REASON)}
                onChanged={car.reload}
            />
            <PendingOrderNotice
                title={title}
                orders={tour.orders}
                describe={(bs) => bs.map((b) => `${b.tourName} · ${formatDate(b.departureDate)}`).join("; ")}
                onCancel={(bs) => cancelTourBooking(bs[0].id, REASON)}
                onChanged={tour.reload}
            />
        </>
    );
}

export default AllPendingOrders;
