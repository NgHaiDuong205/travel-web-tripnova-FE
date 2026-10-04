/**
 * Thời tiết hiện tại từ Open-Meteo (miễn phí, không cần key, cho phép CORS) — gọi thẳng từ trình duyệt như WorldClocks.
 * Cache 10 phút theo toạ độ để bấm lại cùng một ghim không gọi lại API.
 */
const CACHE_MS = 10 * 60 * 1000;
const cache = new Map();

export function fetchCurrentWeather(lat, lon) {
    const key = `${lat},${lon}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.promise;

    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day",
        timezone: "auto",
    });
    const promise = fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
        .then((res) => {
            if (!res.ok) throw new Error(`Weather HTTP ${res.status}`);
            return res.json();
        })
        .then((data) => ({
            temperature: data.current.temperature_2m,
            apparentTemperature: data.current.apparent_temperature,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            code: data.current.weather_code,
            isDay: data.current.is_day === 1,
            timeZone: data.timezone,
        }));
    cache.set(key, { at: Date.now(), promise });
    promise.catch(() => cache.delete(key)); // lỗi thì lần sau thử lại
    return promise;
}

/** Mã thời tiết WMO → { key (home.globe.weather.<key>), icon (Material Symbols) }. */
export function describeWeather(code, isDay = true) {
    if (code === 0) return { key: "clear", icon: isDay ? "sunny" : "clear_night" };
    if (code === 1 || code === 2) return { key: code === 1 ? "mainlyClear" : "partlyCloudy", icon: isDay ? "partly_cloudy_day" : "partly_cloudy_night" };
    if (code === 3) return { key: "overcast", icon: "cloud" };
    if (code === 45 || code === 48) return { key: "fog", icon: "foggy" };
    if (code >= 51 && code <= 57) return { key: "drizzle", icon: "rainy" };
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { key: "rain", icon: "rainy" };
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { key: "snow", icon: "weather_snowy" };
    if (code >= 95) return { key: "thunderstorm", icon: "thunderstorm" };
    return { key: "unknown", icon: "thermostat" };
}
