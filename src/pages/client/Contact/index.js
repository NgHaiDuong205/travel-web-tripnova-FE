import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import FormInput from "../../../components/common/FormInput";
import FormAlert from "../../../components/common/FormAlert";
import CatalogHero from "../../../components/catalog/CatalogHero";
import { fetchContactInfo, sendContactMessage } from "../../../services/contactService";
import { useT } from "../../../i18n/I18nContext";

const HERO_IMAGE = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=2000&q=80";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function InfoRow({ icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-fixed-dim/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">{icon}</span>
            </div>
            <div>
                <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">{label}</p>
                <p className="font-semibold text-on-surface">{value}</p>
            </div>
        </div>
    );
}

function Contact() {
    const t = useT();
    const { user } = useAuth();
    const [info, setInfo] = useState(null);
    const [form, setForm] = useState({ fullName: "", email: "", phone: "", subject: "", message: "" });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ type: "", text: "" });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchContactInfo().then(setInfo).catch(() => null);
    }, []);

    // Điền sẵn thông tin khi đã đăng nhập.
    useEffect(() => {
        if (user) {
            setForm((prev) => ({
                ...prev,
                fullName: prev.fullName || user.fullName || "",
                email: prev.email || user.email || "",
                phone: prev.phone || user.phone || "",
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
        setStatus({ type: "", text: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validation = {};
        if (!form.fullName.trim()) validation.fullName = t("contact.validation.fullNameRequired");
        if (!EMAIL_REGEX.test(form.email.trim())) validation.email = t("contact.validation.emailInvalid");
        if (!form.message.trim()) validation.message = t("contact.validation.messageRequired");
        setErrors(validation);
        if (Object.keys(validation).length) return;

        setSending(true);
        try {
            await sendContactMessage({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim() || undefined,
                subject: form.subject.trim() || undefined,
                message: form.message.trim(),
            });
            setForm((prev) => ({ ...prev, subject: "", message: "" }));
            setStatus({ type: "success", text: t("contact.status.sent") });
        } catch (err) {
            setStatus({ type: "error", text: err.message });
        } finally {
            setSending(false);
        }
    };

    return (
        <main>
            <CatalogHero
                image={HERO_IMAGE}
                alt={t("contact.hero.imageAlt")}
                eyebrow={t("contact.hero.eyebrow")}
                title={t("contact.hero.title")}
                subtitle={t("contact.hero.subtitle")}
                heightClass="md:h-[440px]"
            />

            <div className="max-w-screen-xl mx-auto px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <aside className="lg:col-span-4 space-y-8">
                        <InfoRow icon="mail" label={t("common.fields.email")} value={info?.email} />
                        <InfoRow icon="call" label={t("common.fields.phone")} value={info?.phone} />
                        <InfoRow icon="location_on" label={t("contact.fields.address")} value={info?.address} />
                        <InfoRow icon="schedule" label={t("contact.fields.workingHours")} value={info?.workingHours} />
                    </aside>

                    <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-10 space-y-6" noValidate>
                        <FormAlert type={status.type}>{status.text}</FormAlert>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label={t("common.fields.fullName")} name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} maxLength={150} />
                            <FormInput label={t("common.fields.email")} type="email" name="email" value={form.email} onChange={handleChange} error={errors.email} maxLength={150} />
                            <FormInput label={t("contact.fields.phoneOptional")} type="tel" name="phone" value={form.phone} onChange={handleChange} maxLength={30} />
                            <FormInput label={t("contact.fields.subjectOptional")} name="subject" value={form.subject} onChange={handleChange} maxLength={255} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t("contact.fields.message")}</label>
                            <textarea
                                name="message"
                                rows={6}
                                maxLength={5000}
                                value={form.message}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg bg-gray-50 border focus:bg-white focus:ring-4 transition-all outline-none ${
                                    errors.message
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                        : "border-gray-200 focus:border-[#003580] focus:ring-[#003580]/10"
                                }`}
                            />
                            {errors.message && <p className="mt-1 text-xs font-medium text-red-600">{errors.message}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={sending}
                            className="bg-[#003580] text-white px-8 py-3.5 rounded-lg font-bold shadow-md hover:bg-blue-800 transition-all disabled:opacity-60"
                        >
                            {sending ? t("contact.actions.sending") : t("contact.actions.sendMessage")}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default Contact;
