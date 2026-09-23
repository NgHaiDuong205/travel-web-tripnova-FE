import { Link } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";

function PaymentHistory() {
    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Page Header Section */}
                <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <p className="font-label text-xs uppercase tracking-[0.2em] text-on-tertiary-fixed-variant font-semibold">Financial Ledger</p>
                        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Payment History</h1>
                        <p className="text-on-surface-variant max-w-lg leading-relaxed">Review your past expeditions and managed transactions. All invoices are digital-ready and archived for your convenience.</p>
                    </div>

                    {/* Summary Cards Row (Asymmetric) */}
                    <div className="flex gap-4">
                        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(27,28,28,0.06)] min-w-[200px] border-b-2 border-primary">
                            <p className="text-[0.65rem] uppercase tracking-widest text-on-surface-variant font-label mb-1">Total Spent (Oct)</p>
                            <p className="text-2xl font-headline font-bold text-primary">$12,450.00</p>
                            <div className="flex items-center mt-2 text-xs text-green-600">
                                <span className="material-symbols-outlined text-sm mr-1">trending_down</span>
                                <span>12% less than Sept</span>
                            </div>
                        </div>
                        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(27,28,28,0.06)] min-w-[200px] border-b-2 border-tertiary-fixed-dim">
                            <p className="text-[0.65rem] uppercase tracking-widest text-on-surface-variant font-label mb-2">Primary Method</p>
                            <div className="flex items-center space-x-3">
                                <div className="bg-surface-container-low p-2 rounded-md">
                                    <span className="material-symbols-outlined text-primary">credit_card</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-on-surface">Visa •••• 9012</p>
                                    <p className="text-[0.65rem] text-on-surface-variant">Expires 09/26</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filters Section */}
                <section className="bg-surface-container-low p-4 rounded-xl flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2 bg-surface-container-lowest px-4 py-2 rounded-lg text-sm text-on-surface-variant shadow-sm border-none">
                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                        <span>Date Range: Oct 1 - Oct 31, 2023</span>
                        <span className="material-symbols-outlined text-lg ml-2 cursor-pointer">expand_more</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-surface-container-lowest px-4 py-2 rounded-lg text-sm text-on-surface-variant shadow-sm border-none">
                        <span className="material-symbols-outlined text-lg">filter_list</span>
                        <span>Type: All Transactions</span>
                        <span className="material-symbols-outlined text-lg ml-2 cursor-pointer">expand_more</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-surface-container-lowest px-4 py-2 rounded-lg text-sm text-on-surface-variant shadow-sm border-none">
                        <span className="material-symbols-outlined text-lg">payments</span>
                        <span>Method: Visa</span>
                        <span className="material-symbols-outlined text-lg ml-2 cursor-pointer">expand_more</span>
                    </div>
                    <button className="ml-auto text-primary text-sm font-semibold hover:underline">Reset Filters</button>
                </section>

                {/* Transactions Table-Style List */}
                <section className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(27,28,28,0.06)] overflow-hidden">
                    <div className="grid grid-cols-6 gap-4 px-8 py-6 border-b border-surface-container-low text-[0.65rem] uppercase tracking-widest text-on-surface-variant font-label font-bold">
                        <div className="col-span-2">Service &amp; Description</div>
                        <div>Transaction Date</div>
                        <div>Payment Method</div>
                        <div>Amount</div>
                        <div className="text-right">Action</div>
                    </div>

                    {/* Transaction Entry 1 */}
                    <div className="grid grid-cols-6 gap-4 px-8 py-8 items-center hover:bg-surface-container-low transition-all border-b border-surface-container-low/50 group">
                        <div className="col-span-2 flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-lg bg-primary-fixed-dim flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary-container">apartment</span>
                            </div>
                            <div>
                                <p className="font-bold text-on-surface text-sm">Hôtel Plaza Athénée, Paris</p>
                                <p className="text-xs text-on-surface-variant">Accommodation • Luxury Suite</p>
                            </div>
                        </div>
                        <div className="text-sm text-on-surface">Oct 24, 2023</div>
                        <div className="flex items-center space-x-2">
                            <span className="material-symbols-outlined text-lg text-blue-600">credit_card</span>
                            <span className="text-sm text-on-surface">Visa •••• 9012</span>
                        </div>
                        <div className="font-headline font-bold text-on-surface">$4,250.00</div>
                        <div className="text-right">
                            <button className="inline-flex items-center space-x-1 text-primary hover:text-primary-container text-xs font-bold transition-all group-hover:translate-x-[-4px]">
                                <span className="material-symbols-outlined text-lg">download</span>
                                <span>INVOICE</span>
                            </button>
                        </div>
                    </div>

                    {/* Transaction Entry 2 */}
                    <div className="grid grid-cols-6 gap-4 px-8 py-8 items-center hover:bg-surface-container-low transition-all border-b border-surface-container-low/50 group">
                        <div className="col-span-2 flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-lg bg-secondary-fixed flex items-center justify-center">
                                <span className="material-symbols-outlined text-secondary">flight_takeoff</span>
                            </div>
                            <div>
                                <p className="font-bold text-on-surface text-sm">Air France Executive Class</p>
                                <p className="text-xs text-on-surface-variant">Flight • LHR to CDG</p>
                            </div>
                        </div>
                        <div className="text-sm text-on-surface">Oct 21, 2023</div>
                        <div className="flex items-center space-x-2">
                            <span className="material-symbols-outlined text-lg text-orange-500">contactless</span>
                            <span className="text-sm text-on-surface">Mastercard •••• 4421</span>
                        </div>
                        <div className="font-headline font-bold text-on-surface">$1,820.00</div>
                        <div className="text-right">
                            <button className="inline-flex items-center space-x-1 text-primary hover:text-primary-container text-xs font-bold transition-all group-hover:translate-x-[-4px]">
                                <span className="material-symbols-outlined text-lg">download</span>
                                <span>INVOICE</span>
                            </button>
                        </div>
                    </div>

                    {/* Transaction Entry 3 */}
                    <div className="grid grid-cols-6 gap-4 px-8 py-8 items-center hover:bg-surface-container-low transition-all border-b border-surface-container-low/50 group">
                        <div className="col-span-2 flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-lg bg-tertiary-fixed-dim flex items-center justify-center">
                                <span className="material-symbols-outlined text-tertiary">directions_car</span>
                            </div>
                            <div>
                                <p className="font-bold text-on-surface text-sm">Sixt Chauffeur Service</p>
                                <p className="text-xs text-on-surface-variant">Ground Transport • Paris</p>
                            </div>
                        </div>
                        <div className="text-sm text-on-surface">Oct 20, 2023</div>
                        <div className="flex items-center space-x-2">
                            <span className="material-symbols-outlined text-lg text-slate-800" style={{fontVariationSettings: "'FILL' 1"}}>phone_iphone</span>
                            <span className="text-sm text-on-surface">Apple Pay</span>
                        </div>
                        <div className="font-headline font-bold text-on-surface">$450.00</div>
                        <div className="text-right">
                            <button className="inline-flex items-center space-x-1 text-primary hover:text-primary-container text-xs font-bold transition-all group-hover:translate-x-[-4px]">
                                <span className="material-symbols-outlined text-lg">download</span>
                                <span>INVOICE</span>
                            </button>
                        </div>
                    </div>

                    {/* Transaction Entry 4 */}
                    <div className="grid grid-cols-6 gap-4 px-8 py-8 items-center hover:bg-surface-container-low transition-all border-b border-surface-container-low/50 group">
                        <div className="col-span-2 flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-lg bg-primary-fixed-dim flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary-container">apartment</span>
                            </div>
                            <div>
                                <p className="font-bold text-on-surface text-sm">Belmond Splendido, Portofino</p>
                                <p className="text-xs text-on-surface-variant">Accommodation • Garden View</p>
                            </div>
                        </div>
                        <div className="text-sm text-on-surface">Oct 14, 2023</div>
                        <div className="flex items-center space-x-2">
                            <span className="material-symbols-outlined text-lg text-blue-600">credit_card</span>
                            <span className="text-sm text-on-surface">Visa •••• 9012</span>
                        </div>
                        <div className="font-headline font-bold text-on-surface">$5,930.00</div>
                        <div className="text-right">
                            <button className="inline-flex items-center space-x-1 text-primary hover:text-primary-container text-xs font-bold transition-all group-hover:translate-x-[-4px]">
                                <span className="material-symbols-outlined text-lg">download</span>
                                <span>INVOICE</span>
                            </button>
                        </div>
                    </div>

                    {/* Transaction Entry 5 */}
                    <div className="grid grid-cols-6 gap-4 px-8 py-8 items-center hover:bg-surface-container-low transition-all group">
                        <div className="col-span-2 flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-surface-variant">restaurant</span>
                            </div>
                            <div>
                                <p className="font-bold text-on-surface text-sm">Dining Reserve • Le Meurice</p>
                                <p className="text-xs text-on-surface-variant">Service Fee • Fine Dining Booking</p>
                            </div>
                        </div>
                        <div className="text-sm text-on-surface">Oct 12, 2023</div>
                        <div className="flex items-center space-x-2">
                            <span className="material-symbols-outlined text-lg text-slate-800" style={{fontVariationSettings: "'FILL' 1"}}>phone_iphone</span>
                            <span className="text-sm text-on-surface">Apple Pay</span>
                        </div>
                        <div className="font-headline font-bold text-on-surface">$0.00</div>
                        <div className="text-right">
                            <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-[0.6rem] font-bold rounded uppercase tracking-tighter">Complimentary</span>
                        </div>
                    </div>
                </section>

                {/* Bottom Pagination/Navigation */}
                <div className="flex items-center justify-between py-6">
                    <p className="text-sm text-on-surface-variant">Showing 5 of 24 transactions in October</p>
                    <div className="flex space-x-2">
                        <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-all">
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button className="w-10 h-10 rounded-lg bg-primary text-on-primary font-bold text-sm">1</button>
                        <button className="w-10 h-10 rounded-lg hover:bg-surface-container-low text-on-surface text-sm">2</button>
                        <button className="w-10 h-10 rounded-lg hover:bg-surface-container-low text-on-surface text-sm">3</button>
                        <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-all">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* Promotion / Bento-ish Accent Card */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
                    <div className="md:col-span-2 relative overflow-hidden rounded-xl h-48 group">
                        <div className="absolute inset-0 bg-primary/90 mix-blend-multiply z-10"></div>
                        <img alt="Lush hotel lounge" className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700" data-alt="Interior of a ultra-modern luxury airport lounge with deep velvet armchairs, floor-to-ceiling windows overlooking a runway at sunset, and gold accents" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMxZf_aSTsJXHXj1qPLse3OVA3LjDITEoC5yZwVeVM9AFO5H5Mk3k6ZMd_bmWQR2SgQ9mYxiDWiL4nvgnov85l91QcmJ9A21p4tfXxDBRvIk7bnzTjsZfNRjXfltLawL1Y93M6t8F9Ogp-OQ82Mpe_emH9CwnYh22RkyqOWFqUu21oAexUi_gG4lCuGq7dV75YFNDCoqi6ExAiYsuHT1N5JAUxZWiMok5jRm7hWfsCp1FE3m_wjIvFCnfJ5WuajGXbVknIm-zFSSY"/>
                        <div className="relative z-20 p-8 h-full flex flex-col justify-center">
                            <h3 className="font-headline text-2xl font-bold text-white mb-2">Automate Your Travel Expenses</h3>
                            <p className="text-white/80 text-sm max-w-md mb-4 leading-relaxed">Connect your TripNova account to Expensify or SAP Concur for seamless corporate reporting.</p>
                            <div>
                                <button className="bg-white text-primary px-5 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-primary-fixed-dim transition-colors">
                                    Enable Integration
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-tertiary-fixed p-8 rounded-xl flex flex-col justify-center">
                        <span className="material-symbols-outlined text-4xl text-tertiary-container mb-4">account_balance_wallet</span>
                        <h3 className="font-headline font-bold text-on-tertiary-fixed mb-1">Voyage Wallet</h3>
                        <p className="text-on-tertiary-fixed-variant text-sm mb-4">You have $450.00 in travel credits expiring on Dec 31.</p>
                        <Link to="#" className="text-xs font-black uppercase tracking-widest text-on-tertiary-fixed flex items-center group">
                            Redeem Now
                            <span className="material-symbols-outlined text-sm ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                    </div>
                </section>
            </div>

            {/* FAB for Support (Contextual) */}
            <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group">
                <span className="material-symbols-outlined text-2xl">chat_bubble</span>
                <span className="absolute right-full mr-4 bg-on-surface text-surface text-[0.65rem] font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none uppercase tracking-widest">Live Concierge</span>
            </button>
        </DashboardLayout>
    );
}

export default PaymentHistory;
