/**
 * Các điểm du lịch ghim trên quả địa cầu ở trang chủ. Tên / quốc gia dịch qua `home.globe.places.<key>`.
 * `dbName`: tên điểm đến trong DB (link sang trang điểm đến nếu tìm thấy); null = chưa có trong DB.
 * Ảnh tải sẵn từ Wikimedia Commons (bản 960px) về `public/images/globe/<key>.jpg` — `credit` là tên file trên Commons
 * (giấy phép CC; trang file ghi tác giả). Không gọi Wikimedia lúc chạy vì bị giới hạn tốc độ (HTTP 429).
 */
const GLOBE_PLACES = [
    { key: "halong", lat: 20.91, lon: 107.18, dbName: "Ha Long Bay", credit: "Ha_Long_Bay_in_2019.jpg" },
    { key: "hoian", lat: 15.88, lon: 108.33, dbName: "Hoi An", credit: "10549-Hoi-An_(37621348460).jpg" },
    { key: "kyoto", lat: 35.01, lon: 135.77, dbName: "Kyoto", credit: "Kyoto,_Japan_(49667780482).jpg" },
    { key: "tokyo", lat: 35.68, lon: 139.69, dbName: "Tokyo", credit: "Skyscrapers_of_Shinjuku_2009_January.jpg" },
    { key: "bali", lat: -8.41, lon: 115.19, dbName: "Bali", credit: "TanahLot_2014.JPG" },
    { key: "sydney", lat: -33.87, lon: 151.21, dbName: null, credit: "Sydney_Opera_House_and_Harbour_Bridge_Dusk_(2)_2019-06-21.jpg" },
    { key: "maldives", lat: 4.18, lon: 73.51, dbName: null, credit: "Malé.jpg" },
    { key: "dubai", lat: 25.2, lon: 55.27, dbName: "Dubai", credit: "Dubai_Marina_Skyline.jpg" },
    { key: "santorini", lat: 36.39, lon: 25.46, dbName: "Santorini", credit: "Oia_sunset_-_panoramio_(2).jpg" },
    { key: "rome", lat: 41.9, lon: 12.5, dbName: "Rome", credit: "Trevi_Fountain,_Rome,_Italy_2_-_May_2007.jpg" },
    { key: "amalfi", lat: 40.63, lon: 14.6, dbName: "Amalfi Coast", credit: "Amalfi_Coast_(Italy,_October_2020)_-_75_(50558355441).jpg" },
    { key: "paris", lat: 48.86, lon: 2.35, dbName: "Paris", credit: "La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques,_Paris_août_2014_(2).jpg" },
    { key: "london", lat: 51.51, lon: -0.13, dbName: null, credit: "London_Skyline_(125508655).jpeg" },
    { key: "reykjavik", lat: 64.15, lon: -21.94, dbName: null, credit: "Reykjavík,_view_from_Hallgrímskirkja_(2).jpg" },
    { key: "marrakesh", lat: 31.63, lon: -7.99, dbName: null, credit: "Pavillon_Menaragärten.jpg" },
    { key: "capetown", lat: -33.92, lon: 18.42, dbName: null, credit: "Camps_bay_(53460319478)_(cropped).jpg" },
    { key: "nyc", lat: 40.71, lon: -74.01, dbName: "New York City", credit: "Lights_of_Rockefeller_Center_during_sunset.jpg" },
    { key: "grandcanyon", lat: 36.1, lon: -112.11, dbName: "Grand Canyon", credit: "Canyon_River_Tree_(165872763).jpeg" },
    { key: "banff", lat: 51.32, lon: -116.18, dbName: "Banff", credit: "Moraine_Lake_17092005.jpg" },
    { key: "machupicchu", lat: -13.16, lon: -72.55, dbName: null, credit: "Machu_Picchu,_2023_(012).jpg" },
    { key: "rio", lat: -22.91, lon: -43.17, dbName: null, credit: "Cidade_Maravilhosa.jpg" },
];

export const placeImage = (place) => `/images/globe/${place.key}.jpg`;
export const placeCreditUrl = (place) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(place.credit)}`;

export default GLOBE_PLACES;
