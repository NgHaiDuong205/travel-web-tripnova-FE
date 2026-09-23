// Loại phòng
export const ROOM_TYPES = [
  { id: "deluxe-room", name: "Deluxe Room" },
  { id: "executive-suite", name: "Executive Suite" },
  { id: "family-suite", name: "Family Suite" },
  { id: "presidential-suite", name: "Presidential Suite" },
  { id: "standard-room", name: "Standard Room" },
  { id: "superior-room", name: "Superior Room" },
];

// Tiện ích phòng / khách sạn
export const ROOM_AMENITIES = [
  { id: "free-wifi", name: "Free Wifi" },
  { id: "high-speed-internet", name: "High-Speed Internet" },
  { id: "business-center", name: "Business Center" },
  { id: "air-conditioning", name: "Air Conditioning" },
  { id: "private-bathroom", name: "Private Bathroom" },
  { id: "mini-bar", name: "Mini Bar" },
  { id: "balcony", name: "Balcony" },
  { id: "room-service", name: "Room Service" },
  { id: "flat-screen-tv", name: "Flat Screen TV" },
  { id: "coffee-maker", name: "Coffee Maker" },
  { id: "safe-box", name: "Safe Box" },
  { id: "swimming-pool", name: "Swimming Pool" },
  { id: "outdoor-pool", name: "Outdoor Pool" },
  { id: "private-beach", name: "Private Beach" },
  { id: "water-park", name: "Water Park" },
  { id: "kids-playground", name: "Kids Playground" },
  { id: "spa", name: "Spa" },
  { id: "massage", name: "Massage" },
  { id: "sauna", name: "Sauna" },
  { id: "hot-tub", name: "Hot Tub" },
  { id: "gym", name: "Gym" },
  { id: "yoga-room", name: "Yoga Room" },
  { id: "tennis-court", name: "Tennis Court" },
  { id: "restaurant", name: "Restaurant" },
  { id: "bar", name: "Bar" },
  { id: "breakfast-included", name: "Breakfast Included" },
  { id: "coffee-shop", name: "Coffee Shop" },
  { id: "airport-shuttle", name: "Airport Shuttle" },
  { id: "free-parking", name: "Free Parking" },
  { id: "car-rental", name: "Car Rental" },
  { id: "bicycle-rental", name: "Bicycle Rental" },
  { id: "24-hour-front-desk", name: "24-Hour Front Desk" },
  { id: "laundry-service", name: "Laundry Service" },
  { id: "daily-housekeeping", name: "Daily Housekeeping" },
  { id: "currency-exchange", name: "Currency Exchange" },
  { id: "cctv-security", name: "CCTV Security" },
  { id: "smoke-detector", name: "Smoke Detector" },
  { id: "fire-extinguisher", name: "Fire Extinguisher" },
];

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
  const min = minPrice !== "" && minPrice != null ? Number(minPrice) : null;
  const max = maxPrice !== "" && maxPrice != null ? Number(maxPrice) : null;

  const toSlug = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-");
  };

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

