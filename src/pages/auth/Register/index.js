import { Link } from "react-router-dom";

function Register() {
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
                <form className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#003580] focus:ring-4 focus:ring-[#003580]/10 transition-all outline-none" 
                            placeholder="Enter your full name" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#003580] focus:ring-4 focus:ring-[#003580]/10 transition-all outline-none" 
                            placeholder="Enter your email" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#003580] focus:ring-4 focus:ring-[#003580]/10 transition-all outline-none" 
                            placeholder="••••••••" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#003580] focus:ring-4 focus:ring-[#003580]/10 transition-all outline-none" 
                            placeholder="••••••••" 
                        />
                    </div>
                    
                    {/* Checkbox điều khoản */}
                    <div className="flex items-center text-sm">
                        <label className="flex items-start space-x-2 cursor-pointer group">
                            <input type="checkbox" className="rounded text-[#003580] focus:ring-[#003580] w-4 h-4 mt-0.5 cursor-pointer" />
                            <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors leading-relaxed">
                                I agree to the <Link to="#" className="font-bold text-[#003580] hover:underline">Terms of Service</Link> and <Link to="#" className="font-bold text-[#003580] hover:underline">Privacy Policy</Link>
                            </span>
                        </label>
                    </div>
                    
                    {/* Nút bấm Submit */}
                    <button type="button" className="w-full bg-[#003580] text-white py-3.5 rounded-lg font-bold tracking-wide shadow-md shadow-blue-900/20 hover:bg-blue-800 hover:shadow-lg transition-all active:scale-[0.98] mt-2">
                        Create Account
                    </button>
                    <button type="button" className="w-full bg-white text-gray-700 border border-gray-200 py-3.5 rounded-lg font-bold tracking-wide hover:bg-gray-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-3">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
                        Sign up with Google
                    </button>
                </form>

                {/* Footer thẻ Register */}
                <div className="mt-8 text-center text-sm text-gray-600 font-medium">
                    Already have an account? <Link to="/login" className="font-bold text-[#003580] hover:underline ml-1">Sign in</Link>
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
