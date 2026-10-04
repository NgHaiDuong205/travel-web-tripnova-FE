import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    addFavorite,
    getFavoriteId,
    loadFavoriteIds,
    removeFavorite,
    subscribeFavorites,
} from "../../services/favoriteService";
import { useT } from "../../i18n/I18nContext";

/**
 * Nút tim lưu/bỏ lưu yêu thích. Chưa đăng nhập -> chuyển sang trang Login.
 * `onChange(favorited)` được gọi sau khi đổi trạng thái thành công.
 */
function FavoriteButton({ itemType = "hotel", itemId, className = "", onChange }) {
    const t = useT();
    const { isLoggedIn, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [busy, setBusy] = useState(false);
    // Trạng thái lấy từ kho chung (1 request cho cả trang), không gọi /check/ từng nút.
    const storedId = useSyncExternalStore(subscribeFavorites, () => getFavoriteId(itemType, itemId));
    const favoriteId = isLoggedIn && itemId ? storedId : null;

    useEffect(() => {
        if (isLoggedIn && user?.id) loadFavoriteIds(user.id);
    }, [isLoggedIn, user?.id]);

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
            return;
        }
        if (busy) return;
        setBusy(true);
        try {
            if (favoriteId) {
                await removeFavorite(favoriteId);
                onChange?.(false);
            } else {
                await addFavorite(itemType, itemId);
                onChange?.(true);
            }
        } catch {
            /* giữ nguyên trạng thái nếu lỗi */
        } finally {
            setBusy(false);
        }
    };

    const favorited = !!favoriteId;
    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={busy}
            aria-pressed={favorited}
            aria-label={favorited ? t("trips.favorite.removeFromSaved") : t("trips.favorite.saveToFavorites")}
            title={favorited ? t("trips.favorite.removeFromSaved") : t("trips.favorite.saveToFavorites")}
            className={`w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center transition-transform hover:scale-110 disabled:opacity-60 ${className}`}
        >
            <span
                className={`material-symbols-outlined text-[22px] ${favorited ? "text-red-500" : "text-gray-600"}`}
                style={favorited ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
                favorite
            </span>
        </button>
    );
}

export default FavoriteButton;
