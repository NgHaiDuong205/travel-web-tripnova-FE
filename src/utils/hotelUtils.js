/** Gom tiện ích duy nhất từ danh sách khách sạn (theo dữ liệu API) */
export function collectAmenitiesFromHotels(hotels, existing = []) {
    const set = new Set(existing);
    hotels.forEach((hotel) => {
        hotel.amenities?.forEach((name) => {
            if (name) set.add(name);
        });
    });
    return [...set].sort((a, b) => a.localeCompare(b));
}
