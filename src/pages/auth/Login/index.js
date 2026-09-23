import { Link, useNavigate } from "react-router-dom";
import {useContext, useState} from "react";
import { AuthContext } from "../../../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [account,setAccount] = useState({
        email : "",
        password : ""
    });
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        if(account.email === "admin@gmail.com" && account.password === "123"){
            login(); // Đổi state thành đã đăng nhập
            navigate("/"); // Chuyển hướng về trang chủ
        } else {
            setError("Email hoặc mật khẩu không chính xác!");
        }
    };
    const handleChange = (e) => {
        const {name,value} = e.target;
        setAccount(prev => ({
            ...prev,
            [name] : value
        }));
        setError(""); // Xóa thông báo lỗi khi người dùng bắt đầu nhập lại
    }
    return (
        /* Section Login — đã có Header/Footer từ ClientLayout */
        <section className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4">
            
            {/* Khung Trắng thẻ Login */}
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                
                {/* Header thẻ Login */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-[#003580] italic tracking-tighter mb-2">Tripnova</h1>
                    <p className="text-gray-500 font-medium">Welcome back! Please enter your details.</p>
                </div>

                {/* Form điền thông tin */}
                <form className="space-y-6">
                    {/* Bảng báo lỗi */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-200">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#003580] focus:ring-4 focus:ring-[#003580]/10 transition-all outline-none" 
                            placeholder="Enter your email"
                            name = "email"
                            value={account.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#003580] focus:ring-4 focus:ring-[#003580]/10 transition-all outline-none"
                            placeholder="••••••••"
                            name = "password"
                            value={account.password}
                            onChange={handleChange}
                        />
                    </div>
                    
                    {/* Băng Chữ nhỏ */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer group">
                            <input type="checkbox" className="rounded text-[#003580] focus:ring-[#003580] w-4 h-4 cursor-pointer" />
                            <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">Remember for 30 days</span>
                        </label>
                        <Link to="/" className="font-bold text-[#003580] hover:text-blue-800 transition-colors">Forgot password?</Link>
                    </div>
                    
                    {/* Nút bấm Submit khổng lồ */}
                    <button type="button" onClick={handleLogin} className="w-full bg-[#003580] text-white py-3.5 rounded-lg font-bold tracking-wide shadow-md shadow-blue-900/20 hover:bg-blue-800 hover:shadow-lg transition-all active:scale-[0.98]">
                        Sign In
                    </button>
                    <button type="button" className="w-full bg-white text-gray-700 border border-gray-200 py-3.5 rounded-lg font-bold tracking-wide hover:bg-gray-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-3">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
                        Sign in with Google
                    </button>
                </form>

                {/* Footer thẻ Login */}
                <div className="mt-8 text-center text-sm text-gray-600 font-medium">
                    Don't have an account? <Link to="/register" className="font-bold text-[#003580] hover:underline ml-1">Sign up</Link>
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
