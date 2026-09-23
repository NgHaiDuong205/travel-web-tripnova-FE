import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import FormInput from "../../../components/common/FormInput";
import FormAlert from "../../../components/common/FormAlert";
import { fetchContactInfo, sendContactMessage } from "../../../services/contactService";

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
        if (!form.fullName.trim()) validation.fullName = "Vui lòng nhập họ tên.";
        if (!EMAIL_REGEX.test(form.email.trim())) validation.email = "Email không hợp lệ.";
        if (!form.message.trim()) validation.message = "Vui lòng nhập nội dung.";
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
            setStatus({ type: "success", text: "Đã gửi tin nhắn. Chúng tôi sẽ phản hồi qua email sớm nhất." });
        } catch (err) {
            setStatus({ type: "error", text: err.message });
        } finally {
            setSending(false);
        }
    };

    return (
        <main className="max-w-screen-xl mx-auto px-8 pt-32 pb-24">
            <div className="mb-12">
                <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-3 block">Get in touch</span>
                <h1 className="text-5xl font-headline font-extrabold text-primary tracking-tight">Contact us</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <aside className="lg:col-span-4 space-y-8">
                    <InfoRow icon="mail" label="Email" value={info?.email} />
                    <InfoRow icon="call" label="Phone" value={info?.phone} />
                    <InfoRow icon="location_on" label="Address" value={info?.address} />
                    <InfoRow icon="schedule" label="Working hours" value={info?.workingHours} />
                </aside>

                <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-10 space-y-6" noValidate>
                    <FormAlert type={status.type}>{status.text}</FormAlert>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} maxLength={150} />
                        <FormInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} error={errors.email} maxLength={150} />
                        <FormInput label="Phone (optional)" type="tel" name="phone" value={form.phone} onChange={handleChange} maxLength={30} />
                        <FormInput label="Subject (optional)" name="subject" value={form.subject} onChange={handleChange} maxLength={255} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
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
                        {sending ? "Sending..." : "Send message"}
                    </button>
                </form>
            </div>
        </main>
    );
}

export default Contact;
