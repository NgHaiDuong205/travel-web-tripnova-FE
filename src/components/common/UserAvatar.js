/** Ảnh đại diện; không có ảnh thì hiện chữ cái đầu của tên (không gọi dịch vụ ngoài). */
function UserAvatar({ user, size = "w-10 h-10", textSize = "text-sm", rounded = "rounded-lg" }) {
    if (user?.avatarUrl) {
        return <img src={user.avatarUrl} alt={user.fullName || "Avatar"} className={`${size} ${rounded} object-cover`} />;
    }
    const initials =
        (user?.fullName || user?.email || "?")
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "?";
    return (
        <div className={`${size} ${rounded} bg-primary-container text-white font-bold flex items-center justify-center ${textSize}`}>
            {initials}
        </div>
    );
}

export default UserAvatar;
