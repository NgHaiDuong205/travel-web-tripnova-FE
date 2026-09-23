function Footer(){
    return(
        <>
            <footer className="bg-[#00224f] text-white w-full py-16 px-8 mt-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-screen-2xl mx-auto">
                    
                    {/* Cột 1: Thông tin thương hiệu */}
                    <div className="space-y-6">
                        <div className="text-[28px] font-black italic tracking-tighter text-white">
                            Tripnova
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            The premier choice for the modern, discerning traveler. Redefining
                            what it means to explore the world.
                        </p>
                    </div>
                    
                    {/* Cột 2: Cấu trúc Công ty */}
                    <div className="space-y-6">
                        <h5 className="font-bold tracking-wider uppercase text-white">
                            Company
                        </h5>
                        <div className="flex flex-col space-y-4">
                            <button type="button" className="text-left text-gray-300 text-sm hover:text-white hover:ml-2 transition-all opacity-80 hover:opacity-100">About Us</button>
                            <button type="button" className="text-left text-gray-300 text-sm hover:text-white hover:ml-2 transition-all opacity-80 hover:opacity-100">Press</button>
                            <button type="button" className="text-left text-gray-300 text-sm hover:text-white hover:ml-2 transition-all opacity-80 hover:opacity-100">Careers</button>
                        </div>
                    </div>

                    {/* Cột 3: Hỗ trợ khách hàng */}
                    <div className="space-y-6">
                        <h5 className="font-bold tracking-wider uppercase text-white">
                            Support
                        </h5>
                        <div className="flex flex-col space-y-4">
                            <button type="button" className="text-left text-gray-300 text-sm hover:text-white hover:ml-2 transition-all opacity-80 hover:opacity-100">Help Center</button>
                            <button type="button" className="text-left text-gray-300 text-sm hover:text-white hover:ml-2 transition-all opacity-80 hover:opacity-100">Privacy Policy</button>
                            <button type="button" className="text-left text-gray-300 text-sm hover:text-white hover:ml-2 transition-all opacity-80 hover:opacity-100">Terms of Service</button>
                        </div>
                    </div>

                    {/* Cột 4: Biểu tượng mạng xã hội */}
                    <div className="space-y-6">
                        <h5 className="font-bold tracking-wider uppercase text-white">
                            Connect
                        </h5>
                        <div className="flex space-x-4">
                            <button type="button" aria-label="Website" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 hover:-translate-y-1 transition-all">
                                <span className="material-symbols-outlined text-lg">public</span>
                            </button>
                            <button type="button" aria-label="Share" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 hover:-translate-y-1 transition-all">
                                <span className="material-symbols-outlined text-lg">share</span>
                            </button>
                            <button type="button" aria-label="Email" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 hover:-translate-y-1 transition-all">
                                <span className="material-symbols-outlined text-lg">mail</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vạch kẻ dưới cùng */}
                <div className="max-w-screen-2xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="font-body text-xs tracking-wider uppercase text-gray-400 opacity-80">
                        © 2024 TripNova Editorial Travel. All rights reserved.
                    </p>
                    <div className="flex space-x-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        <span className="hover:text-white cursor-pointer transition-colors">English (US)</span>
                        <span className="hover:text-white cursor-pointer transition-colors">USD</span>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer;