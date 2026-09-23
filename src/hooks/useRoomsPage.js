import { useCallback, useEffect, useState } from "react";
import { filterRooms } from "../constants/rooms";
import { fetchRooms } from "../services/roomService";

const DEFAULT_LIMIT = 50;

export const DEFAULT_ROOM_FILTERS = {
    checkIn: "",
    checkOut: "",
    maxGuests: 2,
    minPrice: "",
    maxPrice: "",
    roomTypeIds: [],
    amenityIds: [],
};

export function useRoomsPage() {
    const [rooms, setRooms] = useState([]);
    const [applied, setApplied] = useState(DEFAULT_ROOM_FILTERS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadRooms = useCallback(async (filters) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchRooms({
                ...filters,
                page: 1,
                limit: DEFAULT_LIMIT,
            });
            const filtered = filterRooms(result.items, {
                ...filters,
                skipAvailabilityFilter: true,
            });
            setRooms(filtered);
        } catch (err) {
            setRooms([]);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const applyFilters = useCallback((filters) => {
        setApplied(filters);
    }, []);

    useEffect(() => {
        loadRooms(applied);
    }, [applied, loadRooms]);

    return {
        rooms,
        applied,
        loading,
        error,
        applyFilters,
        reload: () => loadRooms(applied),
    };
}
