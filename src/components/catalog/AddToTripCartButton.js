import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { addTripCartItem } from "../../services/tripCartService";
import { useT } from "../../i18n/I18nContext";

/**
 * Nút phụ "Add to trip cart" đặt dưới nút đặt ngay trong BookingSummaryCard.
 * `build()` trả body đặt chỗ (không cần paymentMethod) hoặc ném Error(message) nếu form chưa hợp lệ.
 */
function AddToTripCartButton({ itemType, build, disabled }) {
    const t = useT();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [added, setAdded] = useState(false);

    const handleClick = async () => {
        if (!isLoggedIn) {
            navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
            return;
        }
        setError("");
        setAdded(false);
        let booking;
        try {
            booking = build();
        } catch (err) {
            setError(err.message);
            return;
        }
        setBusy(true);
        try {
            await addTripCartItem(itemType, booking);
            setAdded(true);
        } catch (err) {
            setError(err.details?.length ? err.details.join(" · ") : err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={handleClick}
                disabled={disabled || busy}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-primary text-primary font-bold hover:bg-primary-fixed/30 disabled:opacity-50"
            >
                <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                {busy ? t("catalog.tripCart.adding") : t("catalog.tripCart.add")}
            </button>
            {added && (
                <p className="text-xs text-green-700 font-bold text-center">
                    {t("catalog.tripCart.added")} {" "}
                    <Link to="/cart" className="underline">
                        {t("catalog.tripCart.viewCart")}
                    </Link>
                </p>
            )}
            {error && <p className="text-xs text-error font-semibold text-center">{error}</p>}
        </div>
    );
}

export default AddToTripCartButton;
