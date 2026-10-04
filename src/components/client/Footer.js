import { useT } from "../../i18n/I18nContext";
import LanguageSwitcher from "../common/LanguageSwitcher";
import ThemeToggle from "../common/ThemeToggle";
import { displayCurrency } from "../../utils/currency";

function Footer(){
    const t = useT();
    return(
        <>
            <footer className="bg-[#00224f] text-white w-full py-16 px-8 mt-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-screen-2xl mx-auto">
                    
                    {/* Cột 1: Thông tin thương hiệu */}
                    <div className="space-y-6">
                        <div className="text-[28px] font-black italic tracking-tighter text-white">
                            Tripnova
                        </div>
                        <p className="text-white/75 text-sm leading-relaxed">
                            {t("nav.footer.tagline")}
                        </p>
                    </div>
                    
                    {/* Cột 2: Cấu trúc Công ty */}
                    <div className="space-y-6">
                        <h5 className="font-bold tracking-wider uppercase text-white">
                            {t("nav.footer.company")}
                        </h5>
                        <div className="flex flex-col space-y-4">
                            <button type="button" className="text-left text-white/75 text-sm hover:text-white hover:ml-2 transition-all opacity-80 hover:opacity-100">{t("nav.footer.aboutUs")}</button>
                            <button type="button" className="text-left text-white/75 text-sm hover:text-white hover:ml-2 transition-all opacity-80 hover:opacity-100">{t("nav.footer.press")}</button>
                            <button type="button" className="text-left text-white/75 text-sm hover:text-white hover:ml-2 transition-all opacity-80 hover:opacity-100">{t("nav.footer.careers")}</button>
                        </div>
                    </div>

                    {/* Cột 3: Hỗ trợ khách hàng */}
                    <div className="space-y-6">
                        <h5 className="font-bold tracking-wider uppercase text-white">
                            {t("nav.footer.support")}
                        </h5>
                        <div className="flex flex-col space-y-4">
                            <button type="button" className="text-left text-white/75 text-sm hover:text-white hover:ml-2 transition-all opacity-80 hover:opacity-100">{t("nav.footer.helpCenter")}</button>
                            <button type="button" className="text-left text-white/75 text-sm hover:text-white hover:ml-2 transition-all opacity-80 hover:opacity-100">{t("nav.footer.privacy")}</button>
                            <button type="button" className="text-left text-white/75 text-sm hover:text-white hover:ml-2 transition-all opacity-80 hover:opacity-100">{t("nav.footer.terms")}</button>
                        </div>
                    </div>

                    {/* Cột 4: Biểu tượng mạng xã hội */}
                    <div className="space-y-6">
                        <h5 className="font-bold tracking-wider uppercase text-white">
                            {t("nav.footer.connect")}
                        </h5>
                        <div className="flex space-x-4">
                            <button type="button" aria-label={t("nav.footer.website")} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 hover:-translate-y-1 transition-all">
                                <span className="material-symbols-outlined text-lg">public</span>
                            </button>
                            <button type="button" aria-label={t("nav.footer.share")} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 hover:-translate-y-1 transition-all">
                                <span className="material-symbols-outlined text-lg">share</span>
                            </button>
                            <button type="button" aria-label={t("nav.footer.email")} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 hover:-translate-y-1 transition-all">
                                <span className="material-symbols-outlined text-lg">mail</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vạch kẻ dưới cùng */}
                <div className="max-w-screen-2xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="font-body text-xs tracking-wider uppercase text-white/60 opacity-80">
                        {t("nav.footer.rights", { year: new Date().getFullYear() })}
                    </p>
                    <div className="flex items-center gap-2" aria-label={t("nav.footer.preferences")}>
                        <LanguageSwitcher tone="dark" placement="up" />
                        <ThemeToggle tone="dark" />
                        <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase pl-2">{displayCurrency()}</span>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer;