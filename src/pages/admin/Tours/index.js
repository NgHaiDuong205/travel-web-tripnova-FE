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
                Name *<input required value={form.name} onChange={set("name")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Destination
                <select value={form.destinationId || ""} onChange={set("destinationId")} className={inputClass}>
                    <option value="">— None —</option>
                    {destinations.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>
            </label>
            <label className="text-xs font-bold text-gray-600">
                Departure location
                <input value={form.departureLocation || ""} onChange={set("departureLocation")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Duration days *
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
                Duration nights
                <input
                    min="0"
                    type="number"
                    value={form.durationNights ?? ""}
                    onChange={set("durationNights")}
                    className={inputClass}
                />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Minimum participants
                <input
                    min="0"
                    type="number"
                    value={form.minParticipants ?? ""}
                    onChange={set("minParticipants")}
                    className={inputClass}
                />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Maximum participants
                <input
                    min="0"
                    type="number"
                    value={form.maxParticipants ?? ""}
                    onChange={set("maxParticipants")}
                    className={inputClass}
                />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Adult price *
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
                Child price
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
                Departure date
                <input type="date" value={form.departureDate || ""} onChange={set("departureDate")} className={inputClass} />
                <span className="font-normal text-gray-400">leave empty = customer picks a date</span>
            </label>
            <label className="text-xs font-bold text-gray-600">
                Return date
                <input type="date" value={form.returnDate || ""} onChange={set("returnDate")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600 md:col-span-2">
                Cover image URL
                <input value={form.coverImageUrl || ""} onChange={set("coverImageUrl")} className={inputClass} />
                {form.coverImageUrl && (
                    <img src={form.coverImageUrl} alt="Tour preview" className="mt-2 h-28 w-44 rounded object-cover" />
                )}
            </label>
            <label className="text-xs font-bold text-gray-600 md:col-span-2">
                Description
                <textarea rows="4" value={form.description || ""} onChange={set("description")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Highlights
                <textarea rows="4" value={form.highlights} onChange={set("highlights")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Included
                <textarea rows="4" value={form.included} onChange={set("included")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600 md:col-span-2">
                Excluded
                <textarea rows="4" value={form.excluded} onChange={set("excluded")} className={inputClass} />
            </label>
            <div className="md:col-span-2 space-y-3">
                <div className="flex justify-between">
                    <span className="text-xs font-bold text-gray-600">Itinerary</span>
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
                        Add row
                    </button>
                </div>
                {form.itinerary.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <input
                            placeholder="Label"
                            value={item.label}
                            onChange={(e) => setItinerary(index, "label", e.target.value)}
                            className={inputClass}
                        />
                        <input
                            placeholder="Title"
                            value={item.title}
                            onChange={(e) => setItinerary(index, "title", e.target.value)}
                            className={inputClass}
                        />
                        <input
                            placeholder="Description"
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
                            Remove
                        </button>
                    </div>
                ))}
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.isActive} onChange={set("isActive")} />
                    Active
                </label>
                <div className="ml-auto flex gap-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-bold text-gray-500">
                        Cancel
                    </button>
                    <button
                        disabled={saving}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save"}
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
                        Remove
                    </button>
                </div>
            ))}
            <div className="flex flex-wrap gap-2">
                <select
                    value={values[`${kind.slice(0, -1)}Id`]}
                    onChange={(e) => setValues((prev) => ({ ...prev, [`${kind.slice(0, -1)}Id`]: e.target.value }))}
                    className={filterClass}
                >
                    <option value="">Select {kind.slice(0, -1)}</option>
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
                            placeholder="Check-in day"
                            value={values.checkInDay}
                            onChange={(e) => setValues((prev) => ({ ...prev, checkInDay: e.target.value }))}
                            className={filterClass}
                        />
                        <input
                            type="number"
                            min="1"
                            placeholder="Nights"
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
                        placeholder="Usage day"
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
                        <option value="outbound">outbound</option>
                        <option value="return">return</option>
                        <option value="internal">internal</option>
                    </select>
                )}
                <button
                    type="button"
                    disabled={!values[`${kind.slice(0, -1)}Id`]}
                    onClick={() => change(kind)}
                    className="bg-primary text-white px-3 py-2 rounded-lg text-xs font-bold"
                >
                    Add
                </button>
            </div>
        </section>
    );
    return (
        <div className="bg-white rounded-xl border p-6 space-y-4">
            <div className="flex justify-between">
                <h2 className="font-extrabold text-primary">Links: {tour.name}</h2>
                <button type="button" onClick={onClose} className="text-sm font-bold text-gray-500">
                    Close
                </button>
            </div>
            <FormAlert>{error}</FormAlert>
            {section("hotels", "Hotels", (item) => item.name)}
            {section("cars", "Cars", (item) => item.name)}
            {section(
                "flights",
                "Flights",
                (item) =>
                    `${item.airline} ${item.flightNumber} · ${item.departureAirportCode}→${item.arrivalAirportCode} · ${formatDateTime(item.departureTime)}`,
            )}
        </div>
    );
}

