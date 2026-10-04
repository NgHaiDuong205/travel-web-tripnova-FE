import AdminLayout from "./AdminLayout";

const MANAGER_NAV = [
    { to: "/manager", labelKey: "manager.layout.dashboard", icon: "monitoring", end: true },
    { to: "/manager/hotels", labelKey: "manager.layout.myHotels", icon: "apartment" },
    { to: "/manager/account", labelKey: "manager.layout.account", icon: "manage_accounts" },
];

/** Khung trang quản lý khách sạn (role HOTEL_MANAGER) — cùng giao diện với trang admin, không có lối ra site khách. */
function ManagerLayout() {
    return <AdminLayout navItems={MANAGER_NAV} badge="HOTEL" home="/manager" siteLink={false} />;
}

export default ManagerLayout;
