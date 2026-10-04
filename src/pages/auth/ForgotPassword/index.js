import { Link } from "react-router-dom";
import { useState } from "react";
import { forgotPassword } from "../../../services/authService";
import FormInput from "../../../components/common/FormInput";
import FormAlert from "../../../components/common/FormAlert";
import { useT } from "../../../i18n/I18nContext";

function ForgotPassword() {
    const t = useT();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setError(t("auth.validation.emailRequired"));
            return;
        }
        setSubmitting(true);
        try {
            await forgotPassword(email.trim());
            setSent(true);
        } catch (err) {
            setError(err.message || t("auth.forgotPassword.errors.failed"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-[#003580] tracking-tight mb-2">{t("auth.forgotPassword.title")}</h1>
                    <p className="text-gray-500 font-medium">{t("auth.forgotPassword.subtitle")}</p>
                </div>

                {sent ? (
                    <FormAlert type="success">
                        {t("auth.forgotPassword.sent")}
                    </FormAlert>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        <FormAlert>{error}</FormAlert>
                        <FormInput
                            label={t("auth.fields.emailAddress")}
                            type="email"
                            name="email"
                            placeholder={t("auth.fields.enterEmail")}
                            autoComplete="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#003580] text-white py-3.5 rounded-lg font-bold tracking-wide shadow-md hover:bg-blue-800 transition-all disabled:opacity-60"
                        >
                            {submitting ? t("auth.forgotPassword.sending") : t("auth.forgotPassword.sendResetLink")}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center text-sm font-medium">
                    <Link to="/login" className="font-bold text-[#003580] hover:underline">
                        {t("auth.forgotPassword.backToSignIn")}
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default ForgotPassword;
