import { Link } from "react-router-dom";
import { getRoomTypeName } from "../../constants/rooms";
import RoomStatusBadge from "./RoomStatusBadge";
import { useT } from "../../i18n/I18nContext";
import { formatMoney } from "../../utils/formatters";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1631049301164-da64c29e0a5a?w=800&q=80";

function RoomCard({ room }) {
  const t = useT();
  const hasStatus = room.status != null && room.status !== "";

  return (
    <div className="flex flex-col md:flex-row bg-surface-container-lowest rounded-xl overflow-hidden group">
      <Link to={`/hotel/${room.hotelId}/room/${room.id}`} className="md:w-1/2 h-80 md:h-auto overflow-hidden block relative">
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={room.name}
          src={room.image || PLACEHOLDER_IMAGE}
        />
        {hasStatus && (
          <div className="absolute top-4 left-4">
            <RoomStatusBadge status={room.status} variant="badge" />
          </div>
        )}
      </Link>
      <div className="md:w-1/2 p-8 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2 gap-4">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {getRoomTypeName(room.roomTypeId, room.roomTypeName)}
              </span>
              <h3 className="text-2xl font-headline font-bold mt-1">{room.name}</h3>
              {hasStatus && (
                <div className="mt-3">
                  <RoomStatusBadge status={room.status} variant="pill" />
                </div>
              )}
            </div>
            <span className="text-primary font-bold text-xl shrink-0">
              {formatMoney(room.price, "USD")}
              <span className="text-sm font-normal text-on-surface-variant">{t("common.units.perNight")}</span>
            </span>
          </div>
          <p className="text-on-surface-variant text-sm mb-4">{room.description}</p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center gap-2 text-xs text-on-surface-variant uppercase tracking-wide">
              <span className="material-symbols-outlined text-[16px]">group</span>
              {t("hotels.card.upToGuests", { count: room.maxGuests })}
            </li>
            {room.highlights?.map((h) => (
              <li
                key={h}
                className="flex items-center gap-2 text-xs text-on-surface-variant uppercase tracking-wide"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
        <Link
          to={`/hotel/${room.hotelId}/room/${room.id}`}
          className="editorial-gradient text-white py-3 rounded-lg font-bold tracking-wide transition-all active:scale-95 text-center block"
        >
          {t("hotels.actions.selectRoom")}
        </Link>
      </div>
    </div>
  );
}

export default RoomCard;
