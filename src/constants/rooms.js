import { fromDisplayToUsd } from "../utils/currency";

/** "Deluxe Twin Room" -> "deluxe-twin-room" (khoá lọc loại phòng / tiện nghi). */
export function toSlug(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-");
}

/** Lựa chọn bộ lọc "Loại phòng" lấy từ chính danh sách phòng (rẻ → đắt), kèm số phòng mỗi loại. */
export function roomTypeOptionsFrom(rooms) {
  const byType = new Map();
  for (const room of rooms) {
    const name = room.roomTypeName || room.roomTypeId;
    if (!name) continue;
    const id = toSlug(name);
    const cur = byType.get(id) || { id, label: name, count: 0, price: Infinity };
    cur.count += 1;
    if (room.price != null) cur.price = Math.min(cur.price, room.price);
    byType.set(id, cur);
  }
  return [...byType.values()]
    .sort((a, b) => a.price - b.price || a.label.localeCompare(b.label))
    .map(({ id, label, count }) => ({ id, label: `${label} (${count})` }));
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

/** Kiểm tra phòng còn trống trong khoảng check-in / check-out */
export function isRoomAvailable(room, checkIn, checkOut) {
  const inDate = parseDate(checkIn);
  const outDate = parseDate(checkOut);
  if (!inDate || !outDate || outDate <= inDate) return true;

  const booked = room.bookedRanges || [];
  return !booked.some(({ start, end }) => {
    const bookedStart = parseDate(start);
    const bookedEnd = parseDate(end);
    if (!bookedStart || !bookedEnd) return false;
    return rangesOverlap(inDate, outDate, bookedStart, bookedEnd);
  });
}

export function filterRooms(rooms, filters) {
  const {
    checkIn = "",
    checkOut = "",
    maxGuests = 1,
    minPrice = "",
    maxPrice = "",
    roomTypeIds = [],
    amenityIds = [],
  } = filters;

  const guestCount = Math.max(1, Number(maxGuests) || 1);
  // Ô lọc nhập theo tiền hiển thị (VND khi tiếng Việt), giá phòng từ API là USD
  const min = minPrice !== "" && minPrice != null ? fromDisplayToUsd(minPrice) : null;
  const max = maxPrice !== "" && maxPrice != null ? fromDisplayToUsd(maxPrice) : null;

  return rooms.filter((room) => {
    const roomTypeSlug = toSlug(room.roomTypeName || room.roomTypeId);
    if (
      roomTypeIds.length > 0 &&
      !roomTypeIds.includes(room.roomTypeId) &&
      !roomTypeIds.includes(roomTypeSlug)
    ) {
      return false;
    }
    if (room.maxGuests < guestCount) {
      return false;
    }

    const roomAmenitySlugs = (room.amenityIds || []).map(toSlug);
    if (
      amenityIds.length > 0 &&
      !amenityIds.every(
        (id) => room.amenityIds.includes(id) || roomAmenitySlugs.includes(id)
      )
    ) {
      return false;
    }
    if (
      !filters.skipAvailabilityFilter &&
      checkIn &&
      checkOut &&
      !isRoomAvailable(room, checkIn, checkOut)
    ) {
      return false;
    }
    if (min != null && !Number.isNaN(min) && room.price < min) {
      return false;
    }
    if (max != null && !Number.isNaN(max) && room.price > max) {
      return false;
    }
    return true;
  });
}

export function getRoomTypeName(roomTypeId, roomTypeName) {
  return roomTypeName || roomTypeId;
}
