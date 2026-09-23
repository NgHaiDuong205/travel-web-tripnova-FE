import { Link } from "react-router-dom";

const VALUES = [
    {
        icon: "verified",
        title: "Curated Excellence",
        description:
            "Every destination is hand-vetted by our team of global scouts. We prioritize quality over quantity, ensuring only the most distinguished properties enter our collection.",
    },
    {
        icon: "public",
        title: "Global Insight",
        description:
            "Our network spans six continents, providing boots-on-the-ground intelligence that algorithms cannot replicate. We know the local nuances that make a trip truly authentic.",
    },
    {
        icon: "fluid",
        title: "Seamless Service",
        description:
            "Luxury is defined by the absence of friction. From booking to return, our concierge ecosystem anticipates your needs before you even voice them.",
    },
];

const CURATORS = [
    {
        name: "Elena Vance",
        role: "European Heritage Lead",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBeuHW100ukh1eckle2j2aCYZgEJw_OxXrLwSoVbiMN65aIZZe3MuNK4KWGOTKFSuXGZlYTzIrqnQ9uuCFvSaA_LvHDps3d3_WrfLyEVEAI2HXmELWQ6CXi7pCqtV9hgNr_jfj6GroEe3VaqDuqcRTBiAIwEmukfvxkzi3NTjMIPQPZ70DcIGMxYmUS6nUOtgpOd9rgS5a2x8DQkUpxgpKso2s1a4iMHCdz-ZEM7G_Y9tNg2FnFp7NQMhxUBhp95v15aLbgfhIakiA",
        alt: "professional portrait of a sophisticated woman with dark hair wearing a tailored blazer in a bright, modern office setting",
    },
    {
        name: "Julian Thorne",
        role: "Tropical Luxury Director",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBwuFJ6d-t9gixv9Ko6UolzeSkULhg6pWWt8L0rNdz0ejQNdWMFEsCyPRJuDRRqTszpaBys-ibzO6TfC6zoAr972h4UyWAI4Bb1NF8xV5V44wFuLDOcof-cRJvtO5JyI6VT9JfL1vOIEik93fvfCDuYqmsRlZF2UmZWYOYZzFaaCAwKCEj3fuKoGvN-fGPwPgVXmm4p-yqy0e1oUYi_sEQfpoZI0eNMzPlXDho8oLAFvqDG98sbmtqSbnVJHX8UhA0HEybRKqxY7jc",
        alt: "portrait of a middle-aged man with graying hair in a premium linen shirt, looking confident and relaxed against an urban background",
    },
    {
        name: "Aria Sterling",
        role: "Expedition Curator",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAj2doofz3hSdliOaKWZ4rYcZguUgJaiQ2yTH_SLZ992qe8R_7d5qXcB4rJe7OqN28dQq8m6YxjXgvtfqgxXjGd_RkpFMS7zkpj1a8wB9nCKC6SYPiO7bpw7zlcEQs-XYmj_OXfLPiMroGGSSBkGYEK974LpdfHzfKRx_nxamL06F3tEuGNipWtNjUCBZeG6lH67MQw1VJH2kb-I1sTKI5t7XcH5TyhWLaY7OoF_TqF_e_DbMDR1Jrf8vN9iEDHJ8n5dJMqoLyBbBQ",
        alt: "close up of a professional woman with glasses and a warm smile, wearing minimalist jewelry and a silk top",
    },
    {
        name: "Marcus Chen",
        role: "Aviation Specialist",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuC6qEPTbkZTCHbD5FAkK74MIR7Mu1pIF0p2FU6xafsiT9NjpBnvHVl-OgIPfe6gZoYcHeKVAbOhuK7_DV4d_nMK6H9yA1TH1YtaI_5jfNmfTjPBlBfHh8j8BYUHsSWOPZ3FZpNXdisnsqRyhEqGsAHnNkbvzm5in6aBp5O6w6oAeJCuwOb74uf3cf-bE7Uw_LfGo59cWauF5ccjaS3vU6g4tu0oiD9_7926UZDARZLC3sfYIrbNvem7aXUpAJ-WHXflMDa2TbkGRws",
        alt: "portrait of a young professional man in a dark turtleneck looking thoughtfully away from the camera in a stylish studio",
    },
];