/** Tab quản lý danh sách tour. */
function ToursTab() {
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
        if (!window.confirm(`Deactivate ${tour.name}?`)) return;
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
                    placeholder="Search tours"
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
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">Search</button>
                <button
                    type="button"
                    onClick={() => {
                        setEditing({});
                        setLinking(null);
                    }}
                    className="ml-auto bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold"
                >
                    Add tour
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
                            <th className="p-4">Tour</th>
                            <th>Duration</th>
                            <th>Adult price</th>
                            <th>Departure</th>
                            <th>Capacity</th>
                            <th>Hotels</th>
                            <th>Status</th>
                            <th className="p-4">Actions</th>
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
                                    {tour.durationDays} days / {tour.durationNights} nights
                                </td>
                                <td>{formatMoney(tour.priceAdult, tour.currencyCode)}</td>
                                <td>{tour.departureDate ? formatDate(tour.departureDate) : "Flexible"}</td>
                                <td>{tour.maxParticipants || "—"}</td>
                                <td>{tour.hotelCount}</td>
                                <td>
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-bold ${tour.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}
                                    >
                                        {tour.isActive ? "Active" : "Inactive"}
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
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLinking(tour);
                                            setEditing(null);
                                        }}
                                        className="ml-3 text-primary font-bold text-xs"
                                    >
                                        Links
                                    </button>
                                    {tour.isActive && (
                                        <button
                                            type="button"
                                            onClick={() => deactivate(tour)}
                                            className="ml-3 text-red-600 font-bold text-xs"
                                        >
                                            Deactivate
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
        const reason = next === "cancelled" ? window.prompt("Cancellation reason:") : undefined;
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
                    <option value="">All statuses</option>
                    {Object.entries(BOOKING_STATUS_LABELS).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value.label}
                        </option>
                    ))}
                </select>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Order, customer, contact, tour"
                    className={`${filterClass} w-72`}
                />
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">Search</button>
            </form>
            <FormAlert>{error}</FormAlert>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs text-gray-500">
                        <tr>
                            <th className="p-4">Order</th>
                            <th>Customer</th>
                            <th>Tour</th>
                            <th>Departure → return</th>
                            <th>Guests</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th className="p-4">Action</th>
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
                                    {booking.numAdults} adults + {booking.numChildren} children
                                </td>
                                <td>{formatMoney(booking.totalPrice, booking.currencyCode)}</td>
                                <td>
                                    <StatusBadge status={booking.status} labels={BOOKING_STATUS_LABELS} />
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
                                        <option value="">Change status…</option>
                                        {(TOUR_BOOKING_NEXT_STATUSES[booking.status] || []).map((next) => (
                                            <option key={next} value={next}>
                                                {BOOKING_STATUS_LABELS[next].label}
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
    const [tab, setTab] = useState("tours");
    /** Tạo lớp hiển thị cho nút tab. */
    const tabClass = (active) =>
        `px-4 py-2 text-sm font-bold border-b-2 ${active ? "border-primary text-primary" : "border-transparent text-gray-500"}`;
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">Tours</h1>
            <AdminStatsPanel section="tours" />
            <div className="flex gap-2 border-b border-gray-200">
                <button type="button" onClick={() => setTab("tours")} className={tabClass(tab === "tours")}>
                    Tours
                </button>
                <button type="button" onClick={() => setTab("bookings")} className={tabClass(tab === "bookings")}>
                    Bookings
                </button>
            </div>
            {tab === "tours" ? <ToursTab /> : <BookingsTab />}
        </div>
    );
}

export default AdminTours;
