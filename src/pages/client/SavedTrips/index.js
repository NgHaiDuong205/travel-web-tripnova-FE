import { Link } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";

function SavedTrips() {
    return (
        <DashboardLayout>
            {/* Hero / Title Section */}
            <section className="mb-12 flex items-end justify-between">
                <div className="max-w-2xl">
                    <span className="font-label text-[0.75rem] uppercase tracking-[0.2em] text-on-tertiary-fixed-variant mb-2 block">Curated Collection</span>
                    <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-4">Saved Trips</h1>
                    <p className="text-on-surface-variant text-lg leading-relaxed font-body">Your personal gallery of future escapes. Transform your inspiration into a detailed itinerary.</p>
                </div>
                <button className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-6 py-3 rounded-xl font-bold shadow-[0_8px_48px_rgba(27,28,28,0.06)] hover:brightness-105 transition-all">
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                    Create Trip Plan
                </button>
            </section>

            {/* Filters Section */}
            <div className="bg-surface-container-low rounded-xl p-2 mb-10 flex items-center justify-between">
                <div className="flex gap-2">
                    <button className="bg-surface-container-lowest text-primary font-bold px-6 py-2.5 rounded-lg text-sm shadow-sm transition-all">All Saved</button>
                    <button className="text-on-surface-variant font-medium px-6 py-2.5 rounded-lg text-sm hover:bg-surface-container transition-all">Stays</button>
                    <button className="text-on-surface-variant font-medium px-6 py-2.5 rounded-lg text-sm hover:bg-surface-container transition-all">Flights</button>
                    <button className="text-on-surface-variant font-medium px-6 py-2.5 rounded-lg text-sm hover:bg-surface-container transition-all">Destinations</button>
                </div>
                <div className="flex gap-4 px-4 border-l border-outline-variant/20">
                    <button className="flex items-center gap-2 text-on-surface-variant text-sm font-semibold hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-lg">sort</span>
                        Sort by Date
                    </button>
                </div>
            </div>

            {/* Editorial Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {/* Card 1: Destination - Santorini */}
                <div className="group">
                    <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_8px_48px_rgba(27,28,28,0.06)] transition-transform duration-500 hover:-translate-y-2">
                        <div className="aspect-[4/5] overflow-hidden">
                            <img alt="Santorini Oia" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAT8v77Rg_Pk4ftdVf-57sD3jTAcqKt8k9aOH92bTbzZTHmv0I04SCwaGY3WFyVWiCGQk8wOYjkPtr8F5oCbY4d1lMCsJsWBlkTFoajDrsDSoCeOr-on3gdCcAkNQAUXJwnOiILcLaub1aTTWh3-ukkt43F726ylyyiMQB6xGTD38KHBJowsiZ2JkkL3epjYrKt7gluVyK4ccOld7xvqTQ1-uISM6P15APacupLyvT9d1M7L5D5ItR7y36CQZsYbwYpd68fQ3_l3Rw"/>
                        </div>
                        <button className="absolute top-4 right-4 bg-surface-container-lowest/80 backdrop-blur-md p-2 rounded-lg text-error hover:scale-110 transition-all">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>delete</span>
                        </button>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="font-label text-[0.7rem] uppercase tracking-wider text-secondary font-bold mb-1 block">Destination</span>
                                    <h3 className="font-headline text-2xl font-bold text-on-surface leading-tight">Oia, Santorini</h3>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[0.65rem] uppercase font-label text-slate-400 mb-1">Starting from</span>
                                    <span className="text-xl font-headline font-extrabold text-primary">$1,240</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-on-surface-variant text-sm border-t border-surface-container-low pt-6">
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">flight</span> Direct flights</span>
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">hotel</span> 152 Stays</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2: Hotel - Aman Tokyo */}
                <div className="group">
                    <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_8px_48px_rgba(27,28,28,0.06)] transition-transform duration-500 hover:-translate-y-2">
                        <div className="aspect-[4/5] overflow-hidden">
                            <img alt="Aman Tokyo" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAu_QxLVjkGQ6-G0bMbkXxWaf-YJTXa3OLZlaZl3BNUU0ijauq4NQuef-x9ZCai45R6osUHYLdLz0JHzorS71RF4rVJKkKCDy9CLNdPFJGepYXlqw7yapn0ReK9IBayC3smeiq2iv4Yw_93t-rQWsXgv6ODVZ1JlvGEh3cYR3ZrsXiPpnZxxmszjNqmv-K8RC6Uh2iPgOVCh_jZlP4s4dH_cy5QoP7eeFCk97nDF_uu6Uc7vi3EI1PYtbMPvF7YPXwj98okRU9pbxU"/>
                        </div>
                        <button className="absolute top-4 right-4 bg-surface-container-lowest/80 backdrop-blur-md p-2 rounded-lg text-error hover:scale-110 transition-all">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>delete</span>
                        </button>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="font-label text-[0.7rem] uppercase tracking-wider text-on-tertiary-fixed-variant font-bold mb-1 block">Boutique Hotel</span>
                                    <h3 className="font-headline text-2xl font-bold text-on-surface leading-tight">Aman Tokyo</h3>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[0.65rem] uppercase font-label text-slate-400 mb-1">Per night</span>
                                    <span className="text-xl font-headline font-extrabold text-primary">$890</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-on-surface-variant text-sm border-t border-surface-container-low pt-6">
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base" style={{fontVariationSettings: "'FILL' 1"}}>star</span> 4.9 (240 reviews)</span>
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">spa</span> Full Service Spa</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Flight */}
                <div className="group">
                    <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_8px_48px_rgba(27,28,28,0.06)] transition-transform duration-500 hover:-translate-y-2">
                        <div className="aspect-[4/5] overflow-hidden">
                            <img alt="Emirates First Class" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVuDPq-5vmLqFoA3QBU5CN10yafSlDAmwvc-VW8eVyma34tAZ6znbOxhPc2DYjrjoE-XA4ITeEYvyZ58iA2gBNq_2ftx41pybwiwqs5qHEkK1EoIutTCsD4VEcVrK_-vPTHiJWtqB3UWE5aw8nT7wHe44xuRKqp5GELdZ05S6S64C3Xf71gVd5rU4nPz0DJ6gwVx3Tzh3g5u7oZFDFRXMYmCGuFYrLRZPbxDt7u5rQWZ35aRMbsbX8IjFgXKJxMnXO40rJSt36WqY"/>
                        </div>
                        <button className="absolute top-4 right-4 bg-surface-container-lowest/80 backdrop-blur-md p-2 rounded-lg text-error hover:scale-110 transition-all">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>delete</span>
                        </button>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="font-label text-[0.7rem] uppercase tracking-wider text-secondary font-bold mb-1 block">First Class Flight</span>
                                    <h3 className="font-headline text-2xl font-bold text-on-surface leading-tight">LHR to DXB</h3>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[0.65rem] uppercase font-label text-slate-400 mb-1">Round Trip</span>
                                    <span className="text-xl font-headline font-extrabold text-primary">$4,500</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-on-surface-variant text-sm border-t border-surface-container-low pt-6">
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">timer</span> 7h 15m</span>
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">airline_seat_flat</span> Fully Flat Bed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 4: Kyoto */}
                <div className="group">
                    <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_8px_48px_rgba(27,28,28,0.06)] transition-transform duration-500 hover:-translate-y-2">
                        <div className="aspect-[4/5] overflow-hidden">
                            <img alt="Kyoto Arashiyama" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrNDpsfbJ7PaLcIRXQIDI0p094lPlJFy8p7wELTjhZ8jxTD1sic7l_dBNkC4fzj3rN2pGUfY1LPNgS3lwEagHPOxylWYdbFeCl0116ooSrF2ooa80kWBN-M1CJrBZ7QMqoaaXEaup_KpRjPOxTbiWmzytgqpfd6Bz27c0ldIY002AIWzLzgNDMt8opGbGlvBrlSP9Unva5O-2eQ-h-Cy-9S8nckQhDRwSlxDwf1c3kHV7R2jaZm0W4NVsyYVjqJ3QFG7-ztI8JN60"/>
                        </div>
                        <button className="absolute top-4 right-4 bg-surface-container-lowest/80 backdrop-blur-md p-2 rounded-lg text-error hover:scale-110 transition-all">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>delete</span>
                        </button>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="font-label text-[0.7rem] uppercase tracking-wider text-secondary font-bold mb-1 block">Destination</span>
                                    <h3 className="font-headline text-2xl font-bold text-on-surface leading-tight">Kyoto, Japan</h3>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[0.65rem] uppercase font-label text-slate-400 mb-1">Starting from</span>
                                    <span className="text-xl font-headline font-extrabold text-primary">$2,100</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-on-surface-variant text-sm border-t border-surface-container-low pt-6">
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">event_available</span> Best in Oct-Nov</span>
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">landscape</span> 12 Attractions</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Empty / Suggestion Card */}
                <div className="group relative overflow-hidden rounded-xl bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center mb-6 shadow-[0_8px_48px_rgba(27,28,28,0.06)]">
                        <span className="material-symbols-outlined text-3xl text-primary-fixed-dim">explore</span>
                    </div>
                    <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Find more inspiration</h3>
                    <p className="text-sm text-on-surface-variant mb-8 max-w-[200px]">Keep exploring to add more gems to your collection.</p>
                    <Link to="/hotels" className="bg-surface-container-lowest text-primary px-6 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-white transition-all">Explore Destinations</Link>
                </div>
            </div>

            {/* Exclusive Member Banner (Glassmorphism) */}
            <div className="mt-16 rounded-2xl p-1 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #002155 0%, #003580 100%)'}}>
                <div className="bg-primary/40 absolute inset-0 blur-3xl"></div>
                <div className="relative bg-surface-container-lowest/10 backdrop-blur-md rounded-[0.9rem] px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
                    <div className="max-w-xl">
                        <span className="inline-block bg-tertiary-fixed text-on-tertiary-fixed font-label text-[0.65rem] font-black tracking-widest px-3 py-1 rounded-full mb-4 uppercase">Elite Voyager Exclusive</span>
                        <h2 className="font-headline text-3xl font-extrabold text-white mb-4">Planning a Group Trip?</h2>
                        <p className="text-primary-fixed leading-relaxed">As an Elite Voyager member, you can share this saved list with up to 5 friends and vote on your next destination together in real-time.</p>
                    </div>
                    <button className="whitespace-nowrap bg-white text-primary px-8 py-4 rounded-xl font-bold tracking-tight hover:scale-105 transition-transform shadow-[0_8px_48px_rgba(27,28,28,0.06)]">Invite Travel Partners</button>
                </div>
            </div>

            {/* Footer Spacer */}
            <div className="h-24"></div>
        </DashboardLayout>
    );
}

export default SavedTrips;
