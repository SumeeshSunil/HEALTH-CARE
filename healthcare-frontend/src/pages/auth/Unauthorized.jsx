import { Link } from "react-router-dom";

function Unauthorized() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center text-white">
            <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 border border-slate-700 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mx-auto font-bold">
                    🔒
                </div>
                <h1 className="text-2xl font-black">Access Denied</h1>
                <p className="text-xs text-slate-300 leading-relaxed">
                    You do not have permission to view this clinical portal section.
                </p>
                <Link
                    to="/"
                    className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md"
                >
                    Return to Home Portal
                </Link>
            </div>
        </div>
    );
}

export default Unauthorized;