function About() {
    return (
        <div className="bg-surface font-body text-on-surface-variant -mt-20">
            {/* Hero */}
            <section className="relative h-[min(819px,100vh)] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        className="w-full h-full object-cover brightness-75"
                        alt="luxury infinity pool overlooking a Mediterranean coastline at sunset with elegant lounge chairs and warm golden lighting"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHMO9BAvroMAjed6FIjHwTiNNfEFG2GN6m_enI3bvv5h8UyV1FmuSupfH6_neLjJNwWmgmc8NA6aIp8iSNDGUmxb6DlQEPs3p5CYENmazJVgQo5Z09haxuito9dC1YVCg9JbEfWiY5MVM4tHGWMSHF0ECrFhAfqPo7X2lQipSqNCOW-BCHimYSD6PlubzasCh9p6xhdgzNlE38-I3kgMxDoYpSt8aYpDKCUjOhnye4ouTbsoQbyu1tDxErlDbYbnKsAwW6AW7egGc"
                    />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-8 w-full pt-20">
                    <div className="max-w-3xl">
                        <span className="font-label text-white uppercase tracking-[0.2em] text-xs mb-6 block">
                            The Editorial Experience
                        </span>
                        <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tighter mb-8">
                            The Art of the Journey, <span className="italic font-light">Curated.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed max-w-2xl">
                            At TripNova, we believe travel is more than a destination—it is a narrative. Our editorial
                            approach frames every stay, flight, and experience as a chapter in your personal legacy of
                            discovery.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-24 bg-surface">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1">
                            <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-8">
                                Our Narrative
                            </h2>
                            <div className="space-y-6 text-lg leading-relaxed text-on-surface-variant font-light">
                                <p>
                                    Born from a collective of travel editors and luxury concierges, TripNova was
                                    founded to solve the paradox of choice in modern travel. In an era of endless
                                    scrolling, we choose the deliberate path of curation.
                                </p>
                                <p>
                                    We don't just list properties; we audit them. Every partner in our ecosystem is
                                    selected for its architectural integrity, service excellence, and cultural
                                    resonance. We operate as your personal travel curator, filtering out the noise to
                                    reveal the exceptional.
                                </p>
                                <p>
                                    Our mission is simple: to ensure that every moment you spend away from home is an
                                    investment in beauty, comfort, and profound connection.
                                </p>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="rounded-xl overflow-hidden editorial-shadow transform rotate-1 md:rotate-3 hover:rotate-0 transition-transform duration-700">
                                <img
                                    className="w-full h-auto object-cover min-h-[600px]"
                                    alt="vertical artistic shot of a luxury hotel interior with floor-to-ceiling windows showing a mountain view and minimalist furniture"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFAsXmWaSNnOwRc5PKuk5HWnEOtF1JXBaQXzhVybihIaRNomqYx3rxPoQyyRHC_gs4F-Wu6VwCrMB-mUiUW6xqY0P7R6lhXFfFueKNgtSBFzfPVv1Yz_w_k8bnewp2TAtIfaVYIlkSQIbFEPb8MnyTir8WMpDYl9tPJtfS03hBuRYeDJUZSG8pvBF0eXGSOk3pXTm-RRvxaJJsRShIyfoLuxxog-DBCEpmOj616kbi9eWUt2aMWCFv4mv_81CYfTdasqkoel9Hzvs"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-surface-container-low">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-headline text-3xl font-bold text-on-surface">The Nova Standard</h2>
                        <div className="w-20 h-1 primary-gradient mx-auto mt-4" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {VALUES.map((value) => (
                            <div
                                key={value.title}
                                className="bg-surface-container-lowest p-10 rounded-xl editorial-shadow group hover:-translate-y-2 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-lg bg-primary-fixed-dim flex items-center justify-center mb-8 text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">{value.icon}</span>
                                </div>
                                <h3 className="font-headline text-xl font-bold text-on-surface mb-4">{value.title}</h3>
                                <p className="font-light leading-relaxed text-on-surface-variant">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lead Curators */}
            <section className="py-24 bg-surface">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div className="max-w-2xl">
                            <span className="font-label text-primary uppercase tracking-widest text-xs mb-4 block">
                                Meet the Architects of Awe
                            </span>
                            <h2 className="font-headline text-4xl font-bold text-on-surface">The Lead Curators</h2>
                        </div>
                        <p className="text-on-surface-variant font-light max-w-sm">
                            Guided by decades of experience in high-end hospitality and travel journalism.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {CURATORS.map((curator) => (
                            <div key={curator.name} className="space-y-4 group">
                                <div className="aspect-[4/5] rounded-xl overflow-hidden editorial-shadow bg-surface-container">
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt={curator.alt}
                                        src={curator.image}
                                    />
                                </div>
                                <div>
                                    <h4 className="font-headline font-bold text-on-surface">{curator.name}</h4>
                                    <p className="text-sm font-label text-primary uppercase tracking-wider mt-1">
                                        {curator.role}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-primary-container relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <img
                        className="w-full h-full object-cover"
                        alt="subtle aerial texture of ocean waves hitting a sandy beach with deep blue and white foam tones"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCzLpOoMbWTYDJ_XRTIhp1iBmzpVTpkPNHe78m6qay4hgJv34RmqsVSWhEB1sWO_-HBV26Zcf1LhrB0ikNy7e5O-C8wycS1TpzY8qdFadDPd7IceFNQx0CG2FGZi09i0EyHWteXZnSD4yyNC0ReG6GrtbNiTfBD5VqLcf1jqoo7dqOWmw6MkA4IqSR69GUL-GEU_8OOCI_GH3jwXn1YzL5xmLSA5BpP7j6ILCUWwX4LXRGxHGf4XZD9m9FtUsfx8yJ6nry46iKBX0"
                    />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
                    <h2 className="font-headline text-3xl md:text-5xl font-bold text-white mb-8 tracking-tighter">
                        Ready to write your next chapter?
                    </h2>
                    <p className="text-on-primary-container text-lg md:text-xl font-light mb-12">
                        Join our curated world of luxury and experience travel the way it was meant to be.
                    </p>
                    <Link
                        to="/destinations"
                        className="inline-block bg-surface text-primary px-10 py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform editorial-shadow"
                    >
                        Explore Destinations
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default About;
