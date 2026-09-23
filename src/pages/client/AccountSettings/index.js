import { Link } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";

function AccountSettings() {
    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary mb-2">Account Settings</h1>
                    <p className="text-on-surface-variant">Manage your profile, security preferences, and membership perks.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Primary Forms */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Profile Section */}
                        <section className="bg-surface-container-low p-8 rounded-xl">
                            <div className="flex items-center gap-2 mb-8">
                                <span className="material-symbols-outlined text-primary">person</span>
                                <h2 className="font-headline text-xl font-bold">Profile Details</h2>
                            </div>
                            <div className="flex items-start gap-8 mb-10">
                                <div className="relative group">
                                    <img className="w-24 h-24 rounded-xl object-cover shadow-sm" alt="User profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABkg0WgLHDn84pzLBlYFHbHt-rZTHKhWiZRxFNRzEs-i8fFVpaJ7IShReM2zWlIrhQd6S_f0d5N5CPzyg3gLB4tdZMzLXvpf1iFN6ff1z9McAdlNj1zHZ6yqGq1-npF4ssKm-PYGT_K0ouI4F1qoYDPISLHATXwSGkevM-77LMIlEi4SJ_Mlt63sygKsMoEHGaCCoNprKfP_8u9QpAcqHLVmzrcQCF2gz3ZepJZa-M0olqwyyN6VmnUDV_PlJh7NrDbJr8dvWEtPI"/>
                                    <button className="absolute -bottom-2 -right-2 bg-white p-2 rounded-lg shadow-lg hover:bg-surface-container-highest transition-colors">
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                </div>
                                <div className="flex-1 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="font-label text-[0.7rem] uppercase tracking-wider font-bold text-on-surface-variant">Full Name</label>
                                            <input className="w-full bg-surface-container-lowest border-b-2 border-transparent focus:border-primary-fixed-dim focus:ring-0 px-0 py-2 transition-all text-sm" type="text" defaultValue="Julian Montgomery"/>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="font-label text-[0.7rem] uppercase tracking-wider font-bold text-on-surface-variant">Email Address</label>
                                            <input className="w-full bg-surface-container-lowest border-b-2 border-transparent focus:border-primary-fixed-dim focus:ring-0 px-0 py-2 transition-all text-sm" type="email" defaultValue="julian.m@voyager.com"/>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="font-label text-[0.7rem] uppercase tracking-wider font-bold text-on-surface-variant">Phone Number</label>
                                            <input className="w-full bg-surface-container-lowest border-b-2 border-transparent focus:border-primary-fixed-dim focus:ring-0 px-0 py-2 transition-all text-sm" type="text" defaultValue="+1 (555) 012-3456"/>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="font-label text-[0.7rem] uppercase tracking-wider font-bold text-on-surface-variant">Location</label>
                                            <input className="w-full bg-surface-container-lowest border-b-2 border-transparent focus:border-primary-fixed-dim focus:ring-0 px-0 py-2 transition-all text-sm" type="text" defaultValue="London, United Kingdom"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button className="text-white px-6 py-3 rounded-lg font-bold text-sm" style={{background: 'linear-gradient(135deg, #002155 0%, #003580 100%)'}}>
                                    Save Profile Changes
                                </button>
                            </div>
                        </section>

                        {/* Preferences Section */}
                        <section className="bg-surface-container-low p-8 rounded-xl">
                            <div className="flex items-center gap-2 mb-8">
                                <span className="material-symbols-outlined text-primary">tune</span>
                                <h2 className="font-headline text-xl font-bold">Trip Preferences</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="font-label text-[0.7rem] uppercase tracking-wider font-bold text-on-surface-variant">System Language</label>
                                        <select className="w-full bg-surface-container-lowest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary-fixed-dim">
                                            <option>English (UK)</option>
                                            <option>English (US)</option>
                                            <option>Vietnamese (VND)</option>
                                            <option>French (FR)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-label text-[0.7rem] uppercase tracking-wider font-bold text-on-surface-variant">Display Currency</label>
                                        <div className="flex gap-2">
                                            <button className="flex-1 bg-primary text-on-primary py-2 rounded-lg text-xs font-bold">USD</button>
                                            <button className="flex-1 bg-surface-container-lowest text-on-surface py-2 rounded-lg text-xs font-bold hover:bg-surface-dim transition-colors">EUR</button>
                                            <button className="flex-1 bg-surface-container-lowest text-on-surface py-2 rounded-lg text-xs font-bold hover:bg-surface-dim transition-colors">VND</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="font-label text-[0.7rem] uppercase tracking-wider font-bold text-on-surface-variant">Notification Channels</label>
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg cursor-pointer">
                                            <span className="text-sm font-medium">Email Notifications</span>
                                            <input defaultChecked className="rounded text-primary focus:ring-primary" type="checkbox"/>
                                        </label>
                                        <label className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg cursor-pointer">
                                            <span className="text-sm font-medium">SMS Trip Alerts</span>
                                            <input className="rounded text-primary focus:ring-primary" type="checkbox"/>
                                        </label>
                                        <label className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg cursor-pointer">
                                            <span className="text-sm font-medium">Marketing Offers</span>
                                            <input defaultChecked className="rounded text-primary focus:ring-primary" type="checkbox"/>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Security Section */}
                        <section className="bg-surface-container-low p-8 rounded-xl">
                            <div className="flex items-center gap-2 mb-8">
                                <span className="material-symbols-outlined text-primary">security</span>
                                <h2 className="font-headline text-xl font-bold">Security &amp; Privacy</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-6 bg-surface-container-lowest rounded-xl border-l-4 border-primary">
                                    <h3 className="font-headline font-bold mb-2">Change Password</h3>
                                    <p className="text-xs text-on-surface-variant mb-4">Last changed 3 months ago. We recommend updating regularly.</p>
                                    <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                                        Update Credentials <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                </div>
                                <div className="p-6 bg-surface-container-lowest rounded-xl border-l-4 border-secondary-container">
                                    <h3 className="font-headline font-bold mb-2">Two-Factor Auth</h3>
                                    <p className="text-xs text-on-surface-variant mb-4">Enhanced security for your account and payment data.</p>
                                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                                        <span className="material-symbols-outlined text-sm">check_circle</span> Enabled
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Membership & Status */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Elite Membership Card */}
                        <div className="p-8 rounded-xl text-on-primary relative overflow-hidden group" style={{background: 'linear-gradient(135deg, #002155 0%, #003580 100%)'}}>
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <h3 className="font-headline text-lg font-bold">Elite Status</h3>
                                        <p className="text-primary-fixed-dim text-xs">Since Jan 2022</p>
                                    </div>
                                    <span className="material-symbols-outlined text-tertiary-fixed text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                                </div>
                                <div className="mb-8">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span>Progress to 'Ambassador'</span>
                                        <span>75%</span>
                                    </div>
                                    <div className="w-full bg-white/20 h-1.5 rounded-full">
                                        <div className="bg-tertiary-fixed h-full w-3/4 rounded-full"></div>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex gap-3 text-sm">
                                        <span className="material-symbols-outlined text-tertiary-fixed">hotel_class</span>
                                        <span>Complimentary Room Upgrades</span>
                                    </li>
                                    <li className="flex gap-3 text-sm">
                                        <span className="material-symbols-outlined text-tertiary-fixed">priority_high</span>
                                        <span>Priority Lounge Access</span>
                                    </li>
                                    <li className="flex gap-3 text-sm">
                                        <span className="material-symbols-outlined text-tertiary-fixed">support_agent</span>
                                        <span>24/7 Dedicated Concierge</span>
                                    </li>
                                </ul>
                                <button className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-sm font-bold transition-all">
                                    View All Perks
                                </button>
                            </div>
                        </div>

                        {/* Quick Help Card */}
                        <div className="bg-surface-container-low p-6 rounded-xl space-y-6">
                            <h3 className="font-headline font-bold">Need assistance?</h3>
                            <div className="space-y-4">
                                <Link to="#" className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-surface-container-lowest rounded-lg flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">menu_book</span>
                                        </div>
                                        <span className="text-sm font-medium">Privacy Policy</span>
                                    </div>
                                    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
                                </Link>
                                <Link to="#" className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-surface-container-lowest rounded-lg flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">description</span>
                                        </div>
                                        <span className="text-sm font-medium">Terms of Service</span>
                                    </div>
                                    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
                                </Link>
                                <Link to="#" className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-surface-container-lowest rounded-lg flex items-center justify-center text-error">
                                            <span className="material-symbols-outlined">no_accounts</span>
                                        </div>
                                        <span className="text-sm font-medium text-error">Deactivate Account</span>
                                    </div>
                                    <span className="material-symbols-outlined text-outline group-hover:text-error transition-colors">chevron_right</span>
                                </Link>
                            </div>
                        </div>

                        {/* Trip Map Glimpse */}
                        <div className="rounded-xl overflow-hidden shadow-sm relative">
                            <div className="h-48 w-full bg-surface-dim">
                                <img className="w-full h-full object-cover" alt="Map of London" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPCE_SkYIgCYtFP95dg_j976vJauX7dTjxD1OymMKaYSLVoNeJcdKgeIeBhWWSaZhexrDZI17E-z0Dsy6Hz5hdrWry8oIcm_vMe7St0qicZCjjej0Fcef_kQYcAQEcdmgSNUW5mTxndiukyueqFPuaAtXKrw8_HiOdr5NVsmUpe7yiFNIVHHw9lOL4gL4G-D-eBRT7jM3BJRbYszRNa728hNQ1g6zZoHSfLNLNjPz7qrkkvkKLqcEe53NsRlCgYYnYthk8FYgPCZI"/>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-[0.6rem] uppercase tracking-widest font-bold text-on-surface-variant">Last Journey</p>
                                    <p className="text-xs font-bold">London Gateway</p>
                                </div>
                                <span className="material-symbols-outlined text-primary">location_on</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Spacer */}
            <div className="h-24"></div>
        </DashboardLayout>
    );
}

export default AccountSettings;
