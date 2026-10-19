import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { loginUser } from "../../redux/slices/authSlice";
import { dashboardFor } from "../../services/session.js";
import { useToast } from "../../components/Toast";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();

    const { loading, isAuthenticated, user } = useSelector((state) => state.auth);
    const [formError, setFormError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setFormError('');
        try {
            const data = await dispatch(loginUser({ email: email.trim(), password })).unwrap();
            setPassword('');
            toast.success('Welcome back, ' + data.user.name + '!', 'Login Successful');
            navigate(dashboardFor(data.user.role), { replace: true });
        } catch (err) { setFormError(err.message || 'Sign-in failed. Try again.'); }
    };
    if (isAuthenticated) return <Navigate to={dashboardFor(user.role)} replace />;

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/40 via-slate-900 to-slate-950 pointer-events-none"></div>

            <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative z-10 space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-teal-600 to-teal-400 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-teal-500/20">
                        ✚
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        MEDICO <span className="text-teal-600">PORTAL</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Enter your registered credentials to sign in
                    </p>
                </div>

                {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
                <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                    <div>
                        <label className="block font-bold text-slate-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            autoComplete="email"
                            placeholder="Enter registered email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 mb-1.5">Security Password</label>
                        <input
                            type="password"
                            autoComplete="current-password"
                            maxLength={128}
                            placeholder="Enter password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 rounded-xl transition shadow-lg text-xs tracking-wider uppercase"
                    >
                        {loading ? "Signing in..." : "Sign In to Account"}
                    </button>
                </form>

                <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-bold text-teal-600 hover:underline">
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;