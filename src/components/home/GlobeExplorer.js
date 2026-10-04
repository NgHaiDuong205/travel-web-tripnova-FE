import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Globe3D from "../common/Globe3D";
import GLOBE_PLACES, { placeCreditUrl, placeImage } from "./globePlaces";
import { describeWeather, fetchCurrentWeather } from "../../services/weatherService";
import { findDestinationByName } from "../../services/destinationService";
import { getCurrentLocale } from "../../i18n/currentLocale";
import { useT } from "../../i18n/I18nContext";

/** Giờ địa phương của điểm đến (theo múi giờ Open-Meteo trả về), cập nhật mỗi 30 giây. */
function LocalTime({ timeZone }) {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 30000);
        return () => window.clearInterval(timer);
    }, []);
    try {
        return new Intl.DateTimeFormat(getCurrentLocale(), { timeZone, hour: "2-digit", minute: "2-digit", weekday: "short" }).format(now);
    } catch {
        return null;
    }
}

function WeatherBlock({ place }) {
    const t = useT();
    const [state, setState] = useState({ loading: true, data: null });

    useEffect(() => {
        let cancelled = false;
        setState({ loading: true, data: null });
        fetchCurrentWeather(place.lat, place.lon)
            .then((data) => !cancelled && setState({ loading: false, data }))
            .catch(() => !cancelled && setState({ loading: false, data: null }));
        return () => {
            cancelled = true;
        };
    }, [place.lat, place.lon]);

    if (state.loading) {
        return <p className="text-sm text-on-surface-variant animate-pulse">{t("home.globe.loadingWeather")}</p>;
    }
    if (!state.data) {
        return <p className="text-sm text-on-surface-variant">{t("home.globe.weatherUnavailable")}</p>;
    }

    const w = state.data;
    const info = describeWeather(w.code, w.isDay);
    return (
        <div data-testid="globe-weather">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-5xl text-amber-500">{info.icon}</span>
                <div>
                    <p className="text-3xl font-headline font-extrabold text-on-surface leading-none">{Math.round(w.temperature)}°C</p>
                    <p className="text-sm font-semibold text-on-surface-variant mt-1">{t(`home.globe.weather.${info.key}`)}</p>
                </div>
            </div>
            <dl className="grid grid-cols-3 gap-2 mt-4 text-center">
                {[
                    ["thermostat", t("home.globe.feelsLike"), `${Math.round(w.apparentTemperature)}°C`],
                    ["humidity_percentage", t("home.globe.humidity"), `${Math.round(w.humidity)}%`],
                    ["air", t("home.globe.wind"), `${Math.round(w.windSpeed)} km/h`],
                ].map(([icon, label, value]) => (
                    <div key={icon} className="rounded-lg bg-surface-container-low px-2 py-2">
                        <span className="material-symbols-outlined text-base text-primary">{icon}</span>
                        <dt className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">{label}</dt>
                        <dd className="text-sm font-bold text-on-surface">{value}</dd>
                    </div>
                ))}
            </dl>
            {w.timeZone && (
                <p className="mt-3 text-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">schedule</span>
                    {t("home.globe.localTime")}: <span className="font-bold text-on-surface"><LocalTime timeZone={w.timeZone} /></span>
                </p>
            )}
        </div>
    );
}

function PlacePanel({ place, onClose }) {
    const t = useT();
    const [destination, setDestination] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setDestination(null);
        if (place.dbName) {
            findDestinationByName(place.dbName)
                .then((found) => !cancelled && setDestination(found))
                .catch(() => {});
        }
        return () => {
            cancelled = true;
        };
    }, [place.dbName]);

    const name = t(`home.globe.places.${place.key}.name`);
    return (
        <aside
            data-testid="globe-place-panel"
            className="absolute z-20 inset-x-3 bottom-3 max-h-[75%] md:inset-x-auto md:right-4 md:top-4 md:bottom-4 md:max-h-none md:w-[340px] overflow-y-auto rounded-2xl bg-surface-container-lowest shadow-2xl"
        >
            <div className="relative h-32 md:h-48">
                <img src={placeImage(place)} alt={name} className="w-full h-full object-cover" />
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t("common.actions.close")}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
                <a
                    href={placeCreditUrl(place)}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white/90 hover:underline"
                >
                    {t("home.globe.photoCredit")}
                </a>
            </div>
            <div className="p-5 space-y-4">
                <div>
                    <p className="text-[10px] uppercase tracking-widest font-extrabold text-primary">{t(`home.globe.places.${place.key}.country`)}</p>
                    <h3 className="text-2xl font-headline font-extrabold text-on-surface">{name}</h3>
                </div>
                <WeatherBlock place={place} />
                {destination && (
                    <Link
                        to={`/destinations/${destination.id}`}
                        className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-on-primary py-3 font-bold hover:opacity-90"
                    >
                        {t("home.globe.explore")}
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </Link>
                )}
            </div>
        </aside>
    );
}

/**
 * Quả địa cầu trang chủ có ghim điểm du lịch: bấm ghim (hoặc nút tên bên dưới — quả cầu tự xoay tới) →
 * ảnh, thời tiết hiện tại, giờ địa phương, link điểm đến. `className`: chiều cao khung quả cầu.
 */
function GlobeExplorer({ className = "h-[640px]" }) {
    const t = useT();
    const [selectedKey, setSelectedKey] = useState(null);
    const selected = GLOBE_PLACES.find((p) => p.key === selectedKey);

    return (
        <div>
        <div className={`relative w-full rounded-3xl overflow-hidden shadow-2xl ${className}`}>
            <Globe3D
                places={GLOBE_PLACES}
                selectedKey={selectedKey}
                onSelect={setSelectedKey}
                pinLabel={(p) => t(`home.globe.places.${p.key}.name`)}
            />
            {!selected && (
                <p className="absolute left-1/2 -translate-x-1/2 bottom-5 z-10 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-xs md:text-sm font-semibold text-white pointer-events-none whitespace-nowrap">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    {t("home.globe.hint")}
                </p>
            )}
            {selected && <PlacePanel key={selected.key} place={selected} onClose={() => setSelectedKey(null)} />}
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-6" data-testid="globe-place-chips">
            {GLOBE_PLACES.map((p) => (
                <button
                    key={p.key}
                    type="button"
                    onClick={() => setSelectedKey(p.key === selectedKey ? null : p.key)}
                    aria-pressed={p.key === selectedKey}
                    className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                        p.key === selectedKey
                            ? "bg-primary text-on-primary border-primary"
                            : "bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-primary hover:text-primary"
                    }`}
                >
                    <span className="material-symbols-outlined text-base">location_on</span>
                    {t(`home.globe.places.${p.key}.name`)}
                </button>
            ))}
        </div>
        </div>
    );
}

export default GlobeExplorer;
