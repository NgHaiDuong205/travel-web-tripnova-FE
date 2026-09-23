import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { getDestinationDetail } from "../../../constants/destinations";

function ExperienceCard({ experience }) {
    const sizeClass =
        experience.size === "large"
            ? "md:col-span-2 md:row-span-2"
            : experience.size === "wide"
              ? "md:col-span-2"
              : "";

    return (
        <div className={`${sizeClass} relative group overflow-hidden rounded-xl min-h-[280px] md:min-h-0`}>
            <img
                alt={experience.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={experience.image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className={`absolute bottom-0 left-0 ${experience.size === "small" ? "p-6" : "p-8"}`}>
                {experience.tag && (
                    <p className="font-label text-xs text-tertiary-fixed-dim font-bold tracking-widest uppercase mb-2">
                        {experience.tag}
                    </p>
                )}
                <h3
                    className={`text-white font-bold ${experience.size === "small" ? "text-lg" : "text-2xl"}`}
                >
                    {experience.title}
                </h3>
            </div>
        </div>
    );
}

function HotelCard({ hotel }) {
    return (
        <div className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-xl mb-6 bg-surface-container-highest aspect-[4/5]">
                <img
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={hotel.image}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-primary">
                    {hotel.price}
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-headline text-2xl font-bold tracking-tight">{hotel.name}</h3>
                    <div className="flex items-center space-x-1">
                        <span
                            className="material-symbols-outlined text-tertiary-fixed text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            star
                        </span>
                        <span className="text-sm font-bold">{hotel.rating}</span>
                    </div>
                </div>
                <p className="font-label text-xs text-on-surface-variant font-bold uppercase tracking-widest">
                    {hotel.location}
                </p>
                <p className="text-on-surface-variant text-sm line-clamp-2">{hotel.description}</p>
            </div>
        </div>
    );
}

function DestinationDetail() {
    const { id } = useParams();
    const destination = getDestinationDetail(id);
    const [email, setEmail] = useState("");

    if (!destination) {
        return <Navigate to="/destinations" replace />;
    }

    const handleNewsletter = (e) => {
        e.preventDefault();
        setEmail("");
    };

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed-dim selection:text-primary -mt-20">
            {/* Hero */}
            <section className="relative h-[min(870px,100vh)] w-full overflow-hidden">
                <img
                    alt={destination.heroTitle.join(" ")}
                    className="absolute inset-0 w-full h-full object-cover"
                    src={destination.heroImage}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-12 lg:p-24 max-w-7xl mx-auto">
                    <Link
                        to="/destinations"
                        className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-6 transition-colors group"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span className="font-label text-xs uppercase tracking-widest font-semibold">
                            Back to Destinations
                        </span>
                    </Link>
                    <h1 className="font-headline text-6xl md:text-8xl font-extrabold text-white tracking-tighter leading-[0.9] mb-4">
                        {destination.heroTitle[0]} <br />
                        {destination.heroTitle[1]}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 mt-8">
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-white">
                            <span className="material-symbols-outlined text-tertiary-fixed">star</span>
                            <span className="font-label text-sm font-bold">{destination.badge}</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-white">
                            <span className="material-symbols-outlined">wb_sunny</span>
                            <span className="font-label text-sm font-bold">{destination.bestTime}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Curator's Perspective */}
            <section className="py-24 px-8 bg-surface">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-4">
                        <h2 className="font-label text-xs uppercase tracking-[0.2em] text-primary mb-6 font-bold">
                            The Curator's Perspective
                        </h2>
                        <p className="font-headline text-3xl font-bold leading-tight text-on-surface">
                            {destination.curatorQuote}
                        </p>
                        <div className="mt-10 p-8 rounded-xl bg-surface-container-low">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                                    <img alt="Curator" src={destination.curator.avatar} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{destination.curator.name}</p>
                                    <p className="text-xs text-on-surface-variant font-medium">
                                        {destination.curator.role}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-on-surface-variant italic leading-relaxed">
                                {destination.curator.note}
                            </p>
                        </div>
                    </div>
                    <div className="lg:col-span-8 space-y-10">
                        <div className="columns-1 md:columns-2 gap-10">
                            {destination.paragraphs.map((paragraph, index) => (
                                <p
                                    key={index}
                                    className="font-body text-lg text-on-surface-variant leading-relaxed mb-8 break-inside-avoid"
                                >
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Essential Experiences */}
            <section className="py-24 bg-surface-container-low">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="mb-16">
                        <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-2">
                            Essential Experiences.
                        </h2>
                        <p className="text-on-surface-variant">The definitive list of things you cannot miss.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[800px]">
                        {destination.experiences.map((exp) => (
                            <ExperienceCard key={exp.title} experience={exp} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Refined Stays Nearby */}
            <section className="py-24 bg-surface">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div>
                            <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-2">
                                Refined Stays Nearby.
                            </h2>
                            <p className="text-on-surface-variant max-w-md">
                                Our hand-selected properties that embody the soul of the coast through service and
                                architecture.
                            </p>
                        </div>
                        <Link to="/hotels" className="flex items-center space-x-2 text-primary font-bold group">
                            <span>View All Accommodations</span>
                            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                                arrow_forward
                            </span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {destination.hotels.map((hotel) => (
                            <HotelCard key={hotel.name} hotel={hotel} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-24 px-8 pb-32">
                <div className="max-w-7xl mx-auto editorial-gradient rounded-2xl p-12 md:p-24 text-center text-white">
                    <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                        Want more curated guides?
                    </h2>
                    <p className="text-lg text-primary-fixed-dim max-w-2xl mx-auto mb-10">
                        Join our editorial circle for weekly travel dispatches, hidden gems, and exclusive member-only
                        hotel rates.
                    </p>
                    <form
                        onSubmit={handleNewsletter}
                        className="flex flex-col sm:flex-row justify-center items-center gap-4"
                    >
                        <input
                            className="w-full sm:w-80 bg-white/10 border-0 focus:ring-2 focus:ring-tertiary-fixed-dim rounded-lg px-6 py-4 text-white placeholder:text-white/40"
                            placeholder="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-tertiary-fixed text-on-tertiary-fixed font-bold px-10 py-4 rounded-lg hover:bg-tertiary-fixed-dim transition-colors"
                        >
                            Join Now
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}

export default DestinationDetail;
