import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import { SEARCH_TYPES, resultLink, search, suggest, trackClick } from "../../../services/searchService";
import { formatMoney } from "../../../utils/formatters";
import { useT } from "../../../i18n/I18nContext";

const SINGLE_LIMIT = 20;

function Search() {
    const t = useT();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const [value, setValue] = useState(q);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        setValue(q);
    }, [q]);

    useEffect(() => {
        let cancelled = false;
        if (!q) {
            setData(null);
            setLoading(false);
            return undefined;
        }
        setLoading(true);
        setError("");
        search({ q, type, page, limit: type === "all" ? 5 : SINGLE_LIMIT })
            .then((result) => !cancelled && setData(result))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [q, type, page]);

    useEffect(() => {
        let cancelled = false;
        if (value.trim().length < 2) {
            setSuggestions([]);
            return undefined;
        }
        const timer = window.setTimeout(() => {
            suggest(value.trim())
                .then((items) => !cancelled && setSuggestions(items.slice(0, 8)))
                .catch(() => !cancelled && setSuggestions([]));
        }, 250);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [value]);

    const counts = data?.counts || {};
    const allCount = Object.values(counts).reduce((sum, n) => sum + (n || 0), 0);
    const updateParams = (next) => setSearchParams(next);
    const setType = (nextType) => updateParams({ q, type: nextType });

    const submit = (event) => {
        event.preventDefault();
        const nextQ = value.trim();
        setShowSuggestions(false);
        updateParams(nextQ ? { q: nextQ, type } : {});
    };

    const selectSuggestion = (item) => {
        setShowSuggestions(false);
        navigate(resultLink(item));
    };

    const grouped = useMemo(() => {
        const groups = {};
        (data?.results || []).forEach((item) => {
            groups[item.type] = [...(groups[item.type] || []), item];
        });
        return groups;
    }, [data]);

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-6">{t("search.title")}</h1>
            <form onSubmit={submit} className="relative mb-6">
                <div className="flex gap-2">
                    <input
                        value={value}
                        onChange={(event) => {
                            setValue(event.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => window.setTimeout(() => setShowSuggestions(false), 100)}
                        onKeyDown={(event) => event.key === "Escape" && setShowSuggestions(false)}
                        placeholder={t("search.placeholder")}
                        className="flex-1 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm bg-surface-container-lowest"
                    />
                    <button type="submit" className="px-5 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary">
                        {t("common.actions.search")}
                    </button>
                </div>
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest shadow-lg overflow-hidden">
                        {suggestions.map((item, index) => {
                            const icon =
                                item.type === "city"
                                    ? "location_city"
                                    : SEARCH_TYPES.find((entry) => entry.key === item.type)?.icon || "travel_explore";
                            return (
                                <button
                                    key={`${item.type}-${item.id || item.title}-${index}`}
                                    type="button"
                                    onMouseDown={() => selectSuggestion(item)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-container-low"
                                >
                                    <span className="material-symbols-outlined text-primary">{icon}</span>
                                    <span>
                                        <span className="block font-semibold">{item.title}</span>
                                        <span className="block text-xs text-on-surface-variant">{item.subtitle}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </form>

            <div className="flex flex-wrap gap-2 mb-8 border-b border-outline-variant/30 pb-3">
                {SEARCH_TYPES.map((entry) => {
                    const count = entry.key === "all" ? allCount : counts[entry.key];
                    return (
                        <button
                            key={entry.key}
                            type="button"
                            onClick={() => setType(entry.key)}
                            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold ${type === entry.key ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
                        >
                            <span className="material-symbols-outlined text-lg">{entry.icon}</span>
                            {t(`search.types.${entry.key}`)}
                            {data && ` (${count || 0})`}
                        </button>
                    );
                })}
            </div>

            <FormAlert>{error}</FormAlert>
            {!q ? (
                <div className="text-center py-20 bg-surface-container-low rounded-xl">
                    <span className="material-symbols-outlined text-5xl text-outline mb-3">travel_explore</span>
                    <p className="text-on-surface-variant">{t("search.emptyPrompt")}</p>
                </div>
            ) : loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-72 rounded-xl bg-surface-container-high animate-pulse" />
                    ))}
                </div>
            ) : data?.results.length === 0 ? (
                <p className="py-12 text-center text-on-surface-variant">{t("search.noResults", { query: q })}</p>
            ) : type === "all" ? (
                <div className="space-y-10">
                    {["destination", "hotel", "tour", "car", "flight"].map((groupType) => {
                        const items = grouped[groupType] || [];
                        const label = t(`search.types.${groupType}`, { defaultValue: groupType });
                        if (!items.length) return null;
                        return (
                            <section key={groupType}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-extrabold">
                                        {label} ({counts[groupType] || 0})
                                    </h2>
                                    {(counts[groupType] || 0) > items.length && (
                                        <button
                                            type="button"
                                            onClick={() => setType(groupType)}
                                            className="text-sm font-bold text-primary"
                                        >
                                            {t("search.seeAll", { count: counts[groupType] })}
                                        </button>
                                    )}
                                </div>
                                <ResultGrid items={items} searchId={data.searchId} t={t} />
                            </section>
                        );
                    })}
                </div>
            ) : (
                <>
                    <ResultGrid items={data?.results || []} searchId={data?.searchId} t={t} />
                    <Pagination
                        page={page}
                        total={counts[type] || 0}
                        limit={SINGLE_LIMIT}
                        onChange={(nextPage) => updateParams({ q, type, page: String(nextPage) })}
                    />
                </>
            )}
        </div>
    );
}

function ResultGrid({ items, searchId, t }) {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
                const icon = SEARCH_TYPES.find((entry) => entry.key === item.type)?.icon || "travel_explore";
                return (
                    <Link
                        key={`${item.type}-${item.id}`}
                        to={resultLink(item)}
                        onClick={() => trackClick(searchId, item.type, item.id)}
                        className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:shadow-md transition-shadow"
                    >
                        {item.imageUrl ? (
                            item.type === "flight" ? (
                                <div className="h-40 bg-surface-container-low flex items-center justify-center">
                                    <img src={item.imageUrl} alt="" className="h-10 max-w-[80%] object-contain" />
                                </div>
                            ) : (
                                <img src={item.imageUrl} alt="" className="h-40 w-full object-cover" />
                            )
                        ) : (
                            <div className="h-40 bg-surface-container-low flex items-center justify-center text-outline">
                                <span className="material-symbols-outlined text-4xl">{icon}</span>
                            </div>
                        )}
                        <div className="p-4">
                            <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-primary-fixed text-on-primary-fixed-variant capitalize">
                                {t(`search.types.${item.type}`, { defaultValue: item.type })}
                            </span>
                            <h3 className="font-bold mt-2">{item.title}</h3>
                            <p className="text-sm text-on-surface-variant mt-1">{item.subtitle}</p>
                            {item.price != null && (
                                <p className="text-sm font-semibold mt-3">
                                    {t("search.fromPrice", { price: formatMoney(item.price, "USD"), unit: item.priceUnit })}
                                </p>
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

export default Search;
