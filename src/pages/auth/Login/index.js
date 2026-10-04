import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import FormInput from "../../../components/common/FormInput";
import FormAlert from "../../../components/common/FormAlert";
import SocialLoginButtons from "../../../components/auth/SocialLoginButtons";
import { useT } from "../../../i18n/I18nContext";
import { safeRedirect, withRedirect } from "../../../utils/authRedirect";

function Login() {
    const t = useT();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const redirect = safeRedirect(searchParams.get("redirect"));
    const [account, setAccount] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!account.email.trim() || !account.password) {
            setError(t("auth.login.validation.emailAndPasswordRequired"));
            return;
        }
        setSubmitting(true);
        try {
            const user = await login(account.email.trim(), account.password);
            const roles = user?.roles || [];
            const fallback = roles.includes("ADMIN") ? "/admin" : roles.includes("HOTEL_MANAGER") ? "/manager" : "/";
            navigate(redirect || fallback, {
                replace: true,
            });
        } catch (err) {
            setError(err.message || t("auth.login.errors.failed"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAccount((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError(""); // Xóa thông báo lỗi khi người dùng bắt đầu nhập lại
    };

    return (
        /* Section Login — đã có Header/Footer từ AuthLayout */
        <section className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4">
            {/* Khung Trắng thẻ Login */}
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                {/* Header thẻ Login */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-[#003580] italic tracking-tighter mb-2">Tripnova</h1>
                    <p className="text-gray-500 font-medium">{t("auth.login.subtitle")}</p>
                </div>

                {/* Form điền thông tin */}
                <form className="space-y-6" onSubmit={handleLogin} noValidate>
                    <FormAlert>{error}</FormAlert>

                    <FormInput
                        label={t("auth.fields.emailAddress")}
                        type="email"
                        name="email"
                        placeholder={t("auth.fields.enterEmail")}
                        autoComplete="email"
                        value={account.email}
                        onChange={handleChange}
                    />
                    <FormInput
                        label={t("common.fields.password")}
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={account.password}
                        onChange={handleChange}
                    />

                    <div className="flex items-center justify-end text-sm">
                        <Link to="/forgot-password" className="font-bold text-[#003580] hover:text-blue-800 transition-colors">
                            {t("auth.login.forgotPassword")}
                        </Link>
                    </div>

                    {/* Nút bấm Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#003580] text-white py-3.5 rounded-lg font-bold tracking-wide shadow-md shadow-blue-900/20 hover:bg-blue-800 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting ? t("auth.login.signingIn") : t("auth.login.signIn")}
                    </button>
                </form>

                <SocialLoginButtons redirect={redirect} />

                {/* Footer thẻ Login */}
                <div className="mt-8 text-center text-sm text-gray-600 font-medium">
                    {t("auth.login.noAccount")} {" "}
                    <Link to={withRedirect("/register", redirect)} className="font-bold text-[#003580] hover:underline ml-1">
                        {t("auth.login.signUp")}
                    </Link>
                </div>

                {/* Nút Thoát hiểm (Quay về trang chủ) */}
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

export default Login;
