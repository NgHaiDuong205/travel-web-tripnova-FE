import { useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../../components/common/StatusBadge";
import { BOOKING_STATUS_LABELS, CAR_TYPE_LABELS } from "../../../services/carService";
import {
    CAR_BOOKING_NEXT_STATUSES,
    createAdminCar,
    deleteAdminCar,
    fetchAdminCarBookings,
    fetchAdminCars,
    updateAdminCar,
    updateAdminCarBookingStatus,
} from "../../../services/adminCarService";
import { fetchDestinations } from "../../../services/destinationService";
import { formatDateTime, formatMoney } from "../../../utils/formatters";

const PAGE_SIZE = 20;
const EMPTY_CAR = {
    name: "",
    brand: "",
    model: "",
    licensePlate: "",
    carType: "sedan",
    seats: 4,
    transmission: "automatic",
    fuelType: "petrol",
    pricePerDay: "",
    withDriver: false,
    isActive: true,
    destinationId: "",
    pickupLocation: "",
    coverImageUrl: "",
    description: "",
};
// Dự án không dùng @tailwindcss/forms nên phải khai báo rõ border + padding.
const inputClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm w-full";
const filterClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm";

function errorMessage(err) {
    return [err.message, ...(err.details || [])].filter(Boolean).join(" ");
}

/** Biểu mẫu thêm hoặc sửa xe trong khu vực quản trị. */
function CarForm({ initial, destinations, onSave, onCancel }) {
    const [form, setForm] = useState({ ...EMPTY_CAR, ...initial, destinationId: initial?.destinationId || "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = (name) => (e) =>
        setForm((prev) => ({ ...prev, [name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await onSave({
                ...form,
                name: form.name.trim(),
                seats: Number(form.seats),
                pricePerDay: Number(form.pricePerDay),
                destinationId: form.destinationId || undefined,
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
                Brand
                <input value={form.brand || ""} onChange={set("brand")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Model
                <input value={form.model || ""} onChange={set("model")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                License plate
                <input value={form.licensePlate || ""} onChange={set("licensePlate")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Car type *
                <select required value={form.carType} onChange={set("carType")} className={inputClass}>
                    {Object.entries(CAR_TYPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
            </label>
            <label className="text-xs font-bold text-gray-600">
                Seats *
                <input
                    required
                    min="1"
                    max="60"
                    type="number"
                    value={form.seats}
                    onChange={set("seats")}
                    className={inputClass}
                />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Transmission
                <select value={form.transmission} onChange={set("transmission")} className={inputClass}>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                </select>
            </label>
            <label className="text-xs font-bold text-gray-600">
                Fuel type
                <select value={form.fuelType} onChange={set("fuelType")} className={inputClass}>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                </select>
            </label>
            <label className="text-xs font-bold text-gray-600">
                Price / day *
                <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    value={form.pricePerDay}
                    onChange={set("pricePerDay")}
                    className={inputClass}
                />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Destination
                <select value={form.destinationId} onChange={set("destinationId")} className={inputClass}>
                    <option value="">— None —</option>
                    {destinations.map((destination) => (
                        <option key={destination.id} value={destination.id}>
                            {destination.name}
                        </option>
                    ))}
                </select>
            </label>
            <label className="text-xs font-bold text-gray-600">
                Pick-up location
                <input value={form.pickupLocation || ""} onChange={set("pickupLocation")} className={inputClass} />
            </label>
            <label className="text-xs font-bold text-gray-600">
                Cover image URL
                <input type="url" value={form.coverImageUrl || ""} onChange={set("coverImageUrl")} className={inputClass} />
            </label>
            <label className="md:col-span-2 text-xs font-bold text-gray-600">
                Description
                <textarea rows="4" value={form.description || ""} onChange={set("description")} className={inputClass} />
            </label>
            {form.coverImageUrl && (
                <img src={form.coverImageUrl} alt="Cover preview" className="w-32 h-20 object-cover rounded bg-gray-100" />
            )}
            <div className="md:col-span-2 flex flex-wrap items-center gap-5">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={form.withDriver} onChange={set("withDriver")} />
                    With driver
                </label>
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

/** Tab quản lý đội xe. */
function FleetTab() {
    const [filters, setFilters] = useState({ q: "", type: "", active: "" });
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(null);
    const [reload, setReload] = useState(0);
    const [busyId, setBusyId] = useState(null);
    useEffect(() => {
        fetchDestinations()
            .then(setDestinations)
            .catch((err) => setError(errorMessage(err)));
    }, []);
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchAdminCars({
            ...filters,
            active: filters.active === "" ? undefined : filters.active === "active",
            page,
            limit: PAGE_SIZE,
        })
            .then((data) => !cancelled && setResult(data))
            .catch((err) => !cancelled && setError(errorMessage(err)))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [filters, page, reload]);
    const change = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(1);
    };
    const save = async (payload) => {
        if (editing === "new") await createAdminCar(payload);
        else await updateAdminCar(editing.id, payload);
        setEditing(null);
        setReload((value) => value + 1);
    };
    const deactivate = async (car) => {
        if (!window.confirm(`Deactivate ${car.name}?`)) return;
        setBusyId(car.id);
        setError("");
        try {
            await deleteAdminCar(car.id);
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
                onSubmit={(e) => {
                    e.preventDefault();
                    change("q", search.trim());
                }}
                className="flex flex-wrap items-center gap-3"
            >
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search cars..."
                    className={`${filterClass} w-64`}
                />
                <select value={filters.type} onChange={(e) => change("type", e.target.value)} className={filterClass}>
                    <option value="">All types</option>
                    {Object.entries(CAR_TYPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
                <select value={filters.active} onChange={(e) => change("active", e.target.value)} className={filterClass}>
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <button className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white">Search</button>
                <button
                    type="button"
                    onClick={() => setEditing("new")}
                    className="ml-auto px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white"
                >
                    Add car
                </button>
            </form>
            <FormAlert>{error}</FormAlert>
            {editing && (
                <CarForm
                    initial={editing === "new" ? EMPTY_CAR : editing}
                    destinations={destinations}
                    onSave={save}
                    onCancel={() => setEditing(null)}
                />
            )}
            {loading ? (
                <p className="text-gray-500">Đang tải...</p>
            ) : result.items.length === 0 ? (
                <p className="text-gray-500">Không có dữ liệu.</p>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs text-gray-500">
                            <tr>
                                <th className="p-4">Car</th>
                                <th>Plate</th>
                                <th>Type</th>
                                <th>Seats</th>
                                <th>Price/day</th>
                                <th>Driver</th>
                                <th>Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.items.map((car) => (
                                <tr key={car.id} className="border-t border-gray-100">
                                    <td className="p-4">
                                        <div className="flex gap-3">
                                            <img
                                                src={car.coverImageUrl}
                                                alt=""
                                                className="w-16 h-10 object-cover rounded bg-gray-100"
                                            />
                                            <div>
                                                <b>{car.name}</b>
                                                <p className="text-xs text-gray-500">
                                                    {[car.brand, car.model].filter(Boolean).join(" ")}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{car.licensePlate}</td>
                                    <td>{CAR_TYPE_LABELS[car.carType] || car.carType}</td>
                                    <td>{car.seats}</td>
                                    <td>{formatMoney(car.pricePerDay, car.currencyCode)}</td>
                                    <td>{car.withDriver ? "Yes" : "No"}</td>
                                    <td>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-bold ${car.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}
                                        >
                                            {car.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => setEditing(car)}
                                            className="text-primary font-bold text-xs"
                                        >
                                            Edit
                                        </button>
                                        {car.isActive && (
                                            <button
                                                type="button"
                                                disabled={busyId === car.id}
                                                onClick={() => deactivate(car)}
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

/** Tab quản lý đơn thuê xe. */
function RentalsTab() {
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
        fetchAdminCarBookings({ status, q, page, limit: PAGE_SIZE })
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
            const updated = await updateAdminCarBookingStatus(booking.id, nextStatus, reason);
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
                className="flex flex-wrap items-center gap-3"
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
                    placeholder="Order code, customer, car, plate"
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
                                <th>Customer</th>
                                <th>Car</th>
                                <th>Pick-up → return</th>
                                <th>Days</th>
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
                                        {booking.userName}
                                        <p className="text-xs text-gray-500">{booking.userEmail}</p>
                                    </td>
                                    <td>{booking.carName}</td>
                                    <td>
                                        {formatDateTime(booking.pickupDate)} →{" "}
                                        {formatDateTime(booking.returnDate)}
                                    </td>
                                    <td>{booking.rentalDays}</td>
                                    <td>{formatMoney(booking.totalPrice, booking.currencyCode)}</td>
                                    <td>
                                        <StatusBadge status={booking.status} labels={BOOKING_STATUS_LABELS} />
                                    </td>
                                    <td className="p-4">
                                        <select
                                            disabled={
                                                busyId === booking.id || !(CAR_BOOKING_NEXT_STATUSES[booking.status] || []).length
                                            }
                                            value=""
                                            onChange={(e) => update(booking, e.target.value)}
                                            className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs"
                                        >
                                            <option value="">Change status…</option>
                                            {(CAR_BOOKING_NEXT_STATUSES[booking.status] || []).map((next) => (
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

/** Trang quản trị xe và đơn thuê xe. */
function AdminCars() {
    const [tab, setTab] = useState("fleet");
    const tabClass = (active) =>
        `px-4 py-2 text-sm font-bold border-b-2 ${active ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800"}`;
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">Cars</h1>
            <div className="flex gap-2 border-b border-gray-200">
                <button type="button" onClick={() => setTab("fleet")} className={tabClass(tab === "fleet")}>
                    Fleet
                </button>
                <button type="button" onClick={() => setTab("rentals")} className={tabClass(tab === "rentals")}>
                    Rentals
                </button>
            </div>
            {tab === "fleet" ? <FleetTab /> : <RentalsTab />}
        </div>
    );
}

export default AdminCars;
