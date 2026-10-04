import { useState } from "react";
import { Link } from "react-router-dom";
import FormAlert from "../common/FormAlert";
import { PAYMENT_METHODS } from "../../services/bookingService";
import { formatDate, formatDateTime, formatMoney, isoDateFromToday } from "../../utils/formatters";
import { useT } from "../../i18n/I18nContext";

const MAX_ROOMS = 5; // khớp CartServiceImpl.MAX_ROOMS_PER_ITEM
const HOTEL_PLACEHOLDER = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80";
const TRIP_PLACEHOLDER = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80";
const inputClass = "w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-sm outline-none focus:border-primary";

/**
 * Khung một nhóm trong giỏ (Khách sạn / Tour / Xe / Chuyến bay): tiêu đề, danh sách dòng,
 * chân nhóm có tổng tiền + phương thức thanh toán + nút thanh toán riêng (1 đơn cho mỗi nhóm).
 */
function GroupShell({ testId, icon, label, count, headerAction, selectedCount, total, currency, busy, disabled, onCheckout, note, error, children }) {
    const t = useT();
    const [method, setMethod] = useState(PAYMENT_METHODS[0].value);
    return (
        <section data-testid={testId} className="bg-surface-container-lowest rounded-2xl shadow-[0_8px_48px_rgba(27,28,28,0.06)] overflow-hidden">
            <header className="flex items-center gap-3 px-8 py-5 bg-surface-container-low">
                <span className="material-symbols-outlined text-primary">{icon}</span>
                <h2 className="font-headline text-xl font-bold text-on-surface">{label}</h2>
                <span className="text-sm text-on-surface-variant">({count})</span>
                {headerAction && <div className="ml-auto">{headerAction}</div>}
            </header>

            <ul className="divide-y divide-outline-variant/20">{children}</ul>

            <footer className="flex flex-col md:flex-row md:items-center gap-4 px-8 py-6 bg-surface-container-low/60">
                <div className="flex-1">
                    <p className="text-sm text-on-surface-variant">{t("booking.tripCart.selected", { selected: selectedCount, total: count })}</p>
                    <p className="text-2xl font-extrabold text-primary">{formatMoney(total, currency)}</p>
                    {note && <p className="text-xs text-on-surface-variant mt-1">{note}</p>}
                </div>
                <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="border border-outline-variant rounded-lg px-4 py-3 text-sm bg-surface-container-lowest"
                    aria-label={t("booking.tripCart.paymentMethodFor", { type: label })}
                >
                    {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                            {t(`common.paymentMethods.${m.value}`)}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    disabled={selectedCount === 0 || disabled}
                    onClick={() => onCheckout(method)}
                    className="primary-gradient text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50"
                >
                    {busy ? t("common.state.processing") : t("booking.tripCart.checkout", { type: label })}
                </button>
            </footer>
            {error && (
                <div className="px-8 pb-6">
                    <FormAlert>{error}</FormAlert>
                </div>
            )}
        </section>
    );
}

function HotelItemEditor({ item, onSave, onCancel }) {
    const t = useT();
    const [form, setForm] = useState({
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        quantity: item.quantity,
        adults: item.adults,
        children: item.children,
        specialRequests: item.specialRequests || "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = (name, numeric) => (e) => setForm((prev) => ({ ...prev, [name]: numeric ? Number(e.target.value) : e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.checkOut <= form.checkIn) {
            setError(t("booking.cart.validation.checkOutAfterCheckIn"));
            return;
        }
        if (form.adults < form.quantity) {
            setError(t("booking.cart.validation.adultPerRoom"));
            return;
        }
        setSaving(true);
        setError("");
        try {
            await onSave({ ...form, specialRequests: form.specialRequests.trim() || undefined });
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 bg-surface-container-low rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <label className="text-xs font-bold text-on-surface-variant">
                    {t("common.fields.checkIn")}
                    <input type="date" required min={isoDateFromToday(0)} value={form.checkIn} onChange={set("checkIn")} className={`${inputClass} mt-1`} />
                </label>
                <label className="text-xs font-bold text-on-surface-variant">
                    {t("common.fields.checkOut")}
                    <input type="date" required min={form.checkIn} value={form.checkOut} onChange={set("checkOut")} className={`${inputClass} mt-1`} />
                </label>
                <label className="text-xs font-bold text-on-surface-variant">
                    {t("common.units.room", { count: 2 })}
                    <select value={form.quantity} onChange={set("quantity", true)} className={`${inputClass} mt-1`}>
                        {Array.from({ length: MAX_ROOMS }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-bold text-on-surface-variant">
                    {t("booking.cart.adultsTotal")}
                    <input type="number" min={1} max={20} value={form.adults} onChange={set("adults", true)} className={`${inputClass} mt-1`} />
                </label>
                <label className="text-xs font-bold text-on-surface-variant">
                    {t("booking.cart.childrenTotal")}
                    <input type="number" min={0} max={20} value={form.children} onChange={set("children", true)} className={`${inputClass} mt-1`} />
                </label>
                <label className="col-span-2 md:col-span-5 text-xs font-bold text-on-surface-variant">
                    {t("booking.detail.specialRequests")}
                    <input maxLength={1000} value={form.specialRequests} onChange={set("specialRequests")} className={`${inputClass} mt-1`} />
                </label>
            </div>
            <FormAlert>{error}</FormAlert>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant">{t("common.actions.cancel")}</button>
                <button type="submit" disabled={saving} className="bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                    {saving ? t("common.state.saving") : t("common.actions.save")}
                </button>
            </div>
        </form>
    );
}

/**
 * Nhóm khách sạn: sửa ngày / số phòng / số khách từng dòng, xoá, xoá hết, thanh toán các dòng đã chọn.
 * `api` = { update(itemId, body), remove(itemId), clear(), checkout(method, itemIds) }; update/remove trả CartDTO mới.
 */
export function HotelCartGroup({ cart, api, onCartChange, onCheckedOut, busy, disabled }) {
    const t = useT();
    const [editingId, setEditingId] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [deselected, setDeselected] = useState([]);
    const [error, setError] = useState("");
    const currency = cart.currencyCode || "USD";
    const issueLabels = {
        expired: t("booking.cart.issues.expired"),
        inactive: t("booking.cart.issues.inactive"),
        unavailable: t("booking.cart.issues.unavailable"),
    };
    const items = cart.items;
    const selected = items.filter((i) => !i.issue && !deselected.includes(i.id));
    const total = selected.reduce((sum, i) => sum + Number(i.totalPrice), 0);
    const label = t("booking.cart.types.hotel");

    const toggle = (id) => setDeselected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const handleRemove = async (item) => {
        setBusyId(item.id);
        setError("");
        try {
            onCartChange(await api.remove(item.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleClear = async () => {
        if (!window.confirm(t("booking.cart.clearHotelsConfirm"))) return;
        setError("");
        try {
            onCartChange(await api.clear());
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCheckout = async (method) => {
        setError("");
        try {
            await onCheckedOut(await api.checkout(method, selected.map((i) => i.id)));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <GroupShell
            testId="cart-hotel"
            icon="hotel"
            label={label}
            count={items.length}
            headerAction={
                <button type="button" onClick={handleClear} className="text-sm font-bold text-on-surface-variant hover:text-error">
                    {t("booking.cart.clearHotels")}
                </button>
            }
            selectedCount={selected.length}
            total={total}
            currency={currency}
            busy={busy}
            disabled={disabled}
            onCheckout={handleCheckout}
            note={t("booking.cart.checkoutPolicy")}
            error={error}
        >
            {items.map((item) => (
                <li key={item.id} className="px-8 py-6">
                    <div className="flex flex-col md:flex-row gap-5">
                        <label className="flex items-start gap-4 flex-1 min-w-0 cursor-pointer">
                            <input
                                type="checkbox"
                                className="mt-2 w-5 h-5 accent-primary"
                                aria-label={t("booking.cart.selectRoom", { room: item.roomTypeName })}
                                disabled={!!item.issue}
                                checked={!item.issue && !deselected.includes(item.id)}
                                onChange={() => toggle(item.id)}
                            />
                            <img
                                src={item.hotelCoverImageUrl || HOTEL_PLACEHOLDER}
                                alt={item.hotelName || t("booking.checkout.hotelFallback")}
                                className="w-28 h-20 rounded-lg object-cover bg-surface-container-low shrink-0"
                                loading="lazy"
                            />
                            <div className="min-w-0">
                                <Link to={`/hotel/${item.hotelId}`} className="font-bold text-on-surface hover:text-primary">{item.hotelName}</Link>
                                <p className="text-sm text-on-surface-variant mt-1">
                                    {item.roomTypeName} · {t("common.units.room", { count: item.quantity })}
                                </p>
                                <p className="text-sm text-on-surface-variant">
                                    {item.children
                                        ? t("booking.cart.itemSummaryWithChildren", { checkIn: formatDate(item.checkIn), checkOut: formatDate(item.checkOut), nights: t("common.units.night", { count: item.nights }), adults: t("common.units.adult", { count: item.adults }), children: t("common.units.child", { count: item.children }) })
                                        : t("booking.cart.itemSummary", { checkIn: formatDate(item.checkIn), checkOut: formatDate(item.checkOut), nights: t("common.units.night", { count: item.nights }), adults: t("common.units.adult", { count: item.adults }) })}
                                </p>
                                {item.specialRequests && <p className="text-xs text-on-surface-variant mt-1">“{item.specialRequests}”</p>}
                                {item.issue && (
                                    <p className="text-xs text-error font-semibold mt-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">error</span>
                                        {issueLabels[item.issue]}
                                        {item.issue === "unavailable" && item.availableRooms != null ? t("booking.cart.roomsRemaining", { count: item.availableRooms }) : ""}
                                    </p>
                                )}
                                {!item.issue && item.priceChanged && (
                                    <p className="text-xs text-amber-700 font-semibold mt-2">
                                        {t("booking.cart.priceChanged", { price: formatMoney(Number(item.snapshotUnitPrice) * item.quantity, currency) })}
                                    </p>
                                )}
                            </div>
                        </label>
                        <div className="flex md:flex-col items-center md:items-end justify-between gap-2 md:w-48 shrink-0">
                            <p className="text-lg font-extrabold text-on-surface">{formatMoney(item.totalPrice, currency)}</p>
                            <div className="flex gap-3 text-sm">
                                {editingId !== item.id && (
                                    <button type="button" onClick={() => setEditingId(item.id)} className="flex items-center gap-1 text-primary hover:underline">
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                        {t("common.actions.edit")}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    disabled={busyId === item.id}
                                    onClick={() => handleRemove(item)}
                                    className="flex items-center gap-1 text-error hover:underline disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                    {t("common.actions.remove")}
                                </button>
                            </div>
                        </div>
                    </div>
                    {editingId === item.id && (
                        <HotelItemEditor
                            item={item}
                            onCancel={() => setEditingId(null)}
                            onSave={async (body) => {
                                onCartChange(await api.update(item.id, body));
                                setEditingId(null);
                            }}
                        />
                    )}
                </li>
            ))}
        </GroupShell>
    );
}

/**
 * Nhóm tour / xe / chuyến bay. `group` = { key, icon, label, items }; `api` = { remove(itemId), checkout(type, method, itemIds) }.
 * onChanged() sau khi xoá dòng / thanh toán lỗi (giá, chỗ trống có thể đã đổi → tải lại).
 */
export function TripCartGroup({ group, api, onChanged, onCheckedOut, busy, disabled }) {
    const t = useT();
    const [unchecked, setUnchecked] = useState(() => new Set());
    const [error, setError] = useState("");
    const isSelected = (item) => !item.issue && !unchecked.has(item.id);
    const selected = group.items.filter(isSelected);
    const total = selected.reduce((sum, i) => sum + Number(i.currentPrice ?? 0), 0);

    const toggle = (id) =>
        setUnchecked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const handleRemove = async (id) => {
        setError("");
        try {
            await api.remove(id);
            onChanged();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCheckout = async (method) => {
        setError("");
        try {
            await onCheckedOut(await api.checkout(group.key, method, selected.map((i) => i.id)));
        } catch (err) {
            setError(err.details?.length ? err.details.join(" · ") : err.message);
            onChanged();
        }
    };

    return (
        <GroupShell
            testId={`cart-${group.key}`}
            icon={group.icon}
            label={group.label}
            count={group.items.length}
            selectedCount={selected.length}
            total={total}
            busy={busy}
            disabled={disabled}
            onCheckout={handleCheckout}
            error={error}
        >
            {group.items.map((item) => (
                <li key={item.id} className="flex flex-col md:flex-row gap-5 px-8 py-6">
                    <label className="flex items-start gap-4 flex-1 min-w-0 cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-2 w-5 h-5 accent-primary"
                            checked={isSelected(item)}
                            disabled={Boolean(item.issue)}
                            onChange={() => toggle(item.id)}
                            aria-label={t("booking.tripCart.selectItem", { item: item.title })}
                        />
                        <img
                            src={item.imageUrl || TRIP_PLACEHOLDER}
                            alt={item.title}
                            className="w-28 h-20 rounded-lg object-cover bg-surface-container-low shrink-0"
                            loading="lazy"
                        />
                        <div className="min-w-0">
                            <p className="font-bold text-on-surface truncate">{item.title}</p>
                            {item.subtitle && <p className="text-sm text-on-surface-variant mt-1">{item.subtitle}</p>}
                            <p className="text-xs text-on-surface-variant mt-1">{t("booking.tripCart.added", { date: formatDateTime(item.addedAt) })}</p>
                            {item.issue && (
                                <p className="text-xs text-error font-semibold mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">error</span>
                                    {item.issue}
                                </p>
                            )}
                        </div>
                    </label>
                    <div className="flex md:flex-col items-center md:items-end justify-between gap-2 md:w-48 shrink-0">
                        <div className="text-right">
                            {item.currentPrice != null && <p className="text-lg font-extrabold text-on-surface">{formatMoney(item.currentPrice)}</p>}
                            {item.priceChanged && (
                                <p className="text-xs text-amber-700 font-semibold">
                                    {t("booking.tripCart.was")} <span className="line-through">{formatMoney(item.addedPrice)}</span>
                                </p>
                            )}
                        </div>
                        <button type="button" onClick={() => handleRemove(item.id)} className="flex items-center gap-1 text-sm text-error hover:underline">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            {t("common.actions.remove")}
                        </button>
                    </div>
                </li>
            ))}
        </GroupShell>
    );
}
