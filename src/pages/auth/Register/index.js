import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import FormInput from "../../../components/common/FormInput";
import FormAlert from "../../../components/common/FormAlert";
import { useT } from "../../../i18n/I18nContext";
import { safeRedirect, withRedirect } from "../../../utils/authRedirect";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form, t) {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = t("auth.validation.fullNameRequired");
    if (!EMAIL_REGEX.test(form.email.trim())) errors.email = t("auth.validation.emailInvalid");
    if (form.password.length < 6) errors.password = t("auth.validation.passwordMinLength");
    if (form.confirmPassword !== form.password) errors.confirmPassword = t("auth.validation.passwordsDoNotMatch");
    if (!form.agree) errors.agree = t("auth.validation.termsRequired");
    return errors;
}

function Register() {
    const t = useT();
    const navigate = useNavigate();
    const { register } = useAuth();
    const [searchParams] = useSearchParams();
    const redirect = safeRedirect(searchParams.get("redirect"));
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        agree: false,
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
        setServerError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validation = validate(form, t);
        setErrors(validation);
        if (Object.keys(validation).length) return;

        setSubmitting(true);
        try {
            await register({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim() || undefined,
                password: form.password,
            });
            navigate(redirect || "/", { replace: true });
        } catch (err) {
            setServerError(err.message || t("auth.register.errors.failed"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        /* Section Register — đã có Header/Footer từ AuthLayout */
        <section className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4">
            {/* Khung Trắng thẻ Register */}
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 my-8">
                {/* Header thẻ Register */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-[#003580] italic tracking-tighter mb-2">Tripnova</h1>
                    <p className="text-gray-500 font-medium">{t("auth.register.subtitle")}</p>
                </div>

                {/* Form điền thông tin */}
                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                    <FormAlert>{serverError}</FormAlert>

                    <FormInput
                        label={t("common.fields.fullName")}
                        name="fullName"
                        placeholder={t("auth.fields.enterFullName")}
                        autoComplete="name"
                        value={form.fullName}
                        onChange={handleChange}
                        error={errors.fullName}
                    />
                    <FormInput
                        label={t("auth.fields.emailAddress")}
                        type="email"
                        name="email"
                        placeholder={t("auth.fields.enterEmail")}
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        error={errors.email}
                    />
                    <FormInput
                        label={t("auth.fields.phoneOptional")}
                        type="tel"
                        name="phone"
                        placeholder={t("auth.fields.enterPhone")}
                        autoComplete="tel"
                        value={form.phone}
                        onChange={handleChange}
                    />
                    <FormInput
                        label={t("common.fields.password")}
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={handleChange}
                        error={errors.password}
                    />
                    <FormInput
                        label={t("auth.fields.confirmPassword")}
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                    />

                    {/* Checkbox điều khoản */}
                    <div className="text-sm">
                        <label className="flex items-start space-x-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="agree"
                                checked={form.agree}
                                onChange={handleChange}
                                className="rounded text-[#003580] focus:ring-[#003580] w-4 h-4 mt-0.5 cursor-pointer"
                            />
                            <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors leading-relaxed">
                                {t("auth.register.agreePrefix")} <Link to="#" className="font-bold text-[#003580] hover:underline">{t("auth.register.termsOfService")}</Link> {t("auth.register.agreeAnd")} {" "}
                                <Link to="#" className="font-bold text-[#003580] hover:underline">{t("auth.register.privacyPolicy")}</Link>
                            </span>
                        </label>
                        {errors.agree && <p className="mt-1 text-xs font-medium text-red-600">{errors.agree}</p>}
                    </div>

                    {/* Nút bấm Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#003580] text-white py-3.5 rounded-lg font-bold tracking-wide shadow-md shadow-blue-900/20 hover:bg-blue-800 hover:shadow-lg transition-all active:scale-[0.98] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting ? t("auth.register.creatingAccount") : t("auth.register.createAccount")}
                    </button>
                </form>

                {/* Footer thẻ Register */}
                <div className="mt-8 text-center text-sm text-gray-600 font-medium">
                    {t("auth.register.hasAccount")} {" "}
                    <Link to={withRedirect("/login", redirect)} className="font-bold text-[#003580] hover:underline ml-1">
                        {t("auth.login.signIn")}
                    </Link>
                </div>

                {/* Nút Thoát hiểm */}
                <div className="mt-8 text-center">
                    <Link to="/" className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 font-bold text-sm transition-colors opacity-80 hover:opacity-100">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        {t("auth.backToHome")}
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default Register;
