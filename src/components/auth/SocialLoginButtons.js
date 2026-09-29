import { useEffect, useState } from "react";
import { OAUTH_PROVIDERS, OAUTH_REDIRECT_KEY, fetchOAuthProviders, oauthAuthorizeUrl } from "../../services/accountService";

/**
 * Nút đăng nhập Google / Facebook / GitHub. Chỉ hiện provider BE đã cấu hình client id/secret —
 * chưa có key nào thì không hiện gì cả.
 */
function SocialLoginButtons({ redirect }) {
    const [providers, setProviders] = useState([]);

    useEffect(() => {
        let cancelled = false;
        fetchOAuthProviders()
            .then((list) => !cancelled && setProviders(list.filter((p) => OAUTH_PROVIDERS[p])))
            .catch(() => !cancelled && setProviders([]));
        return () => {
            cancelled = true;
        };
    }, []);

    if (providers.length === 0) return null;

    const start = (provider) => {
        try {
            if (redirect) sessionStorage.setItem(OAUTH_REDIRECT_KEY, redirect);
            else sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
        } catch {
            /* storage bị chặn: về trang mặc định */
        }
        window.location.assign(oauthAuthorizeUrl(provider));
    };

    return (
        <div className="mt-6">
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                <span className="flex-1 h-px bg-gray-200" />
                or continue with
                <span className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid gap-3">
                {providers.map((provider) => {
                    const meta = OAUTH_PROVIDERS[provider];
                    return (
                        <button
                            key={provider}
                            type="button"
                            onClick={() => start(provider)}
                            className={`w-full flex items-center justify-center gap-3 py-3 rounded-lg font-bold text-sm transition-colors ${meta.className}`}
                        >
                            <span className="w-5 text-center font-black">{meta.icon}</span>
                            Continue with {meta.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default SocialLoginButtons;
