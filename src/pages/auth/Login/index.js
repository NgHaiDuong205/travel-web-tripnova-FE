import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import FormInput from "../../../components/common/FormInput";
import FormAlert from "../../../components/common/FormAlert";

/** Chỉ cho phép redirect nội bộ (bắt đầu bằng "/") để tránh open-redirect. */
function safeRedirect(value) {
    return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const [account, setAccount] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!account.email.trim() || !account.password) {
            setError("Vui lòng nhập email và mật khẩu.");
            return;
        }
        setSubmitting(true);
        try {
            const user = await login(account.email.trim(), account.password);
            const fallback = user?.roles?.includes("ADMIN") ? "/admin" : "/";
            navigate(searchParams.get("redirect") ? safeRedirect(searchParams.get("redirect")) : fallback, {
                replace: true,
            });
        } catch (err) {
            setError(err.message || "Đăng nhập thất bại.");
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
                    <p className="text-gray-500 font-medium">Welcome back! Please enter your details.</p>
                </div>

                {/* Form điền thông tin */}
                <form className="space-y-6" onSubmit={handleLogin} noValidate>
                    <FormAlert>{error}</FormAlert>

                    <FormInput
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        value={account.email}
                        onChange={handleChange}
                    />
                    <FormInput
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={account.password}
                        onChange={handleChange}
                    />

                    <div className="flex items-center justify-end text-sm">
                        <Link to="/forgot-password" className="font-bold text-[#003580] hover:text-blue-800 transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    {/* Nút bấm Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#003580] text-white py-3.5 rounded-lg font-bold tracking-wide shadow-md shadow-blue-900/20 hover:bg-blue-800 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                {/* Footer thẻ Login */}
                <div className="mt-8 text-center text-sm text-gray-600 font-medium">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-bold text-[#003580] hover:underline ml-1">
                        Sign up
                    </Link>
                </div>

                {/* Nút Thoát hiểm (Quay về trang chủ) */}
                <div className="mt-8 text-center">
                    <Link to="/" className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 font-bold text-sm transition-colors opacity-80 hover:opacity-100">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Home
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default Login;
