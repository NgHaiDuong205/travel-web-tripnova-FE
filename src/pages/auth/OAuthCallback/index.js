import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import { useAuth } from "../../../context/AuthContext";
import { OAUTH_PROVIDERS, OAUTH_REDIRECT_KEY, exchangeOAuthCode } from "../../../services/accountService";
import { useT } from "../../../i18n/I18nContext";
import { safeRedirect } from "../../../utils/authRedirect";

function takeRedirect() {
    try {
        const value = sessionStorage.getItem(OAUTH_REDIRECT_KEY);
        sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
        return safeRedirect(value);
    } catch {
        return null;
    }
}

/**
 * BE redirect về đây sau khi đi qua Google/Facebook/GitHub:
 * ?code= (đổi lấy JWT) · ?linked={provider} (liên kết xong) · ?error= (thông báo lỗi).
 */
function OAuthCallback() {
    const t = useT();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refreshUser } = useAuth();
    const [error, setError] = useState("");
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        const code = searchParams.get("code");
        const linked = searchParams.get("linked");
        const failure = searchParams.get("error");
        if (failure) {
            takeRedirect();
            setError(failure);
            return;
        }
        if (linked) {
            navigate(`/account/security?linked=${encodeURIComponent(linked)}`, { replace: true });
            return;
        }
        if (!code) {
            setError(t("auth.oauth.missingCode"));
            return;
        }
        exchangeOAuthCode(code)
            .then(() => refreshUser())
            .then((user) => {
                const fallback = user?.roles?.includes("ADMIN") ? "/admin" : "/";
                navigate(takeRedirect() || fallback, { replace: true });
            })
            .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chạy 1 lần; đổi ngôn ngữ không cần gọi lại
    }, [searchParams, navigate, refreshUser]);

    const linkedLabel = OAUTH_PROVIDERS[searchParams.get("linked")]?.label;

    return (
        <section className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 text-center">
                <h1 className="text-3xl font-black text-[#003580] tracking-tight mb-4">
                    {error ? t("auth.oauth.signInFailed") : linkedLabel ? t("auth.oauth.linked", { provider: linkedLabel }) : t("auth.oauth.signingIn")}
                </h1>
                {error ? <FormAlert>{error}</FormAlert> : <p className="text-gray-500 font-medium">{t("auth.oauth.wait")}</p>}
                {error && (
                    <div className="mt-8 flex justify-center gap-6 text-sm font-bold">
                        <Link to="/login" className="text-[#003580] hover:underline">
                            {t("auth.forgotPassword.backToSignIn")}
                        </Link>
                        <Link to="/" className="text-gray-500 hover:underline">
                            {t("nav.home")}
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

export default OAuthCallback;
