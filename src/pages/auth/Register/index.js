import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import FormInput from "../../../components/common/FormInput";
import FormAlert from "../../../components/common/FormAlert";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = "Vui lòng nhập họ tên.";
    if (!EMAIL_REGEX.test(form.email.trim())) errors.email = "Email không hợp lệ.";
    if (form.password.length < 6) errors.password = "Mật khẩu tối thiểu 6 ký tự.";
    if (form.confirmPassword !== form.password) errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    if (!form.agree) errors.agree = "Bạn cần đồng ý điều khoản.";
    return errors;
}

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
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
        const validation = validate(form);
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
            navigate("/", { replace: true });
        } catch (err) {
            setServerError(err.message || "Đăng ký thất bại.");
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
                    <p className="text-gray-500 font-medium">Create an account to start your journey.</p>
                </div>

                {/* Form điền thông tin */}
                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                    <FormAlert>{serverError}</FormAlert>

                    <FormInput
                        label="Full Name"
                        name="fullName"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        value={form.fullName}
                        onChange={handleChange}
                        error={errors.fullName}
                    />
                    <FormInput
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        error={errors.email}
                    />
                    <FormInput
                        label="Phone (optional)"
                        type="tel"
                        name="phone"
                        placeholder="Enter your phone number"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={handleChange}
                    />
                    <FormInput
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={handleChange}
                        error={errors.password}
                    />
                    <FormInput
                        label="Confirm Password"
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
                                I agree to the <Link to="#" className="font-bold text-[#003580] hover:underline">Terms of Service</Link> and{" "}
                                <Link to="#" className="font-bold text-[#003580] hover:underline">Privacy Policy</Link>
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
                        {submitting ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                {/* Footer thẻ Register */}
                <div className="mt-8 text-center text-sm text-gray-600 font-medium">
                    Already have an account?{" "}
                    <Link to="/login" className="font-bold text-[#003580] hover:underline ml-1">
                        Sign in
                    </Link>
                </div>

                {/* Nút Thoát hiểm */}
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

export default Register;
