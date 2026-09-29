import { useCallback, useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../../components/common/StatusBadge";
import { BOOKING_STATUS_LABELS } from "../../../services/carService";
import {
    FLIGHT_BOOKING_NEXT_STATUSES,
    createAdminFlight,
    fetchAdminFlightBookings,
    fetchAdminFlightSeats,
    fetchAdminFlights,
    generateAdminFlightSeats,
    updateAdminFlight,
    updateAdminFlightBookingStatus,
    updateAdminFlightSeat,
} from "../../../services/adminFlightService";
import { SEAT_CLASS_LABELS, formatDuration } from "../../../services/flightService";
import { formatDateTime, formatMoney } from "../../../utils/formatters";

const PAGE_SIZE = 20;
const EMPTY_FLIGHT = {
    flightNumber: "",
    airline: "",
    airlineLogoUrl: "",
    aircraftType: "",
    departureAirportCode: "",
    departureCity: "",
    arrivalAirportCode: "",
    arrivalCity: "",
    departureTime: "",
    arrivalTime: "",
    basePrice: "",
    baggagePolicy: "",
    isActive: true,
};
const EMPTY_BLOCK = { seatClass: "economy", fromRow: "1", toRow: "1", letters: "ABCDEF", price: "" };
// Dự án không dùng @tailwindcss/forms nên phải khai báo rõ border + padding.
const inputClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm w-full";
const filterClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm";
const seatStatusClasses = {
    available: "bg-white border border-gray-300",
    held: "bg-amber-100 border border-amber-200",
    booked: "bg-blue-100 border border-blue-200",
    blocked: "bg-gray-300 border border-gray-400 line-through",
};
const seatClassBorders = {
    economy: "border-l-green-500",
    premium_economy: "border-l-teal-500",
    business: "border-l-purple-500",
    first: "border-l-amber-500",
};

function errorMessage(err) {
    return [err.message, ...(err.details || [])].filter(Boolean).join(" ");
}

function localDateTime(value) {
    return value ? value.slice(0, 16) : "";
}

function apiDateTime(value) {
    return value && value.length === 16 ? `${value}:00` : value;
}

/** Biểu mẫu thêm hoặc sửa chuyến bay trong khu vực quản trị. */
function FlightForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState({
        ...EMPTY_FLIGHT,
        ...initial,
        departureTime: localDateTime(initial?.departureTime),
        arrivalTime: localDateTime(initial?.arrivalTime),
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = (name) => (event) =>
        setForm((prev) => ({ ...prev, [name]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            await onSave({
                ...form,
                flightNumber: form.flightNumber.trim(),
                airline: form.airline.trim(),
                basePrice: Number(form.basePrice),
                departureTime: apiDateTime(form.departureTime),
                arrivalTime: apiDateTime(form.arrivalTime),
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
                Flight number *
                <input required value={form.flightNumber} onChange={set("flightNumber")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Airline *
                <input required value={form.airline} onChange={set("airline")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Airline logo URL
                <input value={form.airlineLogoUrl || ""} onChange={set("airlineLogoUrl")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Aircraft type
                <input value={form.aircraftType || ""} onChange={set("aircraftType")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Departure airport code *
                <input required value={form.departureAirportCode} onChange={set("departureAirportCode")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Departure city
                <input value={form.departureCity || ""} onChange={set("departureCity")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Arrival airport code *
                <input required value={form.arrivalAirportCode} onChange={set("arrivalAirportCode")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Arrival city
                <input value={form.arrivalCity || ""} onChange={set("arrivalCity")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Departure time *
                <input
                    required
                    type="datetime-local"
                    value={form.departureTime}
                    onChange={set("departureTime")}
                    className={inputClass}
                />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Arrival time *
                <input
                    required
                    type="datetime-local"
                    value={form.arrivalTime}
                    onChange={set("arrivalTime")}
                    className={inputClass}
                />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Base price *
                <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    value={form.basePrice}
                    onChange={set("basePrice")}
                    className={inputClass}
                />
            </label>
            <label className="md:col-span-2 text-xs font-bold text-gray-600">
                Baggage policy
                <textarea rows="4" value={form.baggagePolicy || ""} onChange={set("baggagePolicy")} className={inputClass} />
            </label>
            <div className="md:col-span-2 flex flex-wrap items-center gap-5">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={form.isActive} onChange={set("isActive")} />
                    Active
                </label>
                <div className="ml-auto flex gap-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500">
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

/** Bảng tạo và quản lý sơ đồ ghế chuyến bay. */
function SeatPanel({ flight, onClose }) {
    const [blocks, setBlocks] = useState([{ ...EMPTY_BLOCK }]);
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const refresh = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setSeats(await fetchAdminFlightSeats(flight.id));
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [flight.id]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    const changeBlock = (index, name, value) => {
        setBlocks((prev) => prev.map((block, current) => (current === index ? { ...block, [name]: value } : block)));
    };
    const changeClass = (index, seatClass) => {
        setBlocks((prev) =>
            prev.map((block, current) =>
                current === index
                    ? { ...block, seatClass, letters: seatClass === "business" ? "ACDF" : block.letters || "ABCDEF" }
                    : block,
            ),
        );
    };
    const generate = async (event) => {
        event.preventDefault();
        if (!window.confirm("Replaces all seats that were never booked. Continue?")) return;
        setSaving(true);
        setError("");
        try {
            await generateAdminFlightSeats(
                flight.id,
                blocks.map((block) => ({
                    ...block,
                    fromRow: Number(block.fromRow),
                    toRow: Number(block.toRow),
                    price: Number(block.price),
                })),
            );
            await refresh();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };
    const toggleSeat = async (seat) => {
        const blocking = seat.status === "available";
        if (blocking && !window.confirm(`Block seat ${seat.seatNumber}?`)) return;
        setSaving(true);
        setError("");
        try {
            const updated = await updateAdminFlightSeat(flight.id, seat.id, {
                seatNumber: seat.seatNumber,
                seatClass: seat.seatClass,
                price: seat.price,
                status: blocking ? "blocked" : "available",
            });
            setSeats((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };
    const rows = seats.reduce((groups, seat) => {
        const row = seat.seatNumber.match(/\d+/)?.[0] || "?";
        groups[row] = [...(groups[row] || []), seat];
        return groups;
    }, {});
    const orderedRows = Object.entries(rows).sort(([a], [b]) => Number(a) - Number(b));
    const counts = ["available", "held", "booked", "blocked"].reduce((total, status) => {
        total[status] = seats.filter((seat) => seat.status === status).length;
        return total;
    }, {});
    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
                <div>
                    <h2 className="font-extrabold text-primary">Seat map: {flight.flightNumber}</h2>
                    <p className="text-sm text-gray-500">
                        {flight.departureAirportCode} → {flight.arrivalAirportCode}
                    </p>
                </div>
                <button type="button" onClick={onClose} className="ml-auto text-sm font-bold text-gray-500">
                    Close seats
                </button>
            </div>
            <form onSubmit={generate} className="space-y-3 rounded-lg bg-gray-50 border border-gray-100 p-4">
                <h3 className="font-bold text-sm text-gray-700">Generate seat map</h3>
                {blocks.map((block, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
                        <label className="text-xs font-bold text-gray-600">
                            Class
                            <select
                                value={block.seatClass}
                                onChange={(event) => changeClass(index, event.target.value)}
                                className={inputClass}
                            >
                                {Object.entries(SEAT_CLASS_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="text-xs font-bold text-gray-600">
                            From row
                            <input
                                required
                                min="1"
                                type="number"
                                value={block.fromRow}
                                onChange={(event) => changeBlock(index, "fromRow", event.target.value)}
                                className={inputClass}
                            />
                        </label>
                        <label className="text-xs font-bold text-gray-600">
                            To row
                            <input
                                required
                                min="1"
                                type="number"
                                value={block.toRow}
                                onChange={(event) => changeBlock(index, "toRow", event.target.value)}
                                className={inputClass}
                            />
                        </label>
                        <label className="text-xs font-bold text-gray-600">
                            Letters
                            <input
                                required
                                value={block.letters}
                                onChange={(event) => changeBlock(index, "letters", event.target.value.toUpperCase())}
                                className={inputClass}
                            />
                        </label>
                        <label className="text-xs font-bold text-gray-600">
                            Price
                            <input
                                required
                                min="0"
                                step="0.01"
                                type="number"
                                value={block.price}
                                onChange={(event) => changeBlock(index, "price", event.target.value)}
                                className={inputClass}
                            />
                        </label>
                        <button
                            type="button"
                            disabled={blocks.length === 1}
                            onClick={() => setBlocks((prev) => prev.filter((_, current) => current !== index))}
                            className="px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-40"
                        >
                            Remove block
                        </button>
                    </div>
                ))}
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setBlocks((prev) => [...prev, { ...EMPTY_BLOCK }])}
                        className="px-4 py-2 rounded-lg text-sm font-bold border border-primary text-primary"
                    >
                        Add block
                    </button>
                    <button
                        disabled={saving}
                        className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white disabled:opacity-50"
                    >
                        Generate seat map
                    </button>
                </div>
            </form>
            <FormAlert>{error}</FormAlert>
            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                {Object.entries(seatStatusClasses).map(([status, className]) => (
                    <span key={status} className="flex items-center gap-1 capitalize">
                        <i className={`inline-block w-3 h-3 rounded ${className}`} />
                        {status}: {counts[status]}
                    </span>
                ))}
                {Object.entries(SEAT_CLASS_LABELS).map(([seatClass, label]) => (
                    <span key={seatClass} className={`border-l-4 pl-1 ${seatClassBorders[seatClass]}`}>
                        {label}
                    </span>
                ))}
            </div>
            {loading ? (
                <p className="text-gray-500">Đang tải...</p>
            ) : orderedRows.length === 0 ? (
                <p className="text-gray-500">Chưa có ghế.</p>
            ) : (
                <div className="space-y-2 overflow-x-auto">
                    {orderedRows.map(([row, rowSeats]) => (
                        <div key={row} className="flex items-center gap-2">
                            <span className="w-8 text-right text-xs font-bold text-gray-500">{row}</span>
                            <div className="flex gap-2">
                                {rowSeats
                                    .sort((a, b) => a.seatNumber.localeCompare(b.seatNumber))
                                    .map((seat) => (
                                        <button
                                            key={seat.id}
                                            type="button"
                                            disabled={saving || !["available", "blocked"].includes(seat.status)}
                                            onClick={() => toggleSeat(seat)}
                                            title={`${SEAT_CLASS_LABELS[seat.seatClass] || seat.seatClass}: ${seat.status}`}
                                            className={`w-9 h-9 border-l-4 text-xs font-bold rounded disabled:cursor-default ${seatStatusClasses[seat.status] || seatStatusClasses.available} ${seatClassBorders[seat.seatClass] || "border-l-gray-400"}`}
                                        >
                                            {seat.seatNumber}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

/** Tab quản lý chuyến bay. */
function FlightsTab() {
    const [q, setQ] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(null);
    const [seatFlight, setSeatFlight] = useState(null);
    const [reload, setReload] = useState(0);
    const [busyId, setBusyId] = useState(null);
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchAdminFlights({ q, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(errorMessage(err)))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [q, page, reload]);
    const save = async (payload) => {
        if (editing === "new") await createAdminFlight(payload);
        else await updateAdminFlight(editing.id, payload);
        setEditing(null);
        setReload((value) => value + 1);
    };
    const deactivate = async (flight) => {
        if (!window.confirm(`Deactivate ${flight.flightNumber}?`)) return;
        setBusyId(flight.id);
        setError("");
        try {
            await updateAdminFlight(flight.id, { ...flight, isActive: false });
            setReload((value) => value + 1);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setBusyId(null);
        }
    };
    return (
        <div className="space-y-6">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setQ(search.trim());
                    setPage(1);
                }}
                className="flex flex-wrap items-center gap-3"
            >
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search flights..."
                    className={`${filterClass} w-64`}
                />
                <button className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white">Search</button>
                <button
                    type="button"
                    onClick={() => setEditing("new")}
                    className="ml-auto px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white"
                >
                    Add flight
                </button>
            </form>
            <FormAlert>{error}</FormAlert>
            {editing && (
                <FlightForm
                    initial={editing === "new" ? EMPTY_FLIGHT : editing}
                    onSave={save}
                    onCancel={() => setEditing(null)}
                />
            )}
            {seatFlight && <SeatPanel flight={seatFlight} onClose={() => setSeatFlight(null)} />}
            {loading ? (
                <p className="text-gray-500">Đang tải...</p>
            ) : result.items.length === 0 ? (
                <p className="text-gray-500">Không có dữ liệu.</p>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs text-gray-500">
                            <tr>
                                <th className="p-4">Flight</th>
                                <th>Route</th>
                                <th>Departure</th>
                                <th>Duration</th>
                                <th>Seats</th>
                                <th>Base price</th>
                                <th>Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.items.map((flight) => (
                                <tr key={flight.id} className="border-t border-gray-100">
                                    <td className="p-4">
                                        <b>
                                            {flight.airline} {flight.flightNumber}
                                        </b>
                                        <p className="text-xs text-gray-500">{flight.aircraftType}</p>
                                    </td>
                                    <td>
                                        <b>
                                            {flight.departureAirportCode} → {flight.arrivalAirportCode}
                                        </b>
                                        <p className="text-xs text-gray-500">
                                            {flight.departureCity} → {flight.arrivalCity}
                                        </p>
                                    </td>
                                    <td>{formatDateTime(flight.departureTime)}</td>
                                    <td>{formatDuration(flight.durationMinutes)}</td>
                                    <td>
                                        {flight.availableSeats} / {flight.totalSeats}
                                    </td>
                                    <td>{formatMoney(flight.basePrice, flight.currencyCode)}</td>
                                    <td>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-bold ${flight.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}
                                        >
                                            {flight.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => setEditing(flight)}
                                            className="text-primary font-bold text-xs"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSeatFlight(flight)}
                                            className="ml-3 text-primary font-bold text-xs"
                                        >
                                            Seats
                                        </button>
                                        {flight.isActive && (
                                            <button
                                                type="button"
                                                disabled={busyId === flight.id}
                                                onClick={() => deactivate(flight)}
                                                className="ml-3 text-red-600 font-bold text-xs disabled:opacity-50"
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
            )}
            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

/** Tab quản lý đơn đặt chuyến bay. */
function BookingsTab() {
    const [status, setStatus] = useState("");
    const [q, setQ] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchAdminFlightBookings({ status, q, page, limit: PAGE_SIZE })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(errorMessage(err)))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [status, q, page]);
    const update = async (booking, nextStatus) => {
        if (!nextStatus) return;
        const reason = nextStatus === "cancelled" ? window.prompt("Cancellation reason:") : undefined;
        if (nextStatus === "cancelled" && reason === null) return;
        setBusyId(booking.id);
        setError("");
        try {
            const updated = await updateAdminFlightBookingStatus(booking.id, nextStatus, reason);
            setResult((prev) => ({
                ...prev,
                items: prev.items.map((item) => (item.id === updated.id ? updated : item)),
            }));
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setBusyId(null);
        }
    };
    return (
        <div className="space-y-6">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setQ(search.trim());
                    setPage(1);
                }}
                className="flex flex-wrap items-center gap-3"
            >
                <select
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value);
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
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Order, customer, passenger, flight no."
                    className={`${filterClass} w-72`}
                />
                <button className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white">Search</button>
            </form>
            <FormAlert>{error}</FormAlert>
            {loading ? (
                <p className="text-gray-500">Đang tải...</p>
            ) : result.items.length === 0 ? (
                <p className="text-gray-500">Không có dữ liệu.</p>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs text-gray-500">
                            <tr>
                                <th className="p-4">Order</th>
                                <th>Passenger</th>
                                <th>Flight</th>
                                <th>Departure</th>
                                <th>Seat</th>
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
                                        {booking.passengerName}
                                        <p className="text-xs text-gray-500">{booking.userEmail}</p>
                                    </td>
                                    <td>
                                        <b>
                                            {booking.airline} {booking.flightNumber}
                                        </b>
                                        <p className="text-xs text-gray-500">
                                            {booking.departureAirportCode} → {booking.arrivalAirportCode}
                                        </p>
                                    </td>
                                    <td>{formatDateTime(booking.departureTime)}</td>
                                    <td>
                                        {booking.seatNumber}
                                        <p className="text-xs text-gray-500">
                                            {SEAT_CLASS_LABELS[booking.seatClass] || booking.seatClass}
                                        </p>
                                    </td>
                                    <td>{formatMoney(booking.totalPrice, booking.currencyCode)}</td>
                                    <td>
                                        <StatusBadge status={booking.status} labels={BOOKING_STATUS_LABELS} />
                                    </td>
                                    <td className="p-4">
                                        <select
                                            disabled={
                                                busyId === booking.id ||
                                                !(FLIGHT_BOOKING_NEXT_STATUSES[booking.status] || []).length
                                            }
                                            value=""
                                            onChange={(event) => update(booking, event.target.value)}
                                            className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs"
                                        >
                                            <option value="">Change status…</option>
                                            {(FLIGHT_BOOKING_NEXT_STATUSES[booking.status] || []).map((next) => (
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
            )}
            <Pagination page={page} total={result.total} limit={PAGE_SIZE} onChange={setPage} />
        </div>
    );
}

/** Trang quản trị chuyến bay và đơn đặt chuyến bay. */
function AdminFlights() {
    const [tab, setTab] = useState("flights");
    const tabClass = (active) =>
        `px-4 py-2 text-sm font-bold border-b-2 ${active ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800"}`;
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">Flights</h1>
            <div className="flex gap-2 border-b border-gray-200">
                <button type="button" onClick={() => setTab("flights")} className={tabClass(tab === "flights")}>
                    Flights
                </button>
                <button type="button" onClick={() => setTab("bookings")} className={tabClass(tab === "bookings")}>
                    Bookings
                </button>
            </div>
            {tab === "flights" ? <FlightsTab /> : <BookingsTab />}
        </div>
    );
}

export default AdminFlights;
