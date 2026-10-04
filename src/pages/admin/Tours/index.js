import { useCallback, useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../../components/common/StatusBadge";
import { BOOKING_STATUS_LABELS, fetchCars } from "../../../services/carService";
import { fetchDestinations } from "../../../services/destinationService";
import { fetchFlights } from "../../../services/flightService";
import { fetchHotels } from "../../../services/hotelService";
import {
    TOUR_BOOKING_NEXT_STATUSES,
    createAdminTour,
    deleteAdminTour,
    fetchAdminTourBookings,
    fetchAdminTours,
    linkAdminTourCar,
    linkAdminTourFlight,
    linkAdminTourHotel,
    unlinkAdminTourCar,
    unlinkAdminTourFlight,
    unlinkAdminTourHotel,
    updateAdminTour,
    updateAdminTourBookingStatus,
} from "../../../services/adminTourService";
import { fetchTourCars, fetchTourFlights, fetchTourHotels } from "../../../services/tourService";
import { formatDate, formatDateTime, formatMoney } from "../../../utils/formatters";
import AdminStatsPanel from "../../../components/admin/AdminStatsPanel";
import { useT } from "../../../i18n/I18nContext";

const PAGE_SIZE = 20;
const inputClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm w-full";
const filterClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm";
const EMPTY_TOUR = {
    name: "",
    destinationId: "",
    description: "",
    departureLocation: "",
    durationDays: "",
    durationNights: "",
    minParticipants: "",
    maxParticipants: "",
    priceAdult: "",
    priceChild: "",
    departureDate: "",
    returnDate: "",
    coverImageUrl: "",
    highlights: "",
    included: "",
    excluded: "",
    itinerary: [],
    isActive: true,
};

/** Ghép thông điệp lỗi từ phản hồi API. */
function errorMessage(err) {
    return [err.message, ...(err.details || [])].filter(Boolean).join(" ");
}

/** Chuyển văn bản nhiều dòng thành mảng chuỗi. */
function lines(value) {
    return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
}

/** Chuyển số tùy chọn rỗng thành null. */
function nullableNumber(value) {
    return value === "" || value == null ? null : Number(value);
}

/** Biểu mẫu thêm hoặc sửa tour. */
function TourForm({ initial, destinations, onSave, onCancel }) {
    const t = useT();
    const [form, setForm] = useState(() => ({
        ...EMPTY_TOUR,
        ...initial,
        highlights: (initial?.highlights || []).join("\n"),
        included: (initial?.included || []).join("\n"),
        excluded: (initial?.excluded || []).join("\n"),
        itinerary: initial?.itinerary || [],
    }));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    /** Cập nhật một trường của biểu mẫu. */
    const set = (name) => (event) =>
        setForm((prev) => ({ ...prev, [name]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
    /** Cập nhật một dòng lịch trình. */
    const setItinerary = (index, name, value) =>
        setForm((prev) => ({
            ...prev,
            itinerary: prev.itinerary.map((item, current) => (current === index ? { ...item, [name]: value } : item)),
        }));
    /** Gửi dữ liệu tour đã chuẩn hóa. */
    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            await onSave({
                name: form.name.trim(),
                destinationId: nullableNumber(form.destinationId),
                description: form.description.trim(),
                departureLocation: form.departureLocation.trim(),
                durationDays: Number(form.durationDays),
                durationNights: nullableNumber(form.durationNights),
                minParticipants: nullableNumber(form.minParticipants),
                maxParticipants: nullableNumber(form.maxParticipants),
                priceAdult: Number(form.priceAdult),
                priceChild: nullableNumber(form.priceChild),
                departureDate: form.departureDate || null,
                returnDate: form.returnDate || null,
                coverImageUrl: form.coverImageUrl.trim() || null,
                highlights: lines(form.highlights),
                included: lines(form.included),
                excluded: lines(form.excluded),
                itinerary: form.itinerary.map((item) => ({
                    label: item.label.trim(),
                    title: item.title.trim(),
                    description: item.description.trim(),
                })),
                isActive: form.isActive,
            });
        } catch (err) {
            setError(errorMessage(err));
            setSaving(false);
        }
    };
    return (
        <form
            onSubmit={submit}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
            <label className="text-xs font-bold text-gray-600">
                {t("admin.tours.name")} *<input required value={form.name} onChange={set("name")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("common.fields.destination")}
                <select value={form.destinationId || ""} onChange={set("destinationId")} className={inputClass}>
                    <option value="">{t("admin.tours.none")}</option>
                    {destinations.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("admin.tours.departureLocation")}
                <input value={form.departureLocation || ""} onChange={set("departureLocation")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("admin.tours.durationDays")} *
                <input
                    required
                    min="1"
                    max="60"
                    type="number"
                    value={form.durationDays}
                    onChange={set("durationDays")}
                    className={inputClass}
                />
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("admin.tours.durationNights")}
                <input
                    min="0"
                    type="number"
                    value={form.durationNights ?? ""}
                    onChange={set("durationNights")}
                    className={inputClass}
                />
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("admin.tours.minimumParticipants")}
                <input
                    min="0"
                    type="number"
                    value={form.minParticipants ?? ""}
                    onChange={set("minParticipants")}
                    className={inputClass}
                />
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("admin.tours.maximumParticipants")}
                <input
                    min="0"
                    type="number"
                    value={form.maxParticipants ?? ""}
                    onChange={set("maxParticipants")}
                    className={inputClass}
                />
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("admin.tours.adultPrice")} *
                <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    value={form.priceAdult}
                    onChange={set("priceAdult")}
                    className={inputClass}
                />
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("admin.tours.childPrice")}
                <input
                    min="0"
                    step="0.01"
                    type="number"
                    value={form.priceChild ?? ""}
                    onChange={set("priceChild")}
                    className={inputClass}
                />
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("admin.tours.departureDate")}
                <input type="date" value={form.departureDate || ""} onChange={set("departureDate")} className={inputClass} />
                <span className="font-normal text-gray-400">{t("admin.tours.flexibleDateNote")}</span>
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("admin.tours.returnDate")}
                <input type="date" value={form.returnDate || ""} onChange={set("returnDate")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600 md:col-span-2">
                {t("admin.tours.coverImageUrl")}
                <input value={form.coverImageUrl || ""} onChange={set("coverImageUrl")} className={inputClass} />
                {form.coverImageUrl && (
                    <img src={form.coverImageUrl} alt={t("admin.tours.previewAlt")} className="mt-2 h-28 w-44 rounded object-cover" />
                )}
            </label>
            <label className="text-xs font-bold text-gray-600 md:col-span-2">
                {t("admin.tours.description")}
                <textarea rows="4" value={form.description || ""} onChange={set("description")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("admin.tours.highlights")}
                <textarea rows="4" value={form.highlights} onChange={set("highlights")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                {t("admin.tours.included")}
                <textarea rows="4" value={form.included} onChange={set("included")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600 md:col-span-2">
                {t("admin.tours.excluded")}
                <textarea rows="4" value={form.excluded} onChange={set("excluded")} className={inputClass} />
            </label>
            <div className="md:col-span-2 space-y-3">
                <div className="flex justify-between">
                    <span className="text-xs font-bold text-gray-600">{t("admin.tours.itinerary")}</span>
                    <button
                        type="button"
                        onClick={() =>
                            setForm((prev) => ({
                                ...prev,
                                itinerary: [...prev.itinerary, { label: "", title: "", description: "" }],
                            }))
                        }
                        className="text-primary text-xs font-bold"
                    >
                        {t("admin.tours.addRow")}
                    </button>
                </div>
                {form.itinerary.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <input
                            placeholder={t("admin.tours.label")}
                            value={item.label}
                            onChange={(e) => setItinerary(index, "label", e.target.value)}
                            className={inputClass}
                        />
                        <input
                            placeholder={t("admin.tours.itemTitle")}
                            value={item.title}
                            onChange={(e) => setItinerary(index, "title", e.target.value)}
                            className={inputClass}
                        />
                        <input
                            placeholder={t("admin.tours.description")}
                            value={item.description}
                            onChange={(e) => setItinerary(index, "description", e.target.value)}
                            className={inputClass}
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setForm((prev) => ({
                                    ...prev,
                                    itinerary: prev.itinerary.filter((_, current) => current !== index),
                                }))
                            }
                            className="text-red-600 text-xs font-bold"
                        >
                            {t("common.actions.remove")}
                        </button>
                    </div>
                ))}
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.isActive} onChange={set("isActive")} />
                    {t("admin.status.active")}
                </label>
                <div className="ml-auto flex gap-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-bold text-gray-500">
                        {t("common.actions.cancel")}
                    </button>
                    <button
                        disabled={saving}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                        {saving ? t("common.state.saving") : t("common.actions.save")}
                    </button>
                </div>
            </div>
            <div className="md:col-span-2">
                <FormAlert>{error}</FormAlert>
            </div>
        </form>
    );
}

