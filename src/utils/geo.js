/** Khoảng cách đường chim bay (km) giữa 2 toạ độ — công thức haversine. */
export function distanceKm(lat1, lng1, lat2, lng2) {
    const rad = (d) => (d * Math.PI) / 180;
    const dLat = rad(lat2 - lat1);
    const dLng = rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(a));
}

export function hasCoords(item) {
    return item?.latitude != null && item?.longitude != null;
}

/** Link mở bản đồ OpenStreetMap tại toạ độ. */
export function osmLink(lat, lng, zoom = 17) {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
}

/** URL nhúng iframe bản đồ OpenStreetMap có ghim (không cần API key). */
export function osmEmbed(lat, lng, delta = 0.008) {
    const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(",");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}
