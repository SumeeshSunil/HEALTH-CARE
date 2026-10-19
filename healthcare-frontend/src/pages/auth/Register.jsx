import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { registerPatient } from "../../redux/slices/authSlice";
import { dashboardFor } from "../../services/session.js";
import { useToast } from "../../components/Toast";

function Register() {
    const role = "patient";
    const { loading, isAuthenticated, user } = useSelector((state) => state.auth);
    const [formError, setFormError] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [address, setAddress] = useState("");
    const [mobile, setMobile] = useState("");
    const [dob, setDob] = useState("");


    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setFormError('');
        try {
            const data = await dispatch(registerPatient({ name: name.trim(), email: email.trim(), password, address, mobile, dob })).unwrap();
            setPassword('');
            toast.success('Welcome, ' + data.user.name + '!', 'Registration Successful');
            navigate(dashboardFor(data.user.role), { replace: true });
        } catch (err) { setFormError(err.message || 'Registration failed. Try again.'); }
    };
    if (isAuthenticated) return <Navigate to={dashboardFor(user.role)} replace />;

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/40 via-slate-900 to-slate-950 pointer-events-none"></div>

            <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative z-10 space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-teal-600 to-teal-400 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-teal-500/20">
                        ✚
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        CREATE <span className="text-teal-600">ACCOUNT</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Create your patient account
                    </p>
                </div>

                {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
                <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                    <div>
                        <label className="block font-bold text-slate-700 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            autoComplete="name"
                            maxLength={100}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            autoComplete="email"
                            maxLength={254}
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 mb-1.5">Password</label>
                        <input
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={128}
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                            required
                        />
                    </div>

                    {role === "patient" && (
                        <div className="space-y-4 pt-2 border-t border-slate-100">
                            <p className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">Patient Demographic Details</p>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Residential Address</label>
                                <input
                                    type="text"
                                    placeholder="Enter your address"
                                    maxLength={500}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Mobile Number</label>
                                    <input
                                        type="tel"
                                        maxLength={30}
                                        placeholder="+91 9876543210"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Date of Birth</label>
                                    <input
                                        type="date"
                                        max={new Date().toISOString().slice(0, 10)}
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                    />
                                </div>
                            </div>
                        </div>
                    )}



                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 rounded-xl transition shadow-lg text-xs tracking-wider uppercase"
                    >
                        {loading ? "Creating account..." : "Register Account"}
                    </button>
                </form>

                <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                    Already registered?{" "}
                    <Link to="/login" className="font-bold text-teal-600 hover:underline">
                        Sign in here
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;