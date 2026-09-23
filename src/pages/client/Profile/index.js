import { Link } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";

function Profile() {
    return (
        <DashboardLayout>
            {/* Welcome Header Section */}
            <section className="mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-3 block">Member Overview</span>
                        <h1 className="text-4xl lg:text-5xl font-headline font-extrabold text-on-surface tracking-tight leading-tight">
                            Welcome back, <br/>Alex Morgan
                        </h1>
                    </div>
                    <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-8 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-xs text-on-surface-variant font-medium">NEXT ADVENTURE</span>
                            <span className="text-primary font-bold">Amalfi Coast, Italy</span>
                        </div>
                        <div className="w-px h-10 bg-outline-variant/30"></div>
                        <div className="flex flex-col">
                            <span className="text-xs text-on-surface-variant font-medium">DAYS UNTIL</span>
                            <span className="text-primary font-bold">12 Days</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bento Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Active Bookings */}
                <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between group hover:bg-primary transition-colors duration-300">
                    <div>
                        <span className="material-symbols-outlined text-primary group-hover:text-white mb-4" style={{fontSize: "32px"}}>travel_explore</span>
                        <h4 className="text-on-surface-variant group-hover:text-white/80 text-sm font-medium mb-1">Active Bookings</h4>
                        <p className="text-3xl font-headline font-bold text-on-surface group-hover:text-white">03</p>
                    </div>
                    <div className="mt-6">
                        <span className="text-xs text-secondary group-hover:text-secondary-fixed font-bold flex items-center gap-1 cursor-pointer">
                            VIEW DETAILS <span className="material-symbols-outlined text-xs">chevron_right</span>
                        </span>
                    </div>
                </div>

                {/* Reward Points */}
                <div className="bg-tertiary-fixed p-8 rounded-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10">
                        <span className="material-symbols-outlined text-[120px]">workspace_premium</span>
                    </div>
                    <div>
                        <span className="material-symbols-outlined text-on-tertiary-fixed mb-4" style={{fontSize: "32px", fontVariationSettings: "'FILL' 1"}}>stars</span>
                        <h4 className="text-on-tertiary-fixed-variant text-sm font-medium mb-1 uppercase tracking-wider">Gold Status</h4>
                        <p className="text-3xl font-headline font-bold text-on-tertiary-fixed">42,850 pts</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                        <span className="text-xs font-bold text-on-tertiary-fixed-variant">80% TO PLATINUM</span>
                        <div className="w-24 h-1.5 bg-on-tertiary-fixed-variant/20 rounded-full overflow-hidden">
                            <div className="w-4/5 h-full bg-on-tertiary-fixed"></div>
                        </div>
                    </div>
                </div>

                {/* Total Distance */}
                <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between border-l-4 border-primary">
                    <div>
                        <span className="material-symbols-outlined text-primary mb-4" style={{fontSize: "32px"}}>flight_takeoff</span>
                        <h4 className="text-on-surface-variant text-sm font-medium mb-1">Total Distance</h4>
                        <p className="text-3xl font-headline font-bold text-on-surface">124,500 <span className="text-base font-normal">km</span></p>
                    </div>
                    <div className="mt-6">
                        <p className="text-xs text-on-surface-variant">Equivalent to <span className="font-bold text-on-surface">3.1x around Earth</span></p>
                    </div>
                </div>
            </section>

            {/* Table and Actions Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
                {/* Recent Bookings Table Section */}
                <section className="xl:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-headline font-bold text-on-surface">Recent Bookings</h3>
                        <Link to="/booking-history" className="text-sm font-bold text-secondary hover:underline transition-all">View All History</Link>
                    </div>
                    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-surface-container-low/50">
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Property / Flight</th>
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                <tr>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-sm">hotel</span>
                                            </div>
                                            <Link to="/hotel/1" className="text-sm font-bold text-on-surface hover:text-primary transition-colors">Palazzo Avino, Ravello</Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-on-surface-variant">Oct 12 - 18, 2023</td>
                                    <td className="px-6 py-5">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700">Confirmed</span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-on-surface text-right">$4,820.00</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-sm">flight</span>
                                            </div>
                                            <span className="text-sm font-bold text-on-surface">Emirates (DXB - LHR)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-on-surface-variant">Sep 04, 2023</td>
                                    <td className="px-6 py-5">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface-container-highest text-on-surface-variant">Completed</span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-on-surface text-right">$8,240.00</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-sm">hotel</span>
                                            </div>
                                            <span className="text-sm font-bold text-on-surface">Six Senses Laamu</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-on-surface-variant">Aug 15 - 22, 2023</td>
                                    <td className="px-6 py-5">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface-container-highest text-on-surface-variant">Completed</span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-on-surface text-right">$12,400.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Quick Actions Section */}
                <section className="xl:col-span-1">
                    <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Concierge Desk</h3>
                    <div className="space-y-4">
                        <div className="bg-primary-container p-6 rounded-xl text-white relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
                            <div className="relative z-10">
                                <span className="material-symbols-outlined mb-4 opacity-80">auto_awesome</span>
                                <h4 className="font-bold text-lg leading-tight mb-1">Book New Experience</h4>
                                <p className="text-xs text-on-primary-container leading-relaxed">Let us curate your next luxury getaway with exclusive benefits.</p>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-20">
                                <span className="material-symbols-outlined text-[100px]">map</span>
                            </div>
                        </div>

                        <button className="w-full bg-surface-container-lowest p-5 rounded-xl flex items-center gap-4 hover:bg-surface-container-low transition-colors shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                                <span className="material-symbols-outlined">description</span>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-on-surface">Download Invoice</p>
                                <p className="text-[11px] text-on-surface-variant">Last transaction (Oct 12)</p>
                            </div>
                            <span className="material-symbols-outlined ml-auto text-on-surface-variant">download</span>
                        </button>

                        <button className="w-full bg-surface-container-lowest p-5 rounded-xl flex items-center gap-4 hover:bg-surface-container-low transition-colors shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                                <span className="material-symbols-outlined">support_agent</span>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-on-surface">Contact Concierge</p>
                                <p className="text-[11px] text-on-surface-variant">24/7 Priority Support</p>
                            </div>
                            <span className="material-symbols-outlined ml-auto text-on-surface-variant">chat_bubble</span>
                        </button>

                        <div className="mt-8 p-6 bg-surface-container-low rounded-xl border-t-2 border-primary">
                            <h5 className="text-xs font-bold text-primary mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">info</span>
                                TRAVEL ADVISORY
                            </h5>
                            <p className="text-xs leading-relaxed text-on-surface-variant">
                                Italy requires a digital passenger locator form. Please ensure yours is completed 48 hours before departure.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Spacer */}
            <div className="h-24"></div>
        </DashboardLayout>
    );
}

export default Profile;
