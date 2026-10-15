import { useEffect, useState } from "react";
import { resendVerificationEmail } from "../../services/accountService";
import { useT } from "../../i18n/I18nContext";

const COOLDOWN_SECONDS = 60;

/**
 * Gửi lại email xác thực cho tài khoản chưa đăng nhập được. BE giới hạn 60 giây / lần và luôn trả 204,
 * nên ở đây chỉ đếm ngược để người dùng không bấm liên tục.
 * `initialCooldown`: vừa gửi xong (VD ngay sau khi đăng ký) thì đếm ngược luôn.
 */
function ResendVerificationButton({ email, initialCooldown = 0 }) {
    const t = useT();
    const [cooldown, setCooldown] = useState(initialCooldown);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (cooldown <= 0) return undefined;
        const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const resend = async () => {
        setSending(true);
        setError("");
        try {
            await resendVerificationEmail(email);
            setSent(true);
            setCooldown(COOLDOWN_SECONDS);
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-2 text-center">
            <button
                type="button"
                onClick={resend}
                disabled={sending || cooldown > 0 || !email}
                className="w-full border border-[#003580] text-[#003580] py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {sending
                    ? t("auth.verification.resending")
                    : cooldown > 0
                        ? t("auth.verification.resendIn", { seconds: cooldown })
                        : t("auth.verification.resend")}
            </button>
            {sent && <p className="text-sm text-green-700">{t("auth.verification.resent", { email })}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}

export default ResendVerificationButton;
