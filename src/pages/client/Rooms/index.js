import { Link } from "react-router-dom";
import RoomSearchPanel from "../../../components/client/RoomSearchPanel";
import RoomCard from "../../../components/client/RoomCard";
import { useRoomsPage } from "../../../hooks/useRoomsPage";
import { useT } from "../../../i18n/I18nContext";
import { formatMoney } from "../../../utils/formatters";
import { fromDisplayToUsd } from "../../../utils/currency";

function Rooms() {
  const t = useT();
  const { rooms, roomTypeOptions, loading, error, applyFilters, reload } = useRoomsPage();

  return (
    <main className="pt-20 pb-8">
      <RoomSearchPanel
        title={t("hotels.rooms.title")}
        subtitle={t("hotels.list.editorialCollection")}
        searchBarPosition="bottom"
        onSearch={applyFilters}
        roomTypeOptions={roomTypeOptions}
      >
        {(applied) => (
          <>
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <p className="text-sm text-on-surface-variant font-medium">
                {loading ? (
                  t("hotels.rooms.loading")
                ) : (
                  <>
                    {t("hotels.rooms.showing", { count: rooms.length, checkIn: applied.checkIn || "—", checkOut: applied.checkOut || "—", minPrice: formatMoney(fromDisplayToUsd(applied.minPrice || 0)), maxPrice: applied.maxPrice === "" ? t("hotels.filters.any") : formatMoney(fromDisplayToUsd(applied.maxPrice)) })}
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-outline">
                  {t("common.fields.sortBy")}
                </span>
                <select className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer">
                  <option>{t("hotels.sort.priceLowToHigh")}</option>
                  <option>{t("hotels.sort.priceHighToLow")}</option>
                  <option>{t("hotels.sort.maxGuests")}</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span>
                  <strong>{t("hotels.errors.loadRooms")}</strong> {error}
                </span>
                <button
                  type="button"
                  onClick={reload}
                  className="shrink-0 px-4 py-2 bg-white rounded-lg font-bold text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                >
                  {t("common.actions.retry")}
                </button>
              </div>
            )}

            {loading && rooms.length === 0 ? (
              <div className="grid grid-cols-1 gap-12">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-surface-container-low rounded-xl h-64 animate-pulse"
                  />
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low rounded-xl">
                <span className="material-symbols-outlined text-5xl text-outline mb-4">
                  bed
                </span>
                <h3 className="text-xl font-bold text-primary mb-2">{t("hotels.rooms.emptyTitle")}</h3>
                <p className="text-on-surface-variant text-sm max-w-md mx-auto mb-6">
                  {t("hotels.rooms.emptyDescription")}
                </p>
                <Link
                  to="/hotels"
                  className="text-primary font-bold text-sm border-b-2 border-primary/20 hover:border-primary transition-all pb-1"
                >
                  {t("hotels.actions.browseHotels")}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-12">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </>
        )}
      </RoomSearchPanel>
    </main>
  );
}

export default Rooms;
