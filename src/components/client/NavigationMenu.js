import { NavLink } from "react-router-dom";

function NavigationMenu() {
    const menuItems = [
        { path: "/", label: "Home" },
        { path: "/hotels", label: "Hotels" },
        { path: "/cars", label: "Car Rentals" },
        { path: "/flights", label: "Flights" },
        { path: "/tours", label: "Tours" },
        { path: "/destinations", label: "Destinations" },
        { path: "/search", label: "Search" },
        { path: "/abouts", label: "About" },
        { path: "/contacts", label: "Contact" },
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