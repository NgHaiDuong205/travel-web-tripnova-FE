/** Khung hero dùng chung cho các trang danh mục. */
function CatalogHero({ image, alt, eyebrow, title, subtitle, children, heightClass = "h-[620px]" }) {
    return (
        <section className={`relative ${heightClass} w-full overflow-hidden`}>
            <img src={image} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary/20 backdrop-brightness-90" />
            <div className="relative z-10 max-w-screen-2xl mx-auto px-8 h-full flex flex-col justify-center">
                <div className="max-w-2xl mb-12">
                    {eyebrow && (
                        <p className="text-white/90 text-[0.75rem] uppercase tracking-[0.2em] font-bold mb-4">{eyebrow}</p>
                    )}
                    <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
                        {title}
                    </h1>
                    {subtitle && <p className="text-white/90 text-lg max-w-lg font-medium">{subtitle}</p>}
                </div>
                {children}
            </div>
        </section>
    );
}

export default CatalogHero;
