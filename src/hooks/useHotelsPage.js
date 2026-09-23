import { useCallback, useEffect, useState } from "react";
import { fetchHotels } from "../services/hotelService";
import { useCountryDestinationOptions } from "./useCountryDestinationOptions";
import { collectAmenitiesFromHotels } from "../utils/hotelUtils";

const DEFAULT_LIMIT = 10;

const initialFilters = {
    countryName: "",
    destinationName: "",
    name: "",
    totalRooms: null,
    checkIn: "",
    checkOut: "",
    starRatings: [],
    amenities: [],
    page: 1,
    limit: DEFAULT_LIMIT,
};

export function useHotelsPage() {
    const {
        countries,
        destinations,
        countryCode,
        destinationId,
        setCountryCode,
        setDestinationId,
        selectedCountry,
        selectedDestination,
        loadingCountries,
        loadingDestinations,
        error: locationError,
    } = useCountryDestinationOptions();

    const [draft, setDraft] = useState({
        name: "",
        rooms: 1,
        checkIn: "",
        checkOut: "",
    });
    const [applied, setApplied] = useState(initialFilters);

    const [hotels, setHotels] = useState([]);
    const [amenityOptions, setAmenityOptions] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);

    const [loadingHotels, setLoadingHotels] = useState(true);
    const [error, setError] = useState(null);

    const loadHotels = useCallback(async (filters) => {
        setLoadingHotels(true);
        setError(null);
        try {
            const result = await fetchHotels(filters);
            setHotels(result.items);
            
            const reqPage = filters.page ?? 1;
            const reqLimit = filters.limit ?? DEFAULT_LIMIT;
            
            // Check if the backend returned a flat array without pagination metadata
            const isFlatArray = !result.totalPages || (result.totalPages === 1 && result.total === result.items.length);
            
            if (isFlatArray) {
                setPage(reqPage);
                if (result.items.length === reqLimit) {
                    setTotalPages((prev) => Math.max(reqPage + 1, prev));
                    setTotal((reqPage - 1) * reqLimit + result.items.length + 1);
                } else {
                    setTotalPages(reqPage);
                    setTotal((reqPage - 1) * reqLimit + result.items.length);
                }
            } else {
                setTotal(result.total);
                setTotalPages(result.totalPages);
                setPage(result.page);
            }

            setAmenityOptions((prev) =>
                collectAmenitiesFromHotels(result.items, prev)
            );
        } catch (err) {
            setHotels([]);
            setTotal(0);
            setTotalPages(1);
            setError(err.message);
        } finally {
            setLoadingHotels(false);
        }
    }, []);

    useEffect(() => {
        loadHotels(applied);
    }, [applied, loadHotels]);

    const applySearch = useCallback(() => {
        const hasDateRange = draft.checkIn && draft.checkOut;
        setApplied((prev) => ({
            ...prev,
            countryName: selectedCountry?.name ?? "",
            destinationName: selectedDestination?.name ?? "",
            name: draft.name,
            totalRooms: draft.rooms > 1 ? draft.rooms : null,
            checkIn: hasDateRange ? draft.checkIn : "",
            checkOut: hasDateRange ? draft.checkOut : "",
            page: 1,
            limit: DEFAULT_LIMIT,
        }));
    }, [
        selectedCountry,
        selectedDestination,
        draft.name,
        draft.rooms,
        draft.checkIn,
        draft.checkOut,
    ]);

    const setStarRatings = useCallback((starRatings) => {
        setApplied((prev) => ({ ...prev, starRatings, page: 1 }));
    }, []);

    const setAmenities = useCallback((amenities) => {
        setApplied((prev) => ({ ...prev, amenities, page: 1 }));
    }, []);

    const goToPage = useCallback((nextPage) => {
        setApplied((prev) => ({ ...prev, page: nextPage }));
    }, []);

    const updateDraft = useCallback((patch) => {
        setDraft((prev) => ({ ...prev, ...patch }));
    }, []);

    const updateDraftLocation = useCallback(
        (patch) => {
            if (patch.countryCode !== undefined) setCountryCode(patch.countryCode);
            if (patch.destinationId !== undefined) setDestinationId(patch.destinationId);
        },
        [setCountryCode, setDestinationId]
    );

    return {
        countries,
        destinations,
        hotels,
        amenityOptions,
        total,
        totalPages,
        page,
        draft: {
            ...draft,
            countryCode,
            destinationId,
        },
        applied,
        loadingCountries,
        loadingDestinations,
        loadingHotels,
        error: error || locationError,
        selectedCountry,
        selectedDestination,
        updateDraft,
        updateDraftLocation,
        applySearch,
        setStarRatings,
        setAmenities,
        goToPage,
        reload: () => loadHotels(applied),
    };
}
