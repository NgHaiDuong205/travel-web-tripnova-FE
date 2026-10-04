import { useState } from "react";
import ContinentsTab from "./ContinentsTab";
import CountriesTab from "./CountriesTab";
import DestinationsTab from "./DestinationsTab";
import LandmarksTab from "./LandmarksTab";
import { useT } from "../../../i18n/I18nContext";

const TABS = [
    { key: "continents", labelKey: "admin.geography.continents", Component: ContinentsTab },
    { key: "countries", labelKey: "admin.geography.countries", Component: CountriesTab },
    { key: "destinations", labelKey: "admin.geography.destinations", Component: DestinationsTab },
    { key: "landmarks", labelKey: "admin.geography.landmarks", Component: LandmarksTab },
];

/** Quản trị châu lục / quốc gia / điểm đến / địa danh. */
function AdminGeography() {
    const t = useT();
    const [tab, setTab] = useState("destinations");
    const { Component } = TABS.find((item) => item.key === tab);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">{t("admin.geography.title")}</h1>
            <div className="flex flex-wrap gap-2">
                {TABS.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => setTab(item.key)}
                        className={`px-4 py-2 rounded-full text-sm font-bold ${
                            tab === item.key ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600"
                        }`}
                    >
                        {t(item.labelKey)}
                    </button>
                ))}
            </div>
            <Component />
        </div>
    );
}

export default AdminGeography;
