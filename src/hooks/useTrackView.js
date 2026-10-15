import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { trackInteraction } from "../services/recommendationService";

/** Ghi 1 lượt xem trang chi tiết (chỉ khi đã đăng nhập) làm tín hiệu cho mục "Dành cho bạn". */
export default function useTrackView(entityType, entityId) {
    const { isLoggedIn } = useAuth();
    useEffect(() => {
        if (isLoggedIn && entityType && entityId) trackInteraction(entityType, entityId, "view");
    }, [isLoggedIn, entityType, entityId]);
}
