import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { addFavorite, checkFavorite, removeFavorite } from "../../services/favoriteService";

/**
 * Nút tim lưu/bỏ lưu yêu thích. Chưa đăng nhập -> chuyển sang trang Login.
 * `onChange(favorited)` được gọi sau khi đổi trạng thái thành công.
 */
function FavoriteButton({ itemType = "hotel", itemId, className = "", onChange }) {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [favoriteId, setFavoriteId] = useState(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!isLoggedIn || !itemId) {
            setFavoriteId(null);
            return;
        }
        let cancelled = false;
        checkFavorite(itemType, itemId)
            .then((res) => !cancelled && setFavoriteId(res.favoriteId))
            .catch(() => null);
        return () => {
            cancelled = true;
        };
    }, [isLoggedIn, itemType, itemId]);

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
                setFavoriteId(null);
                onChange?.(false);
            } else {
                const created = await addFavorite(itemType, itemId);
                setFavoriteId(created.id);
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
            aria-label={favorited ? "Remove from saved" : "Save to favorites"}
            title={favorited ? "Remove from saved" : "Save to favorites"}
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