/** Bảng liên kết khách sạn, xe và chuyến bay của tour. */
function LinksPanel({ tour, onClose }) {
    const t = useT();
    const [links, setLinks] = useState({ hotels: [], cars: [], flights: [] });
    const [options, setOptions] = useState({ hotels: [], cars: [], flights: [] });
    const [values, setValues] = useState({
        hotelId: "",
        checkInDay: "",
        nights: "",
        carId: "",
        usageDay: "",
        flightId: "",
        leg: "outbound",
    });
    const [error, setError] = useState("");
    /** Tải liên kết và lựa chọn cho tour. */
    const load = useCallback(async () => {
        try {
            const [hotels, cars, flights, hotelOptions, carOptions, flightOptions] = await Promise.all([
                fetchTourHotels(tour.id),
                fetchTourCars(tour.id),
                fetchTourFlights(tour.id),
                fetchHotels({ page: 1, limit: 100 }),
                fetchCars({ limit: 100 }),
                fetchFlights({ limit: 100 }),
            ]);
            setLinks({ hotels, cars, flights });
            setOptions({ hotels: hotelOptions.items, cars: carOptions.items, flights: flightOptions.items });
        } catch (err) {
            setError(errorMessage(err));
        }
    }, [tour.id]);
    useEffect(() => {
        load();
    }, [load]);
    /** Thêm hoặc gỡ liên kết tour. */
    const change = async (kind, item, remove) => {
        try {
            const id = item?.hotelId || item?.carId || item?.flightId || values[`${kind.slice(0, -1)}Id`];
            const functions = {
                hotels: remove ? unlinkAdminTourHotel : linkAdminTourHotel,
                cars: remove ? unlinkAdminTourCar : linkAdminTourCar,
                flights: remove ? unlinkAdminTourFlight : linkAdminTourFlight,
            };
            const body =
                kind === "hotels"
                    ? { checkInDay: Number(values.checkInDay), nights: Number(values.nights) }
                    : kind === "cars"
                      ? { usageDay: Number(values.usageDay) }
                      : { leg: values.leg };
            const updated = await functions[kind](tour.id, id, body);
            setLinks((prev) => ({
                ...prev,
                [kind]: remove
                    ? prev[kind].filter((linked) => (linked.hotelId || linked.carId || linked.flightId) !== id)
                    : updated,
            }));
        } catch (err) {
            setError(errorMessage(err));
        }
    };
    /** Hiển thị một nhóm liên kết. */
    const section = (kind, title, label) => (
        <section className="border rounded-lg p-4 space-y-3">
            <h3 className="font-bold">{title}</h3>
            {links[kind].map((item) => (
                <div key={item[`${kind.slice(0, -1)}Id`]} className="flex justify-between text-sm">
                    <span>{label(item)}</span>
                    <button type="button" onClick={() => change(kind, item, true)} className="text-red-600 font-bold">
                        {t("common.actions.remove")}
                    </button>
                </div>
            ))}
            <div className="flex flex-wrap gap-2">
                <select
                    value={values[`${kind.slice(0, -1)}Id`]}
                    onChange={(e) => setValues((prev) => ({ ...prev, [`${kind.slice(0, -1)}Id`]: e.target.value }))}
                    className={filterClass}
                >
                    <option value="">{t("admin.tours.selectLink", { type: t(`admin.tours.${kind}`) })}</option>
                    {options[kind].map((item) => (
                        <option key={item.id} value={item.id}>
                            {label(item)}
                        </option>
                    ))}
                </select>
                {kind === "hotels" && (
                    <>
                        <input
                            type="number"
                            min="1"
                            placeholder={t("admin.tours.checkInDay")}
                            value={values.checkInDay}
                            onChange={(e) => setValues((prev) => ({ ...prev, checkInDay: e.target.value }))}
                            className={filterClass}
                        />
                        <input
                            type="number"
                            min="1"
                            placeholder={t("admin.tours.nights")}
                            value={values.nights}
                            onChange={(e) => setValues((prev) => ({ ...prev, nights: e.target.value }))}
                            className={filterClass}
                        />
                    </>
                )}
                {kind === "cars" && (
                    <input
                        type="number"
                        min="1"
                        placeholder={t("admin.tours.usageDay")}
                        value={values.usageDay}
                        onChange={(e) => setValues((prev) => ({ ...prev, usageDay: e.target.value }))}
                        className={filterClass}
                    />
                )}
                {kind === "flights" && (
                    <select
                        value={values.leg}
                        onChange={(e) => setValues((prev) => ({ ...prev, leg: e.target.value }))}
                        className={filterClass}
                    >
                        <option value="outbound">{t("admin.tours.outbound")}</option>
                        <option value="return">{t("admin.tours.return")}</option>
                        <option value="internal">{t("admin.tours.internal")}</option>
                    </select>
                )}
                <button
                    type="button"
                    disabled={!values[`${kind.slice(0, -1)}Id`]}
                    onClick={() => change(kind)}
                    className="bg-primary text-white px-3 py-2 rounded-lg text-xs font-bold"
                >
                    {t("common.actions.add")}
                </button>
            </div>
        </section>
    );
    return (
        <div className="bg-white rounded-xl border p-6 space-y-4">
            <div className="flex justify-between">
                <h2 className="font-extrabold text-primary">{t("admin.tours.links", { name: tour.name })}</h2>
                <button type="button" onClick={onClose} className="text-sm font-bold text-gray-500">
                    {t("common.actions.close")}
                </button>
            </div>
            <FormAlert>{error}</FormAlert>
            {section("hotels", t("admin.tours.hotels"), (item) => item.name)}
            {section("cars", t("admin.tours.cars"), (item) => item.name)}
            {section(
                "flights",
                t("admin.tours.flights"),
                (item) =>
                    `${item.airline} ${item.flightNumber} · ${item.departureAirportCode}→${item.arrivalAirportCode} · ${formatDateTime(item.departureTime)}`,
            )}
        </div>
    );
}

