import { useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Circle, LayersControl, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useT } from "../../i18n/I18nContext";
import { dayColor } from "./dayColors";

// body có zoom 0.75 toàn site → bù zoom cho bản đồ (kích thước %, không bị nhân), giống Globe3D / LandmarkDetail.
// Không bù thì Leaflet tính sai toạ độ chuột (kéo / bấm ghim lệch).
const BODY_ZOOM = parseFloat(window.getComputedStyle(document.body).zoom) || 1;

const ESRI_ATTRIBUTION = "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community";

function pinIcon(stop, active) {
    const color = stop.kind === "hotel" ? "#0f172a" : dayColor(stop.day);
    const size = active ? 38 : 30;
    const inner = stop.kind === "hotel"
        ? '<span class="material-symbols-outlined" style="font-size:18px">hotel</span>'
        : stop.kind === "lunch" || stop.kind === "dinner"
            ? '<span class="material-symbols-outlined" style="font-size:16px">restaurant</span>'
            : String(stop.label ?? "");
    return L.divIcon({
        className: "tn-map-pin",
        html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid #fff;border-radius:9999px;`
            + `display:flex;align-items:center;justify-content:center;color:#fff;font:700 13px/1 Inter,sans-serif;`
            + `box-shadow:0 4px 12px rgba(0,0,0,.45);${active ? "outline:3px solid rgba(255,255,255,.6);" : ""}">${inner}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

/** Khớp khung nhìn với các ghim mỗi khi danh sách đổi (đổi ngày / tạo lại). */
function FitBounds({ points, center }) {
    const map = useMap();
    const key = points.map((p) => p.join(",")).join("|");
    useEffect(() => {
        if (points.length > 1) {
            map.fitBounds(points, { padding: [48, 48], maxZoom: 16 });
        } else if (points.length === 1) {
            map.setView(points[0], 15);
        } else if (center) {
            map.setView(center, 12);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, map]);
    return null;
}

/** Bay tới điểm đang chọn (bấm trên dòng thời gian). */
function FlyToActive({ stop }) {
    const map = useMap();
    useEffect(() => {
        if (stop) map.flyTo([stop.lat, stop.lng], Math.max(map.getZoom(), 16), { duration: 0.8 });
    }, [stop, map]);
    return null;
}

/**
 * Bản đồ chuyến đi (nạp lười bằng React.lazy — Leaflet ~50 KB gzip chỉ tải khi trang có bản đồ): lớp ảnh vệ tinh (Esri World Imagery, kèm nhãn địa danh) mặc định, đổi được sang bản đồ đường phố (OSM).
 * stops: [{ key, lat, lng, day, label, kind: hotel|sight|lunch|dinner, title, subtitle }] — chỉ điểm có toạ độ được vẽ.
 * Các điểm cùng ngày được nối theo thứ tự (khách sạn không nối). radiusKm + center: vẽ vòng phạm vi di chuyển.
 */
function TripMap({ stops, center, activeKey, onSelect, radiusKm, className = "h-[520px]" }) {
    const t = useT();
    const located = useMemo(() => stops.filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng)), [stops]);
    const points = useMemo(() => located.map((s) => [s.lat, s.lng]), [located]);
    const routes = useMemo(() => {
        const byDay = new Map();
        located.forEach((s) => {
            if (s.kind === "hotel") return;
            if (!byDay.has(s.day)) byDay.set(s.day, []);
            byDay.get(s.day).push([s.lat, s.lng]);
        });
        return [...byDay.entries()].filter(([, line]) => line.length > 1);
    }, [located]);
    const active = located.find((s) => s.key === activeKey) || null;
    const initial = points[0] || center || [16.0, 106.0];

    return (
        <div className={`relative rounded-2xl overflow-hidden border border-outline-variant/20 bg-surface-container-high ${className}`}>
            <div style={{ zoom: 1 / BODY_ZOOM, width: "100%", height: "100%" }}>
                <MapContainer center={initial} zoom={13} scrollWheelZoom style={{ width: "100%", height: "100%" }}>
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name={t("planner.map.satellite")}>
                            <TileLayer
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                attribution={ESRI_ATTRIBUTION}
                                maxZoom={19}
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name={t("planner.map.streets")}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                maxZoom={19}
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.Overlay checked name={t("planner.map.labels")}>
                            <TileLayer
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                                maxZoom={19}
                            />
                        </LayersControl.Overlay>
                    </LayersControl>
                    {radiusKm && center && (
                        <Circle center={center} radius={radiusKm * 1000} pathOptions={{ color: "#facc15", weight: 2, dashArray: "6 6", fillOpacity: 0.06 }} />
                    )}
                    {routes.map(([day, line]) => (
                        <Polyline key={day} positions={line} pathOptions={{ color: dayColor(day), weight: 4, opacity: 0.9, dashArray: "8 8" }} />
                    ))}
                    {located.map((s) => (
                        <Marker
                            key={s.key}
                            position={[s.lat, s.lng]}
                            icon={pinIcon(s, s.key === activeKey)}
                            zIndexOffset={s.key === activeKey ? 1000 : s.kind === "hotel" ? 500 : 0}
                            eventHandlers={onSelect ? { click: () => onSelect(s.key) } : undefined}
                        >
                            <Tooltip direction="top" offset={[0, -16]}>
                                <strong>{s.title}</strong>
                                {s.subtitle && <div>{s.subtitle}</div>}
                            </Tooltip>
                        </Marker>
                    ))}
                    <FitBounds points={points} center={center} />
                    <FlyToActive stop={active} />
                </MapContainer>
            </div>
            {located.length === 0 && (
                <div className="absolute inset-x-4 bottom-4 z-[500] rounded-lg bg-black/70 text-white text-xs px-3 py-2">
                    {t("planner.map.noCoordinates")}
                </div>
            )}
        </div>
    );
}

export default TripMap;
