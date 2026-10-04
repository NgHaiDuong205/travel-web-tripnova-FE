import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FormAlert from "../../../components/common/FormAlert";
import { useAuth } from "../../../context/AuthContext";
import { verifyEmail } from "../../../services/accountService";
import { useT } from "../../../i18n/I18nContext";

/** Mở từ link trong email: /verify-email?token=... (link hiện được in ra log BE). */
function VerifyEmail() {
    const t = useT();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const { isLoggedIn, refreshUser } = useAuth();
    const [state, setState] = useState({
        status: token ? "loading" : "error",
        message: token ? "" : t("auth.verifyEmail.invalidLink"),
    });
    const started = useRef(false);

    useEffect(() => {
        // StrictMode gọi effect 2 lần ở dev — chỉ xác thực 1 lần.
        if (!token || started.current) return;
        started.current = true;
        verifyEmail(token)
            .then((user) => {
                setState({ status: "done", message: t("auth.verifyEmail.verified", { email: user.email }) });
                if (isLoggedIn) refreshUser().catch(() => {});
            })
            .catch((err) => setState({ status: "error", message: err.message }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chạy 1 lần; đổi ngôn ngữ không cần gọi lại
    }, [token, isLoggedIn, refreshUser]);

    return (
        <section className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 text-center">
                <span
                    className={`material-symbols-outlined text-5xl mb-4 ${state.status === "error" ? "text-red-500" : "text-[#003580]"}`}
                >
                    {state.status === "error" ? "link_off" : state.status === "done" ? "mark_email_read" : "hourglass_top"}
                </span>
                <h1 className="text-3xl font-black text-[#003580] tracking-tight mb-4">{t("auth.verifyEmail.title")}</h1>
                {state.status === "loading" && <p className="text-gray-500 font-medium">{t("auth.verifyEmail.verifying")}</p>}
                {state.status === "done" && <FormAlert type="success">{state.message}</FormAlert>}
                {state.status === "error" && <FormAlert>{state.message}</FormAlert>}
                <div className="mt-8 text-sm font-medium">
                    {isLoggedIn ? (
                        <Link to="/account/security" className="font-bold text-[#003580] hover:underline">
                            {t("auth.verifyEmail.goToSecurity")}
                        </Link>
                    ) : (
                        <Link to="/login" className="font-bold text-[#003580] hover:underline">
                            {t("auth.login.signIn")}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}

export default VerifyEmail;
