import { Link } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";

function BookingHistory() {
    return (
        <DashboardLayout>
            {/* Header & Editorial Breadcrumb */}
            <section className="mb-10">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="label-md uppercase tracking-[0.15em] text-[10px] font-bold text-primary-container mb-2 block">Member Dashboard</span>
                        <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface font-headline">Booking History</h2>
                    </div>
                    <div className="flex space-x-3">
                        <button className="px-5 py-2.5 bg-surface-container-lowest text-on-surface text-sm font-semibold rounded-lg flex items-center space-x-2 shadow-sm border border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                            <span className="material-symbols-outlined text-lg">file_download</span>
                            <span>Export All</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Filters Section - Bento Style */}
            <section className="grid grid-cols-12 gap-6 mb-12">
                {/* Search & Primary Filter */}
                <div className="col-span-8 bg-surface-container-low p-6 rounded-xl flex items-center space-x-8">
                    <div className="flex flex-col">
                        <span className="label-md uppercase text-[9px] font-bold text-on-surface-variant mb-2">Filter by service</span>
                        <div className="flex space-x-2">
                            <button className="px-4 py-1.5 bg-primary text-white rounded-full text-xs font-bold">All Services</button>
                            <button className="px-4 py-1.5 bg-surface-container-lowest text-on-surface-variant rounded-full text-xs font-medium hover:bg-white transition-colors">Hotels</button>
                            <button className="px-4 py-1.5 bg-surface-container-lowest text-on-surface-variant rounded-full text-xs font-medium hover:bg-white transition-colors">Flights</button>
                            <button className="px-4 py-1.5 bg-surface-container-lowest text-on-surface-variant rounded-full text-xs font-medium hover:bg-white transition-colors">Car Rentals</button>
                        </div>
                    </div>
                    <div className="h-10 w-[1px] bg-outline-variant/40"></div>
                    <div className="flex flex-col">
                        <span className="label-md uppercase text-[9px] font-bold text-on-surface-variant mb-2">Status</span>
                        <select className="bg-surface-container-lowest border-none text-xs font-bold rounded-lg focus:ring-0 cursor-pointer pr-8">
                            <option>Any Status</option>
                            <option>Upcoming</option>
                            <option>Completed</option>
                            <option>Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Stats Bento Card */}
                <div className="col-span-4 bg-primary text-white p-6 rounded-xl relative overflow-hidden flex items-center">
                    <div className="z-10">
                        <p className="text-[10px] font-bold tracking-widest uppercase opacity-70 mb-1">Total Trips</p>
                        <h3 className="text-3xl font-black font-headline">24</h3>
                    </div>
                    <div className="ml-auto z-10 text-right">
                        <p className="text-[10px] font-bold tracking-widest uppercase opacity-70 mb-1">Total Spent</p>
                        <h3 className="text-xl font-bold font-headline">$12,450</h3>
                    </div>
                    {/* Abstract Texture */}
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-container rounded-full blur-3xl opacity-50"></div>
                </div>
            </section>

            {/* Booking List (The "Traveler's Slate") */}
            <section className="space-y-6">
                {/* Booking Card 1 */}
                <div className="group bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between transition-all hover:shadow-[0_8px_32px_rgba(27,28,28,0.06)]">
                    <div className="flex items-center space-x-6 flex-1">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-container-high relative">
                            <img className="w-full h-full object-cover" alt="luxury boutique hotel facade" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAu_xozJsrTqEnjLZP56AcWUBZVMuBwVLM6ly7py0yYS1cB0hUdWADayI3jLeQ_eaEXxOIhPzy_j9XwBGHgAcFuqz82RKHkhKtunWlR0cexEVsOtgigIN7l4jYXVB5EqOoIQLxf6NYJ4odG6UGxr6bS6l62yWyxq4TMVeCdIE5w5oehJRlP1HTA2tQZ9L2LbgdyhKMN7CZGaMtiN62NPCHNP64soFV-x1Sss3sWHbhN4Iw_px6Y_-0unjE5z2JCxcPfyAJeIOCdeYI"/>
                            <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-md flex items-center space-x-1">
                                <span className="material-symbols-outlined text-xs text-primary">hotel</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="label-md uppercase tracking-wider text-[9px] font-black text-on-surface-variant">Stay • Singapore</span>
                                <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                                <span className="text-[10px] font-bold text-on-tertiary-container">PREMIUM ROOM</span>
                            </div>
                            <h4 className="text-xl font-bold text-on-surface font-headline group-hover:text-primary transition-colors">The Grand Majestic</h4>
                            <div className="flex items-center space-x-4 mt-2 text-on-surface-variant text-sm font-medium">
                                <div className="flex items-center space-x-1.5">
                                    <span className="material-symbols-outlined text-base">calendar_today</span>
                                    <span>Oct 12 - Oct 15, 2023</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <span className="material-symbols-outlined text-base">person</span>
                                    <span>2 Adults</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-12 px-8">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">Upcoming</span>
                        </div>
                        <div className="text-right w-24">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total</p>
                            <p className="text-lg font-extrabold text-on-surface">$1,420</p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <Link to="/hotel/1" className="px-4 py-2 bg-surface-container-low text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all text-center">View Details</Link>
                        <button className="px-4 py-2 text-on-surface-variant text-[10px] font-bold flex items-center justify-center space-x-1 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-sm">receipt</span>
                            <span>Invoice</span>
                        </button>
                    </div>
                </div>

                {/* Booking Card 2 */}
                <div className="group bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between transition-all hover:shadow-[0_8px_32px_rgba(27,28,28,0.06)]">
                    <div className="flex items-center space-x-6 flex-1">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-container-high relative">
                            <img className="w-full h-full object-cover" alt="commercial airplane flying" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC6bM6Wq0bimC-oxMk51V0SkyofC4HqiB0PjuW5fCRfxb1AAXbKqNTMfx0ikZ-pM3olivd2OOijBT_RO7G7OoYIwOlrdh2wheVUSk-7HS04DgYT9HDmTd_K7mKUXycUcNi63I7S_5zWSSAb_9QJb800BI4wER2fVW4l04FkYMDGV4bLMJFTvPMuDx1nYLE5tFZ2efcueojnssbezZN8uQq9OqyilZdkTJySfW4agZzvViAQVHaEr47gqLpCdbt3X7-TiNmtly4LDk"/>
                            <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-md flex items-center space-x-1">
                                <span className="material-symbols-outlined text-xs text-primary">flight</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="label-md uppercase tracking-wider text-[9px] font-black text-on-surface-variant">Flight • SQ-452</span>
                                <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                                <span className="text-[10px] font-bold text-primary">BUSINESS CLASS</span>
                            </div>
                            <h4 className="text-xl font-bold text-on-surface font-headline group-hover:text-primary transition-colors">London (LHR) to Tokyo (HND)</h4>
                            <div className="flex items-center space-x-4 mt-2 text-on-surface-variant text-sm font-medium">
                                <div className="flex items-center space-x-1.5">
                                    <span className="material-symbols-outlined text-base">schedule</span>
                                    <span>Sep 28, 2023 • 14:30</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <span className="material-symbols-outlined text-base">luggage</span>
                                    <span>30kg Included</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-12 px-8">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                            <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-[10px] font-black uppercase tracking-wider">Completed</span>
                        </div>
                        <div className="text-right w-24">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total</p>
                            <p className="text-lg font-extrabold text-on-surface">$4,890</p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <button className="px-4 py-2 bg-surface-container-low text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all">Review Trip</button>
                        <button className="px-4 py-2 text-on-surface-variant text-[10px] font-bold flex items-center justify-center space-x-1 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-sm">receipt</span>
                            <span>Invoice</span>
                        </button>
                    </div>
                </div>

                {/* Booking Card 3 */}
                <div className="group bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between transition-all hover:shadow-[0_8px_32px_rgba(27,28,28,0.06)] opacity-70">
                    <div className="flex items-center space-x-6 flex-1">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-container-high relative grayscale">
                            <img className="w-full h-full object-cover" alt="modern black SUV" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBgY7OhCH0sq7ughnHMFOy5v8CCb9GDeXlZDvbf9XNB7czOwlIRQJk81aT5_gj7wa6KkNpyhxlzfiwMziEbhRewn3HzPOApCZ69bK3vmxgo8kv-qm6y-Ms0RSLdtTsiAUTzdhyUGFAqLzKcF15XyS8EFW5j1_YE_QGLAABlJFRerWUDWbXnkeaAu4FpH0ClDQUHqK3yTIFWuY6wKyZCYsZYTF377UFX2BbC5czQ0SyB57sFPcykvM5EtEEVkLd30rCfpKyZfjvlwA"/>
                            <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-md flex items-center space-x-1">
                                <span className="material-symbols-outlined text-xs text-primary">directions_car</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="label-md uppercase tracking-wider text-[9px] font-black text-on-surface-variant">Car Rental • Milan</span>
                            </div>
                            <h4 className="text-xl font-bold text-on-surface font-headline">Audi Q8 or similar</h4>
                            <div className="flex items-center space-x-4 mt-2 text-on-surface-variant text-sm font-medium">
                                <div className="flex items-center space-x-1.5 line-through">
                                    <span className="material-symbols-outlined text-base">event_busy</span>
                                    <span>Aug 14 - Aug 18, 2023</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-12 px-8">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                            <span className="px-3 py-1 bg-error-container text-on-error-container rounded-full text-[10px] font-black uppercase tracking-wider">Cancelled</span>
                        </div>
                        <div className="text-right w-24">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Refunded</p>
                            <p className="text-lg font-extrabold text-on-surface">$320</p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <button className="px-4 py-2 bg-surface-container-low text-on-surface-variant text-xs font-bold rounded-lg hover:bg-outline-variant transition-all">Support</button>
                    </div>
                </div>
            </section>

            {/* Pagination / Load More Editorial Style */}
            <div className="mt-16 text-center">
                <button className="px-8 py-4 bg-surface-container-low text-primary font-bold text-sm rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm">
                    View Past Bookings
                </button>
                <p className="mt-4 text-xs font-medium text-on-surface-variant opacity-60">Showing 3 of 24 bookings from the last 12 months</p>
            </div>

            {/* Footer Spacer */}
            <div className="h-24"></div>
        </DashboardLayout>
    );
}

export default BookingHistory;