/** Tab quản lý danh sách tour. */
function ToursTab() {
    const t = useT();
    const [q, setQ] = useState("");
    const [search, setSearch] = useState("");
    const [active, setActive] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [destinations, setDestinations] = useState([]);
    const [editing, setEditing] = useState(null);
    const [linking, setLinking] = useState(null);
    const [error, setError] = useState("");
    /** Tải dữ liệu tour và điểm đến. */
    const load = useCallback(async () => {
        try {
            setResult(
                await fetchAdminTours({ q, active: active === "" ? undefined : active === "active", page, limit: PAGE_SIZE }),
            );
        } catch (err) {
            setError(errorMessage(err));
        }
    }, [q, active, page]);
    useEffect(() => {
        load();
    }, [load]);
    useEffect(() => {
        fetchDestinations()
            .then(setDestinations)
            .catch((err) => setError(errorMessage(err)));
    }, []);
    /** Lưu tour rồi tải lại danh sách. */
    const save = async (body) => {
        if (editing?.id) await updateAdminTour(editing.id, body);
        else await createAdminTour(body);
        setEditing(null);
        await load();
    };
    /** Ngừng kích hoạt tour sau xác nhận. */
    const deactivate = async (tour) => {
        if (!window.confirm(t("admin.tours.confirmDeactivate", { name: tour.name }))) return;
        try {
            await deleteAdminTour(tour.id);
            await load();
        } catch (err) {
            setError(errorMessage(err));
        }
    };
    return (
        <div className="space-y-6">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setQ(search.trim());
                    setPage(1);
                }}
                className="flex flex-wrap gap-3 items-center"
            >
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("admin.tours.searchPlaceholder")}
                    className={`${filterClass} w-72`}
                />
                <select
                    value={active}
                    onChange={(e) => {
                        setActive(e.target.value);
                        setPage(1);
                    }}
                    className={filterClass}
                >
                    <option value="">{t("common.status.all")}</option>
                    <option value="active">{t("admin.status.active")}</option>
                    <option value="inactive">{t("admin.tours.inactive")}</option>
                </select>
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">{t("common.actions.search")}</button>
                <button
                    type="button"
                    onClick={() => {
                        setEditing({});
                        setLinking(null);
                    }}
                    className="ml-auto bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold"
                >
                    {t("admin.tours.addTour")}
                </button>
            </form>
            {editing && (
                <TourForm initial={editing} destinations={destinations} onSave={save} onCancel={() => setEditing(null)} />
            )}
            {linking && <LinksPanel tour={linking} onClose={() => setLinking(null)} />}
            <FormAlert>{error}</FormAlert>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs text-gray-500">
                        <tr>
                            <th className="p-4">{t("admin.tours.tour")}</th>
                            <th>{t("admin.tours.duration")}</th>
                            <th>{t("admin.tours.adultPrice")}</th>
                            <th>{t("admin.tours.departure")}</th>
                            <th>{t("admin.tours.capacity")}</th>
                            <th>{t("admin.tours.hotels")}</th>
                            <th>{t("common.fields.status")}</th>
                            <th className="p-4">{t("admin.tours.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.items.map((tour) => (
                            <tr key={tour.id} className="border-t border-gray-100">
                                <td className="p-4">
                                    <div className="flex gap-3 items-center">
                                        {tour.coverImageUrl && (
                                            <img src={tour.coverImageUrl} alt="" className="h-10 w-14 object-cover rounded" />
                                        )}
                                        <div className="font-bold">
                                            {tour.name}
                                            <p className="text-xs font-normal text-gray-500">{tour.destinationName}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {t("admin.tours.durationSummary", { days: tour.durationDays, nights: tour.durationNights })}
                                </td>
                                <td>{formatMoney(tour.priceAdult, tour.currencyCode)}</td>
                                <td>{tour.departureDate ? formatDate(tour.departureDate) : t("admin.tours.flexible")}</td>
                                <td>{tour.maxParticipants || "—"}</td>
                                <td>{tour.hotelCount}</td>
                                <td>
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-bold ${tour.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}
                                    >
                                        {tour.isActive ? t("admin.status.active") : t("admin.tours.inactive")}
                                    </span>
                                </td>
                                <td className="p-4 whitespace-nowrap">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(tour);
                                            setLinking(null);
                                        }}
                                        className="text-primary font-bold text-xs"
                                    >
                                        {t("common.actions.edit")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLinking(tour);
                                            setEditing(null);
                                        }}
                                        className="ml-3 text-primary font-bold text-xs"
                                    >
                                        {t("admin.tours.linksAction")}
                                    </button>
                                    {tour.isActive && (
                                        <button
                                            type="button"
                                            onClick={() => deactivate(tour)}
                                            className="ml-3 text-red-600 font-bold text-xs"
                                        >
                                            {t("admin.tours.deactivate")}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

/** Tab quản lý đơn đặt tour. */
function BookingsTab() {
    const t = useT();
    const [status, setStatus] = useState("");
    const [q, setQ] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);
    /** Tải danh sách đơn tour. */
    const load = useCallback(async () => {
        try {
            setResult(await fetchAdminTourBookings({ status, q, page, limit: PAGE_SIZE }));
        } catch (err) {
            setError(errorMessage(err));
        }
    }, [status, q, page]);
    useEffect(() => {
        load();
    }, [load]);
    /** Thay đổi trạng thái một đơn tour. */
    const update = async (booking, next) => {
        if (!next) return;
        const reason = next === "cancelled" ? window.prompt(t("admin.tours.cancellationReason")) : undefined;
        if (reason === null) return;
        setBusyId(booking.id);
        try {
            const updated = await updateAdminTourBookingStatus(booking.id, next, reason);
            setResult((prev) => ({ ...prev, items: prev.items.map((item) => (item.id === updated.id ? updated : item)) }));
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setBusyId(null);
        }
    };
    return (
        <div className="space-y-6">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setQ(search.trim());
                    setPage(1);
                }}
                className="flex flex-wrap gap-3"
            >
                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                    className={filterClass}
                >
                    <option value="">{t("common.status.all")}</option>
                    {Object.entries(BOOKING_STATUS_LABELS).map(([key, value]) => (
                        <option key={key} value={key}>
                            {t(`admin.status.${key}`, { defaultValue: value.label })}
                        </option>
                    ))}
                </select>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("admin.tours.bookingSearchPlaceholder")}
                    className={`${filterClass} w-72`}
                />
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">{t("common.actions.search")}</button>
            </form>
            <FormAlert>{error}</FormAlert>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs text-gray-500">
                        <tr>
                            <th className="p-4">{t("admin.tours.order")}</th>
                            <th>{t("admin.tours.customer")}</th>
                            <th>{t("admin.tours.tour")}</th>
                            <th>{t("admin.tours.departureReturn")}</th>
                            <th>{t("common.fields.guests")}</th>
                            <th>{t("common.fields.total")}</th>
                            <th>{t("common.fields.status")}</th>
                            <th className="p-4">{t("admin.tours.action")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.items.map((booking) => (
                            <tr key={booking.id} className="border-t border-gray-100">
                                <td className="p-4 font-bold">{booking.orderCode}</td>
                                <td>
                                    {booking.contactName}
                                    <p className="text-xs text-gray-500">{booking.userEmail}</p>
                                </td>
                                <td>{booking.tourName}</td>
                                <td>
                                    {formatDate(booking.departureDate)} → {formatDate(booking.returnDate)}
                                </td>
                                <td>
                                    {t("admin.tours.guestsSummary", { adults: booking.numAdults, children: booking.numChildren })}
                                </td>
                                <td>{formatMoney(booking.totalPrice, booking.currencyCode)}</td>
                                <td>
                                    <StatusBadge status={booking.status} labels={Object.fromEntries(Object.entries(BOOKING_STATUS_LABELS).map(([value, cfg]) => [value, { ...cfg, label: t(`admin.status.${value}`, { defaultValue: cfg.label }) }]))} />
                                </td>
                                <td className="p-4">
                                    <select
                                        disabled={
                                            busyId === booking.id || !(TOUR_BOOKING_NEXT_STATUSES[booking.status] || []).length
                                        }
                                        value=""
                                        onChange={(e) => update(booking, e.target.value)}
                                        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs"
                                    >
                                        <option value="">{t("admin.tours.changeStatus")}</option>
                                        {(TOUR_BOOKING_NEXT_STATUSES[booking.status] || []).map((next) => (
                                            <option key={next} value={next}>
                                                {t(`admin.status.${next}`, { defaultValue: BOOKING_STATUS_LABELS[next].label })}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

/** Trang quản trị tour và đơn đặt tour. */
function AdminTours() {
    const t = useT();
    const [tab, setTab] = useState("tours");
    /** Tạo lớp hiển thị cho nút tab. */
    const tabClass = (active) =>
        `px-4 py-2 text-sm font-bold border-b-2 ${active ? "border-primary text-primary" : "border-transparent text-gray-500"}`;
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">{t("admin.tours.title")}</h1>
            <AdminStatsPanel section="tours" />
            <div className="flex gap-2 border-b border-gray-200">
                <button type="button" onClick={() => setTab("tours")} className={tabClass(tab === "tours")}>
                    {t("admin.tours.tours")}
                </button>
                <button type="button" onClick={() => setTab("bookings")} className={tabClass(tab === "bookings")}>
                    {t("admin.tours.bookings")}
                </button>
            </div>
            {tab === "tours" ? <ToursTab /> : <BookingsTab />}
        </div>
    );
}

export default AdminTours;
