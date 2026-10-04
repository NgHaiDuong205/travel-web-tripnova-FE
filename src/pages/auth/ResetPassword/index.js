import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { resetPassword } from "../../../services/authService";
import FormInput from "../../../components/common/FormInput";
import FormAlert from "../../../components/common/FormAlert";
import { useT } from "../../../i18n/I18nContext";

function ResetPassword() {
    const t = useT();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword.length < 6) {
            setError(t("auth.validation.passwordMinLength"));
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            setError(t("auth.validation.passwordsDoNotMatch"));
            return;
        }
        setSubmitting(true);
        try {
            await resetPassword(token, form.newPassword);
            setDone(true);
            setTimeout(() => navigate("/login", { replace: true }), 1500);
        } catch (err) {
            setError(err.message || t("auth.resetPassword.errors.failed"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-[#003580] tracking-tight mb-2">{t("auth.resetPassword.title")}</h1>
                    <p className="text-gray-500 font-medium">{t("auth.resetPassword.subtitle")}</p>
                </div>

                {!token ? (
                    <FormAlert>{t("auth.resetPassword.invalidLink")}</FormAlert>
                ) : done ? (
                    <FormAlert type="success">{t("auth.resetPassword.success")}</FormAlert>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        <FormAlert>{error}</FormAlert>
                        <FormInput
                            label={t("auth.fields.newPassword")}
                            type="password"
                            name="newPassword"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            value={form.newPassword}
                            onChange={handleChange}
                        />
                        <FormInput
                            label={t("auth.fields.confirmPassword")}
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#003580] text-white py-3.5 rounded-lg font-bold tracking-wide shadow-md hover:bg-blue-800 transition-all disabled:opacity-60"
                        >
                            {submitting ? t("common.state.saving") : t("auth.resetPassword.title")}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center text-sm font-medium">
                    <Link to="/forgot-password" className="font-bold text-[#003580] hover:underline">
                        {t("auth.resetPassword.requestNewLink")}
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default ResetPassword;
