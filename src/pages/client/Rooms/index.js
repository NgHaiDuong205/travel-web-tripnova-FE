import { Link } from "react-router-dom";
import RoomSearchPanel from "../../../components/client/RoomSearchPanel";
import RoomCard from "../../../components/client/RoomCard";
import { useRoomsPage } from "../../../hooks/useRoomsPage";

function Rooms() {
  const { rooms, loading, error, applyFilters, reload } = useRoomsPage();

  return (
    <main className="pt-20 pb-8">
      <RoomSearchPanel
        title="Rooms & Suites"
        subtitle="Editorial Collection"
        searchBarPosition="bottom"
        onSearch={applyFilters}
      >
        {(applied) => (
          <>
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <p className="text-sm text-on-surface-variant font-medium">
                {loading ? (
                  "Loading rooms..."
                ) : (
                  <>
                    Showing{" "}
                    <span className="text-on-surface font-bold">
                      {rooms.length} room{rooms.length !== 1 ? "s" : ""}
                    </span>
                    {applied.checkIn && applied.checkOut && (
                      <span>
                        {" "}
                        · {applied.checkIn} → {applied.checkOut}
                      </span>
                    )}
                    {(applied.minPrice !== "" || applied.maxPrice !== "") && (
                      <span>
                        {" "}
                        · €{applied.minPrice || "0"} – €{applied.maxPrice || "∞"}/night
                      </span>
                    )}
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-outline">
                  Sort by:
                </span>
                <select className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer">
                  <option>Price (Low to High)</option>
                  <option>Price (High to Low)</option>
                  <option>Max Guests</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span>
                  <strong>Could not load rooms.</strong> {error}
                </span>
                <button
                  type="button"
                  onClick={reload}
                  className="shrink-0 px-4 py-2 bg-white rounded-lg font-bold text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                >
                  Retry
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
                <h3 className="text-xl font-bold text-primary mb-2">No rooms match your search</h3>
                <p className="text-on-surface-variant text-sm max-w-md mx-auto mb-6">
                  Try adjusting check-in/check-out dates, lowering guest count, or removing some
                  amenity or room type filters.
                </p>
                <Link
                  to="/hotels"
                  className="text-primary font-bold text-sm border-b-2 border-primary/20 hover:border-primary transition-all pb-1"
                >
                  Browse Hotels
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