// Dữ liệu mẫu — sau này thay bằng API
export const SAMPLE_ROOMS = [
  {
    id: "1",
    hotelId: "1",
    hotelName: "Palazzo Avino",
    name: "Belvedere Suite",
    roomTypeId: "executive-suite",
    maxGuests: 4,
    price: 1450,
    currency: "€",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBOj8DlOardf_07VvZ6SNtQtIcL-MOgxEmtI2W5s1_4XAlMQPJ5gurTl8lYRMN2CzV-qVf2O2GAlyuRCjVwJDdfBalDsxs1ZJi9Rw_1fZF2ODCbIzS-nqw4yq_UhX2vbjv8iM49sXj6PFml4eH-s154jlI2i2jFoMtY9xNi1hcKdQKI9hjdFAXyrN0UKaONXd-_9Gpn51U33ma4gRYDsRMwgTZZL_PXLCiJ_BslXWZ6hFfoAfSmvdtdbR3Ib28SdFCbhMCGDeGOd5U",
    description:
      "A bi-level sanctuary featuring a private terrace and a jacuzzi with sweeping coastline views.",
    highlights: ["85sqm Master Quarters", "Private Sun Terrace", "Complimentary Bar"],
    amenityIds: [
      "free-wifi",
      "air-conditioning",
      "private-bathroom",
      "balcony",
      "mini-bar",
      "room-service",
      "flat-screen-tv",
      "spa",
      "breakfast-included",
    ],
    bookedRanges: [
      { start: "2026-06-01", end: "2026-06-10" },
      { start: "2026-08-15", end: "2026-08-22" },
    ],
  },
  {
    id: "2",
    hotelId: "1",
    hotelName: "Palazzo Avino",
    name: "Deluxe Sea View",
    roomTypeId: "deluxe-room",
    maxGuests: 2,
    price: 890,
    currency: "€",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAj6SZZBXBMC_nzWVPEf9gxuemH89w8sl4rAdV_iPPaRQIzLxZy9fXmRGAmgvop4MHtWL2GacWbwbry5uvzkWlMOjRk-rPc9XkX8zn-WhZwkXlZJH2ul6pqIm4i59nDfe0YVz2VjC6NEs6iiGJFaWZhEAf6y7r0ivyEHm2gUwuBY_gNaaZ5PBIi3CptpSwAI6OuFVxiMEkwhS86j5ikGm3CGWalsMCpEKzk7JEKOGW6uKVTn2TiXes5xMxvl_qCZmY3Ku_4f7hbeAI",
    description:
      "Exquisitely decorated with handmade Vietri tiles and locally sourced period furniture.",
    highlights: ["Direct Ocean Gaze", "Carrara Marble Bath", "Nespresso Selection"],
    amenityIds: [
      "free-wifi",
      "air-conditioning",
      "private-bathroom",
      "balcony",
      "coffee-maker",
      "flat-screen-tv",
      "breakfast-included",
    ],
    bookedRanges: [{ start: "2026-07-01", end: "2026-07-08" }],
  },
  {
    id: "3",
    hotelId: "1",
    hotelName: "Palazzo Avino",
    name: "Presidential Cliff Residence",
    roomTypeId: "presidential-suite",
    maxGuests: 6,
    price: 3200,
    currency: "€",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDica0LVvyG3AjHDyb4Gz8R3c780vrTDVPTli2ANKsEsr0SWH-sN5dsbX146pQUAKZ2z7tWz8nwpXE-PZzDlEvM2HkUHOozw-Day_p7jpeZP1dzYxgPCcZRd1vCyZa8Vb806xynX3HZKa4a0NZ0chmwU5HUYJyrrpPcMBurNUWGL5ZxHNEbk7yQI5Xg9RczSZwBmyLZwmDTgeODspQuvtmkHIDDXaSiNprw114z3hqe9BjT_ty6GKD_DqjRWgdIAr5CA7ATO5DEseY",
    description:
      "The pinnacle of coastal luxury with private butler, infinity terrace, and panoramic Tyrrhenian views.",
    highlights: ["Private Butler", "Infinity Terrace", "In-suite Dining"],
    amenityIds: [
      "free-wifi",
      "high-speed-internet",
      "air-conditioning",
      "private-bathroom",
      "mini-bar",
      "balcony",
      "room-service",
      "spa",
      "hot-tub",
      "restaurant",
      "breakfast-included",
      "24-hour-front-desk",
    ],
    bookedRanges: [],
  },
  {
    id: "4",
    hotelId: "1",
    hotelName: "Palazzo Avino",
    name: "Standard Garden Room",
    roomTypeId: "standard-room",
    maxGuests: 2,
    price: 420,
    currency: "€",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBpeI7O9KjK5bmFDmt5hTFME7OJgfjcjSZF0K9ZVRkrMr2sUkdOIH9--TUex6sR2Idh43EM6KP-1AlFtiiYEVvANkWM1Q0pRC7uZvkEVA9ZgEs95h2w6j6CC3vgNJo5PMgWA-rDA3yuLXyWHYy_GIzNq_8mKIZzM4qy9ROJTAV3sag0p5FVGc9HyXw98_dMOxkpnhBgsTqH13freoGesQ0z3key7hGLMVXFCYazigjdEzuhZdTn6AWMlLepsLwK4tSKPCKccg9SlZE",
    description: "Quiet garden-facing room with classic Italian furnishings and daily housekeeping.",
    highlights: ["Garden View", "Queen Bed", "Marble Bathroom"],
    amenityIds: [
      "free-wifi",
      "air-conditioning",
      "private-bathroom",
      "daily-housekeeping",
      "safe-box",
      "smoke-detector",
    ],
    bookedRanges: [{ start: "2026-05-20", end: "2026-05-28" }],
  },
  {
    id: "5",
    hotelId: "1",
    hotelName: "Palazzo Avino",
    name: "Family Amalfi Suite",
    roomTypeId: "family-suite",
    maxGuests: 5,
    price: 1180,
    currency: "€",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCXkvSBeNlQ7vSDzTNmJ3mwHNulii88LSZ8XUsGkgf8gfMKVpF3RQ7TPoUxMfUopwHMxKJAXnUknGxCAIOOXf6YsLd06Shxbi6gWjzxmuJHtN3oIvov7z39hQE0YudbQXOQS-xUT1waXwcbMJP404JfclHY-tJaZEfLQs5BlIorfuQlR_89NLy1aOHktzYoqWMJC1oFPOUQYfzdWtVo_-Qa_Sq3P9Rhpig05FqMO6iQKXKBbxnqGCFqjDz1ZHDV30p6VBwdE9vZGUI",
    description:
      "Two-bedroom suite ideal for families, with connecting terrace and kids welcome amenities.",
    highlights: ["2 Bedrooms", "Connecting Terrace", "Kids Amenities"],
    amenityIds: [
      "free-wifi",
      "air-conditioning",
      "private-bathroom",
      "balcony",
      "kids-playground",
      "swimming-pool",
      "breakfast-included",
      "laundry-service",
    ],
    bookedRanges: [],
  },
  {
    id: "6",
    hotelId: "1",
    hotelName: "Palazzo Avino",
    name: "Superior Coastal Room",
    roomTypeId: "superior-room",
    maxGuests: 3,
    price: 650,
    currency: "€",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCMdJt3Q4_NbWaTNYR0NrxCrbFe0fs0mdAZjxoo3A7I9_9bgUEkpjQGqkp9k6Ho7I-kPp-o0maN61c0ZeWcwoywOU2IO-yqjyRzux2JIrJ6QZqu2DpyUqVY2xMDHPbbiTpzTUpOX4ViXWwHt9oh2MzU1AUmb5g-QMwOcBQQdowqfVBiWfKIlvXDF6JShP3Oe0yWNlZlD2Tl21Js5v3v0V6WrQRQGPJ6osXVvGRSKbWaF7t4NjyTC0yapdTG_drCwH-znbPH-wT78V0",
    description: "Elevated comfort with partial sea views, superior linens, and curated minibar.",
    highlights: ["Partial Sea View", "Superior Linens", "Curated Minibar"],
    amenityIds: [
      "free-wifi",
      "air-conditioning",
      "private-bathroom",
      "mini-bar",
      "flat-screen-tv",
      "coffee-maker",
      "gym",
    ],
    bookedRanges: [{ start: "2026-09-01", end: "2026-09-07" }],
  },
];

export function getRoomTypeName(roomTypeId, roomTypeName) {
  if (roomTypeName) return roomTypeName;
  return ROOM_TYPES.find((t) => t.id === roomTypeId)?.name ?? roomTypeId;
}
