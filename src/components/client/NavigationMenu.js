import { NavLink } from "react-router-dom";
import { useT } from "../../i18n/I18nContext";

function NavigationMenu() {
    const t = useT();
    const menuItems = [
        { path: "/", label: t("nav.home") },
        { path: "/hotels", label: t("nav.hotels") },
        { path: "/cars", label: t("nav.cars") },
        { path: "/flights", label: t("nav.flights") },
        { path: "/tours", label: t("nav.tours") },
        { path: "/destinations", label: t("nav.destinations") },
        { path: "/ai-planner", label: t("nav.aiPlanner") },
        { path: "/abouts", label: t("nav.about") },
        { path: "/contacts", label: t("nav.contact") },
    ];

    return (
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {menuItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                        relative font-bold tracking-tight pb-1 transition-colors group
                        after:content-[''] after:absolute after:left-0 after:bottom-0 
                        after:h-[2px] after:bg-[#003580] after:transition-all after:duration-300
                        ${isActive 
                            ? "text-[#003580] after:w-full" 
                            : "text-[#434651] hover:text-[#003580] after:w-0 group-hover:after:w-full"
                        }
                    `}
                >
                    {item.label}
                </NavLink>
            ))}
        </div>
    );
}

export default NavigationMenu;