import { useState } from "react";
import ContinentsTab from "./ContinentsTab";
import CountriesTab from "./CountriesTab";
import DestinationsTab from "./DestinationsTab";
import LandmarksTab from "./LandmarksTab";

const TABS = [
    { key: "continents", label: "Continents", Component: ContinentsTab },
    { key: "countries", label: "Countries", Component: CountriesTab },
    { key: "destinations", label: "Destinations", Component: DestinationsTab },
    { key: "landmarks", label: "Landmarks", Component: LandmarksTab },
];

/** Quản trị châu lục / quốc gia / điểm đến / địa danh. */
function AdminGeography() {
    const [tab, setTab] = useState("destinations");
    const { Component } = TABS.find((t) => t.key === tab);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">Geography</h1>
            <div className="flex flex-wrap gap-2">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 rounded-full text-sm font-bold ${
                            tab === t.key ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <Component />
        </div>
    );
}

export default AdminGeography;
