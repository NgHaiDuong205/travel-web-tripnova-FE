export const LANDMARK_CATEGORY_KEYS = ["beach", "temple", "museum", "park", "mountain", "market", "restaurant", "entertainment", "historical", "wellness", "sport", "other"];

/** Nhãn loại địa danh theo ngôn ngữ (loại lạ → giữ nguyên mã). */
export function categoryLabel(t, category) {
    return LANDMARK_CATEGORY_KEYS.includes(category) ? t(`destinations.live.landmarkCategories.${category}`) : category;
}

/** Đường dẫn trang chi tiết địa danh. */
export function landmarkPath(lm) {
    return `/destinations/${lm.destinationId}/landmarks/${lm.id}`;
}
