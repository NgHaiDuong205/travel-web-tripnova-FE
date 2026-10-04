import GlobeExplorer from '../../../components/home/GlobeExplorer';
import WorldClocks from '../../../components/common/WorldClocks';
import { Link } from "react-router-dom";
import HomeTopDestinations from '../../../components/home/HomeTopDestinations';
import { useT } from "../../../i18n/I18nContext";

function Home() {
    const t = useT();
    return (
        <main className="font-body text-on-surface bg-surface pt-20">
            {/* Hero Section */}
            <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden mt-[-80px]">
                <div className="absolute inset-0 z-0">
                    <img 
                        className="w-full h-full object-cover animate-subtle-zoom" 
                        alt={t("home.hero.imageAlt")} 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO1BOjSkPhfnC1mz0B-XphsFG1M7z3ugIaSzcM5RiNdTb9zY7h9KXqk0zoKvNTkiXkr9_qHJLBeIUq8OSqTgJE8W4CAqAGZt4bzGvLYoEPjCShIPpWfrZXZw0em5llR_5YMC5lzNMD-maJZmhCTwUeLsSrCs_NW4K5BSwe3bDnUIfdjQ6chMV4T6BNrJHgCn-5oSM4lPlFqA9dq-RmqeLA9piw4IseSZ-IiA9zNPzC0-CfW_w6U2eE_6kF_ZcwQzcK7j1f7iwWjEM"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
                </div>
                <div className="relative z-10 w-full max-w-5xl px-6 text-center">
                    <div className="mb-12">
                        <span className="inline-block text-white/80 font-headline font-bold tracking-[0.3em] uppercase text-sm mb-6 drop-shadow-sm">{t("home.hero.eyebrow")}</span>
                        <h1 className="font-headline text-6xl md:text-8xl lg:text-9xl font-extrabold text-white mb-8 tracking-tighter drop-shadow-2xl">
                            {t("home.hero.titleFirst")}<br/>{t("home.hero.titleSecond")}
                        </h1>
                        <p className="text-white/95 text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-xl">
                            {t("home.hero.description")}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
                        <Link to="/destinations" className="hero-gradient text-white px-10 py-5 rounded-full font-headline font-bold text-lg shadow-2xl hover:scale-105 transition-all duration-300">
                            {t("home.hero.exploreDestinations")}
                        </Link>
                        <Link to="/abouts" className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-10 py-5 rounded-full font-headline font-bold text-lg hover:bg-white/20 transition-all duration-300">
                            {t("home.hero.ourStory")}
                        </Link>
                    </div>
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
                        <span className="material-symbols-outlined text-white text-3xl opacity-50">keyboard_double_arrow_down</span>
                    </div>
                </div>
            </section>

            {/* Featured Services */}
            <section className="py-24 bg-surface px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-2xl">
                            <span className="text-primary-container font-headline font-extrabold tracking-widest text-xs uppercase mb-4 block">{t("home.services.eyebrow")}</span>
                            <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface leading-tight">{t("home.services.title")}</h2>
                        </div>
                        <p className="text-on-surface-variant font-body max-w-sm">{t("home.services.description")}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-primary-fixed flex items-center justify-center rounded-xl">
                                <span className="material-symbols-outlined text-primary-container text-3xl">apartment</span>
                            </div>
                            <h3 className="text-2xl font-headline font-bold">{t("home.services.hotels.title")}</h3>
                            <p className="text-on-surface-variant leading-relaxed">{t("home.services.hotels.description")}</p>
                        </div>
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-secondary-fixed flex items-center justify-center rounded-xl">
                                <span className="material-symbols-outlined text-on-secondary-fixed-variant text-3xl">minor_crash</span>
                            </div>
                            <h3 className="text-2xl font-headline font-bold">{t("home.services.cars.title")}</h3>
                            <p className="text-on-surface-variant leading-relaxed">{t("home.services.cars.description")}</p>
                        </div>
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-tertiary-fixed flex items-center justify-center rounded-xl">
                                <span className="material-symbols-outlined text-on-tertiary-fixed-variant text-3xl">travel_explore</span>
                            </div>
                            <h3 className="text-2xl font-headline font-bold">{t("home.services.flights.title")}</h3>
                            <p className="text-on-surface-variant leading-relaxed">{t("home.services.flights.description")}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Top Destinations */}
            <section className="py-24 bg-surface-container-low px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-headline font-extrabold mb-4 tracking-tight">{t("home.destinations.title")}</h2>
                        <p className="text-on-surface-variant max-w-xl mx-auto">{t("home.destinations.description")}</p>
                    </div>
                    <HomeTopDestinations />
                </div>
            </section>

            {/* 3D Globe Section */}
            <section className="py-24 px-8 bg-surface-container-low relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-headline font-extrabold mb-4 tracking-tight">{t("home.globe.title")}</h2>
                        <p className="text-on-surface-variant max-w-xl mx-auto">{t("home.globe.description")}</p>
                        <WorldClocks />
                    </div>
                    {/* Globe3D tự bù zoom 0.75 của body cho khung canvas */}
                    <GlobeExplorer className="h-[640px] md:h-[820px]" />
                </div>
            </section>

            {/* Promotional Section */}
            <section className="py-24 px-8 bg-surface">
                <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden hero-gradient relative min-h-[400px] flex items-center">
                    <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block opacity-40">
                        <img 
                            className="w-full h-full object-cover grayscale mix-blend-overlay" 
                            alt={t("home.newsletter.imageAlt")} 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGDSSibLHCGP3FH1NSC8Q6kCzc8Bn8FG4ZXD0C4B1rlNXp5sjcgHfiXb23AP_S_Tpr3-rlnrfzX8pv1KXEC1oKO32R0tKr8VIXkzI0dLF2_FWM9MA3cUQtKhZb63N5ht5M9U-leQyBCaCn6yCHM7Iyd_CUt9mtGC-vTBqOgzqHeFxR5b5Y4eoUw16dMBBV-TA0T2gB067b9tmqVqvUZOidof4DWHjtMy6TDiTzhyafccESrcQCV3K9KEsgdBwww8e5FyBezWFe5Es"
                        />
                    </div>
                    <div className="relative z-10 px-12 md:px-24 py-16 max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-white mb-6 leading-tight">{t("home.newsletter.title")}</h2>
                        <p className="text-primary-fixed text-lg mb-10 leading-relaxed">{t("home.newsletter.description")}</p>
                        <form className="flex flex-col sm:flex-row gap-4">
                            <input 
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-lg px-6 py-4 focus:ring-2 focus:ring-tertiary-fixed outline-none flex-grow" 
                                placeholder={t("home.newsletter.emailPlaceholder")} 
                                type="email"
                            />
                            <button className="bg-tertiary-fixed text-on-tertiary-fixed font-headline font-extrabold px-8 py-4 rounded-lg hover:scale-105 transition-transform" type="submit">{t("home.newsletter.subscribe")}</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Trust Signals */}
            <section className="py-24 px-8 border-t border-outline-variant/10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary-container text-4xl">verified_user</span>
                            </div>
                            <h4 className="text-xl font-headline font-bold">{t("home.trust.curator.title")}</h4>
                            <p className="text-on-surface-variant text-sm max-w-xs">{t("home.trust.curator.description")}</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary-container text-4xl">support_agent</span>
                            </div>
                            <h4 className="text-xl font-headline font-bold">{t("home.trust.support.title")}</h4>
                            <p className="text-on-surface-variant text-sm max-w-xs">{t("home.trust.support.description")}</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary-container text-4xl">payments</span>
                            </div>
                            <h4 className="text-xl font-headline font-bold">{t("home.trust.pricing.title")}</h4>
                            <p className="text-on-surface-variant text-sm max-w-xs">{t("home.trust.pricing.description")}</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Home;
