import { Link } from "react-router-dom";

function DemoHome() {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-8">
            <nav className="flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-teal-600 to-teal-400 text-white flex items-center justify-center font-black text-xl shadow-md">
                        ✚
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-none">
                            MEDICO <span className="text-teal-400 text-xs sm:text-sm font-semibold">HEALTH</span>
                        </h1>
                        <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Integrated Clinical Portal
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <Link
                        to="/login"
                        className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-extrabold transition shadow"
                    >
                        Create Account
                    </Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto text-center space-y-6 py-12 sm:py-20">
                <span className="inline-block px-4 py-1.5 bg-teal-500/10 text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-500/20">
                    Next-Gen Healthcare Management System
                </span>

                <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                    Unified Patient Care & <span className="text-teal-400">Clinical Directory</span>
                </h1>

                <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
                    Access doctor appointment scheduling, electronic medical records, lab diagnostics, and online medical billing statement settlement in one secure portal.
                </p>

                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-4">
                    <Link
                        to="/login"
                        className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-teal-500/25"
                    >
                        Launch Portal Sign In →
                    </Link>
                </div>
            </main>

            <footer className="text-center text-[11px] text-slate-500 border-t border-slate-800 pt-6">
                © 2026 Medico Health Integrated Portal. Confidential & Compliant Patient Care.
            </footer>
        </div>
    );
}

export default DemoHome;