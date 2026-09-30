import AdminLayout from "./AdminLayout";

const MANAGER_NAV = [
    { to: "/manager", label: "Dashboard", icon: "monitoring", end: true },
    { to: "/manager/hotels", label: "My Hotels", icon: "apartment" },
    { to: "/manager/account", label: "Account", icon: "manage_accounts" },
];

/** Khung trang quản lý khách sạn (role HOTEL_MANAGER) — cùng giao diện với trang admin, không có lối ra site khách. */
function ManagerLayout() {
    return <AdminLayout navItems={MANAGER_NAV} badge="HOTEL" home="/manager" siteLink={false} />;
}

export default ManagerLayout;
