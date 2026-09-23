import { useEffect, useState } from "react";
import { fetchCountries } from "../services/countryService";
import { fetchDestinations } from "../services/destinationService";

/** Dropdown quốc gia + điểm đến từ API (dùng chung Hotels, Destinations, ...) */
export function useCountryDestinationOptions() {
    const [countries, setCountries] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [countryCode, setCountryCodeState] = useState("");
    const [destinationId, setDestinationId] = useState("");

    const [loadingCountries, setLoadingCountries] = useState(true);
    const [loadingDestinations, setLoadingDestinations] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoadingCountries(true);
            setError(null);
            try {
                const list = await fetchCountries();
                if (!cancelled) setCountries(list);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoadingCountries(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!countryCode) {
            setDestinations([]);
            return undefined;
        }

        let cancelled = false;

        (async () => {
            setLoadingDestinations(true);
            try {
                const list = await fetchDestinations({ countryCode });
                if (!cancelled) setDestinations(list);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoadingDestinations(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [countryCode]);

    const setCountryCode = (code) => {
        setCountryCodeState(code);
        setDestinationId("");
    };

    const selectedCountry = countries.find((c) => c.countryCode === countryCode);
    const selectedDestination = destinations.find(
        (d) => String(d.id) === String(destinationId)
    );

    return {
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
        error,
    };
}
