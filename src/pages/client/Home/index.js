import Globe3D from '../../../components/common/Globe3D';
import WorldClocks from '../../../components/common/WorldClocks';

function Home() {
    return (
        <main className="font-body text-on-surface bg-surface pt-20">
            {/* Hero Section */}
            <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden mt-[-80px]">
                <div className="absolute inset-0 z-0">
                    <img 
                        className="w-full h-full object-cover animate-subtle-zoom" 
                        alt="Breathtaking cinematic panoramic view of a luxury infinity pool overlooking the Mediterranean sea at golden hour with dramatic clouds" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO1BOjSkPhfnC1mz0B-XphsFG1M7z3ugIaSzcM5RiNdTb9zY7h9KXqk0zoKvNTkiXkr9_qHJLBeIUq8OSqTgJE8W4CAqAGZt4bzGvLYoEPjCShIPpWfrZXZw0em5llR_5YMC5lzNMD-maJZmhCTwUeLsSrCs_NW4K5BSwe3bDnUIfdjQ6chMV4T6BNrJHgCn-5oSM4lPlFqA9dq-RmqeLA9piw4IseSZ-IiA9zNPzC0-CfW_w6U2eE_6kF_ZcwQzcK7j1f7iwWjEM"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
                </div>
                <div className="relative z-10 w-full max-w-5xl px-6 text-center">
                    <div className="mb-12">
                        <span className="inline-block text-white/80 font-headline font-bold tracking-[0.3em] uppercase text-sm mb-6 drop-shadow-sm">The Art of Travel</span>
                        <h1 className="font-headline text-6xl md:text-8xl lg:text-9xl font-extrabold text-white mb-8 tracking-tighter drop-shadow-2xl">
                            The World,<br/>Curated.
                        </h1>
                        <p className="text-white/95 text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-xl">
                            Experience travel through an editorial lens. We frame your journey with precision and soul, bringing the globe's finest sanctuaries to your fingertips.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
                        <button className="hero-gradient text-white px-10 py-5 rounded-full font-headline font-bold text-lg shadow-2xl hover:scale-105 transition-all duration-300">
                            Explore Destinations
                        </button>
                        <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-10 py-5 rounded-full font-headline font-bold text-lg hover:bg-white/20 transition-all duration-300">
                            Our Story
                        </button>
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
                            <span className="text-primary-container font-headline font-extrabold tracking-widest text-xs uppercase mb-4 block">Our Expertise</span>
                            <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface leading-tight">Tailored Services for the Modern Voyager</h2>
                        </div>
                        <p className="text-on-surface-variant font-body max-w-sm">From the tarmac to the terrace, we manage every detail of your escape with surgical precision.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-primary-fixed flex items-center justify-center rounded-xl">
                                <span className="material-symbols-outlined text-primary-container text-3xl">apartment</span>
                            </div>
                            <h3 className="text-2xl font-headline font-bold">Premium Hotels</h3>
                            <p className="text-on-surface-variant leading-relaxed">Hand-selected boutique stays and 5-star properties that define architectural excellence and hospitality.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-secondary-fixed flex items-center justify-center rounded-xl">
                                <span className="material-symbols-outlined text-on-secondary-fixed-variant text-3xl">minor_crash</span>
                            </div>
                            <h3 className="text-2xl font-headline font-bold">Efficient Car Rentals</h3>
                            <p className="text-on-surface-variant leading-relaxed">A fleet ranging from luxury sedans to rugged explorers, ensuring your mobility is as seamless as your stay.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-tertiary-fixed flex items-center justify-center rounded-xl">
                                <span className="material-symbols-outlined text-on-tertiary-fixed-variant text-3xl">travel_explore</span>
                            </div>
                            <h3 className="text-2xl font-headline font-bold">Flight Booking</h3>
                            <p className="text-on-surface-variant leading-relaxed">Priority routing and exclusive fares across global carriers, prioritizing comfort and time efficiency.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Top Destinations */}
            <section className="py-24 bg-surface-container-low px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-headline font-extrabold mb-4 tracking-tight">The Global Shortlist</h2>
                        <p className="text-on-surface-variant max-w-xl mx-auto">Trending destinations selected by our editorial team for their unique cultural and visual depth.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="relative h-72 overflow-hidden">
                                <img 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    alt="tranquil traditional wooden temple in Kyoto surrounded by vibrant autumn maple leaves in shades of orange and red" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDD-XZ9OdFidNqCb8MKUXP_oQaupNaAP_Q8OeoesPX9AenBBeJ-PdRZzNYW1ILwmMA12jPdvaXvAeIF2bVjXNb-2A_BduWsHPYudJ5SngaI7-CqQGQLShJcZVcNKxq79jlTmorHpoovaVd7B18BWAbWQKSDxcH4SPwVzmFFc_N7Inco1zauM45GqmXlBgSNxFkj8yPyxLEPSEoGgy7Wb2TmgvzqpanMKEQZxGfrLzOxTYCQ3nxcw3AeFhxjYHVhy8ccG-_ELV5U-hw"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1">
                                    <span className="material-symbols-outlined text-yellow-500 text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                                    <span className="text-xs font-bold font-headline">4.9</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <span className="text-[10px] font-extrabold text-primary tracking-widest uppercase mb-2 block">Heritage & Zen</span>
                                <h3 className="text-2xl font-headline font-bold mb-4">Kyoto, Japan</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-on-surface-variant text-sm">From <span className="font-bold text-on-surface text-lg">$1,200</span></span>
                                    <button className="text-primary font-bold text-sm hover:underline underline-offset-4">Explore</button>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="relative h-72 overflow-hidden">
                                <img 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    alt="iconic white-washed buildings of Oia Santorini with blue domes overlooking the deep blue Aegean sea at dusk" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbVX4Fnj17Fs4VIEg1r2eJHxzcLpRRBRwL-tff27JivheWIEtyBI8DX0pgtJ4fRnWIXKtmn6uTJY5W9KrOL0YenELNWxJoG789E-9bVuNe6uqLgb9cZc_5cmK5rhl37EqociDYvQWEeay1Ru_rL96RWLAvp9lZgDc_1l1_Ydf0kfLTzS3u8W2JsV3dtMhm4W5Dg86Kb54ZWWjT-wiKUIFhE0ox7GUfVketLcQIHUYjMQ5OuXwCAmSwUnpef3vR1dS3wwDB5AutRes"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1">
                                    <span className="material-symbols-outlined text-yellow-500 text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                                    <span className="text-xs font-bold font-headline">4.8</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <span className="text-[10px] font-extrabold text-primary tracking-widest uppercase mb-2 block">Coastal Elegance</span>
                                <h3 className="text-2xl font-headline font-bold mb-4">Santorini, Greece</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-on-surface-variant text-sm">From <span className="font-bold text-on-surface text-lg">$2,450</span></span>
                                    <button className="text-primary font-bold text-sm hover:underline underline-offset-4">Explore</button>
                                </div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="relative h-72 overflow-hidden">
                                <img 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    alt="stunning turquoise lake in Banff National Park surrounded by jagged snow-capped mountains and dense pine forest" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDB4qO3Xgti_aKuQJ_uqf3wnF795xjk6Zsn_3eNggMN9HUVofsvQWS63OxYKkrELHL6STp0-vrkcUQUfwlFQfmzW3PBk31ekMCKc3J6EErT30ce4dB0c-MaBgpPi1ybr-EhG0Es3CztNPW-DElitCSQcEsEbk9AdueNAn8wWpoWBAM9cSwsiLSBusTjt7C7iP_QMNDkV-XgofH-2fHcxp_jGBqXKknK6tslAMzrcfXG4egKm83J4AEczBI8PT4gQEDAtEDnvDDHyRg"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1">
                                    <span className="material-symbols-outlined text-yellow-500 text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                                    <span className="text-xs font-bold font-headline">5.0</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <span className="text-[10px] font-extrabold text-primary tracking-widest uppercase mb-2 block">Untamed Wild</span>
                                <h3 className="text-2xl font-headline font-bold mb-4">Banff, Canada</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-on-surface-variant text-sm">From <span className="font-bold text-on-surface text-lg">$980</span></span>
                                    <button className="text-primary font-bold text-sm hover:underline underline-offset-4">Explore</button>
                                </div>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="relative h-72 overflow-hidden">
                                <img 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    alt="vibrant neon-lit street in Tokyo at night with glowing signs and busy urban atmosphere and soft bokeh" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzUd4vaKlBZSs3KxI8GDgEwRdvyAdBfcxnsqqObjIfJ46e81jS0CzSSKQchyITtGcuOMERS-GPCMC0gr2rLiFR1DW07KXZjnQp4ETwFWpciMNtoktsvS5HM0hr9fhKHmRQSbEBEXSczQk2tR6DHxTVZOnNBuMqmQFiu8E-o6WrCFyHP3r-VaQ6ynZQF1rIe-TEQSOBLKTATnLxWbiDGm1tEIJkElBBGMxiic0d8a4UKBCrdwSHIpPsY_-eQYs1zllFvIEIZko633g"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1">
                                    <span className="material-symbols-outlined text-yellow-500 text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                                    <span className="text-xs font-bold font-headline">4.7</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <span className="text-[10px] font-extrabold text-primary tracking-widest uppercase mb-2 block">Neon Pulse</span>
                                <h3 className="text-2xl font-headline font-bold mb-4">Tokyo, Japan</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-on-surface-variant text-sm">From <span className="font-bold text-on-surface text-lg">$1,550</span></span>
                                    <button className="text-primary font-bold text-sm hover:underline underline-offset-4">Explore</button>
                                </div>
                            </div>
                        </div>

                        {/* Card 5 */}
                        <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="relative h-72 overflow-hidden">
                                <img 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    alt="colorful cliffside houses of Positano on the Amalfi Coast overlooking beach umbrellas and turquoise Mediterranean waters" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCg8XESLGmyUae72UsG6GDEygCOPlt0QigJoC9G7gQVjhoPiKC2P1u793k93OkkYVpjeOXg8SwUMaNUuu2NOdrPd9iht_3hLRceobZV6Ay8BgJTYE5oQD7NCbM5_93cTaLK87DqaEsxCMOvM_9fzfWGucd-IPTjIZfKND_wrMI7c9Hxc0GOxtg_ZP343m3RMtFXpv1QLegh6YZFaGHEq2n0GfYRnSm2TBgRGyOgK4Ye3EN8ILymzttXdw7jQtoVDnZwM_PhNU1gBI"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1">
                                    <span className="material-symbols-outlined text-yellow-500 text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                                    <span className="text-xs font-bold font-headline">4.9</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <span className="text-[10px] font-extrabold text-primary tracking-widest uppercase mb-2 block">Dolce Vita</span>
                                <h3 className="text-2xl font-headline font-bold mb-4">Amalfi, Italy</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-on-surface-variant text-sm">From <span className="font-bold text-on-surface text-lg">$2,100</span></span>
                                    <button className="text-primary font-bold text-sm hover:underline underline-offset-4">Explore</button>
                                </div>
                            </div>
                        </div>

                        {/* Card 6 */}
                        <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="relative h-72 overflow-hidden">
                                <img 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    alt="dramatic view of Table Mountain in Cape Town with clouds rolling over the peaks and golden sunlight on the city" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_4GEj2t2HIwgsKhQmGYoM-n-0XD3bECsPMZq4MneqT_cfDIDzYdw9o0VAkdKt0MwShb-UijSdeW3Fjs39eH0fDaMhGNssWFyqZ-pPuIfW0yTYDUwngDl2mo-YPa4p5oA6QTQKaUOv9eJEJDtTo2UsYUcfhnLK1u8lYC9S4ARN2r47J1Vfk-OiIhmKXJFeH_fVEREq5iCluPUwgh0fNKDga7PKkeHNh8Wnh0hspNl2DIqgpEhGnOIXPd3g4Lb9wsBXe5pkK06p0F0"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1">
                                    <span className="material-symbols-outlined text-yellow-500 text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                                    <span className="text-xs font-bold font-headline">4.8</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <span className="text-[10px] font-extrabold text-primary tracking-widest uppercase mb-2 block">Epic Horizons</span>
                                <h3 className="text-2xl font-headline font-bold mb-4">Cape Town, SA</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-on-surface-variant text-sm">From <span className="font-bold text-on-surface text-lg">$1,150</span></span>
                                    <button className="text-primary font-bold text-sm hover:underline underline-offset-4">Explore</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3D Globe Section */}
            <section className="py-24 px-8 bg-surface-container-low relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-headline font-extrabold mb-4 tracking-tight">Explore the World</h2>
                        <p className="text-on-surface-variant max-w-xl mx-auto">Interactive 3D globe showing our global reach and premium destinations</p>
                        <WorldClocks />
                    </div>
                    <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl relative" style={{ zoom: 1.333333 }}>
                        <Globe3D />
                    </div>
                </div>
            </section>

            {/* Promotional Section */}
            <section className="py-24 px-8 bg-surface">
                <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden hero-gradient relative min-h-[400px] flex items-center">
                    <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block opacity-40">
                        <img 
                            className="w-full h-full object-cover grayscale mix-blend-overlay" 
                            alt="scenic view of a small luxury yacht cruising through calm mountain fjords at sunset with mirror reflections" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGDSSibLHCGP3FH1NSC8Q6kCzc8Bn8FG4ZXD0C4B1rlNXp5sjcgHfiXb23AP_S_Tpr3-rlnrfzX8pv1KXEC1oKO32R0tKr8VIXkzI0dLF2_FWM9MA3cUQtKhZb63N5ht5M9U-leQyBCaCn6yCHM7Iyd_CUt9mtGC-vTBqOgzqHeFxR5b5Y4eoUw16dMBBV-TA0T2gB067b9tmqVqvUZOidof4DWHjtMy6TDiTzhyafccESrcQCV3K9KEsgdBwww8e5FyBezWFe5Es"
                        />
                    </div>
                    <div className="relative z-10 px-12 md:px-24 py-16 max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-white mb-6 leading-tight">Join the Voyager Circle</h2>
                        <p className="text-primary-fixed text-lg mb-10 leading-relaxed">Unlock the hidden gems of travel. Our weekly editorial delivers exclusive property access and curates travel stories you won't find anywhere else.</p>
                        <form className="flex flex-col sm:flex-row gap-4">
                            <input 
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-lg px-6 py-4 focus:ring-2 focus:ring-tertiary-fixed outline-none flex-grow" 
                                placeholder="Your email address" 
                                type="email"
                            />
                            <button className="bg-tertiary-fixed text-on-tertiary-fixed font-headline font-extrabold px-8 py-4 rounded-lg hover:scale-105 transition-transform" type="submit">Subscribe</button>
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
                            <h4 className="text-xl font-headline font-bold">Verified Curator</h4>
                            <p className="text-on-surface-variant text-sm max-w-xs">Every property and experience is personally vetted by our global team of luxury experts.</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary-container text-4xl">support_agent</span>
                            </div>
                            <h4 className="text-xl font-headline font-bold">24/7 Priority Support</h4>
                            <p className="text-on-surface-variant text-sm max-w-xs">A dedicated concierge available around the clock to handle every unexpected turn.</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary-container text-4xl">payments</span>
                            </div>
                            <h4 className="text-xl font-headline font-bold">Transparent Pricing</h4>
                            <p className="text-on-surface-variant text-sm max-w-xs">No hidden fees, no dynamic surcharges. The price you see is the final editorial value.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Home;