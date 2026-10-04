import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import { fetchManagerHotels } from "../../../services/managerHotelService";
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 20;

/** Danh sách khách sạn do tài khoản này quản lý (admin gán) — phân trang vì một tài khoản có thể quản lý rất nhiều khách sạn. */
function ManagerHotels() {
    const t = useT();
    const [hotels, setHotels] = useState(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setHotels(null);
        fetchManagerHotels({ q: query, page, limit: PAGE_SIZE })
            .then((res) => {
                if (cancelled) return;
                setHotels(res.items);
                setTotal(res.total);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err.message);
                setHotels([]);
            });
        return () => {
            cancelled = true;
        };
    }, [query, page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setQuery(search.trim());
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <h1 className="text-3xl font-extrabold text-primary">
                    {t("manager.hotels.title")} {total > 0 && <span className="text-base font-semibold text-gray-500">({total})</span>}
                </h1>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("manager.hotels.searchPlaceholder")}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-[260px]"
                    />
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">
                        {t("common.actions.search")}
                    </button>
                </form>
            </div>
            <FormAlert>{error}</FormAlert>
            {hotels === null && <p className="text-gray-500">{t("common.state.loading")}</p>}
            {hotels?.length === 0 && !error && (
                <p className="bg-white rounded-xl p-10 text-center text-gray-600 border border-gray-100">
                    {query
                        ? t("manager.hotels.noMatches", { query })
                        : t("manager.hotels.noHotels")}
                </p>
            )}
            {hotels?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm min-w-[720px]">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3">{t("manager.hotels.hotel")}</th>
                                <th className="px-4 py-3">{t("manager.hotels.location")}</th>
                                <th className="px-4 py-3">{t("manager.hotels.rating")}</th>
                                <th className="px-4 py-3">{t("manager.hotels.rooms")}</th>
                                <th className="px-4 py-3">{t("common.fields.status")}</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {hotels.map((h) => (
                                <tr key={h.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-10 rounded bg-gray-100 overflow-hidden shrink-0">
                                                {h.coverImageUrl && (
                                                    <img src={h.coverImageUrl} alt="" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <span className="font-semibold text-gray-900">{h.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {[h.destinationName, h.countryName].filter(Boolean).join(", ")}
                                    </td>
                                    <td className="px-4 py-3 text-amber-500">{"★".repeat(h.starRating || 0)}</td>
                                    <td className="px-4 py-3">
                                        {t("manager.hotels.roomSummary", { rooms: h.totalRooms, types: h.roomTypeCount })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                h.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {t(h.isActive ? "common.status.active" : "manager.hotels.hidden")}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <Link to={`/manager/hotels/${h.id}`} className="text-primary font-bold">
                                            {t("manager.hotels.manage")}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination page={page} total={total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

export default ManagerHotels;
