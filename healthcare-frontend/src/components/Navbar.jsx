import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

import { logout } from "../redux/slices/authSlice";

function Navbar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const auth = useSelector((state) => state.auth);
    const notifications = useSelector((state) => state.notifications?.notifications || []);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    if (!auth?.user) {
        return null;
    }

    const currentUserId = auth?.user?.id;
    const currentUserEmail = auth?.user?.email?.toLowerCase();
    const unreadCount = notifications.filter(
        (n) => n.unread && (!n.userId || String(n.userId) === String(currentUserId) || (n.userEmail && n.userEmail.toLowerCase() === currentUserEmail))
    ).length;

    const handleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const getDashboardPath = () => {
        if (auth.user.role === "doctor") return "/doctor/dashboard";
        if (auth.user.role === "admin") return "/admin/dashboard";
        return "/patient/dashboard";
    };

    return (
        <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex justify-between items-center relative z-40 sticky top-0 shadow-sm">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsMobileOpen && setIsMobileOpen(!isMobileOpen)}
                    className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                    title="Toggle Menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <button
                    onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                </button>

                <div
                    onClick={() => navigate(getDashboardPath())}
                    className="flex items-center gap-2.5 cursor-pointer"
                >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-teal-600 to-teal-400 text-white flex items-center justify-center font-black text-lg shadow-sm hover:opacity-90 transition">
                        ✚
                    </div>

                    <div>
                        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                            MEDICO <span className="text-teal-600 text-xs sm:text-sm font-semibold">HEALTH</span>
                        </h1>
                        <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider hidden sm:block">
                            Clinical Web Portal
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <Link
                    to="/patient/notifications"
                    className="p-2 rounded-full text-slate-500 hover:text-teal-600 hover:bg-slate-100 transition relative"
                    title="Notifications"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-teal-600 text-white font-extrabold text-[10px] flex items-center justify-center ring-2 ring-white">
                            {unreadCount}
                        </span>
                    )}
                </Link>

                <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

                <div className="relative">
                    <button
                        onClick={handleDropdown}
                        className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-2.5 sm:px-3 py-1.5 rounded-full transition duration-200"
                    >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm uppercase shadow-sm">
                            {auth.user.name ? auth.user.name.charAt(0) : "U"}
                        </div>

                        <div className="text-left hidden sm:block">
                            <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                                {auth.user.name}
                            </p>
                            <p className="text-[10px] text-teal-600 font-semibold capitalize mt-0.5">
                                {auth.user.role}
                            </p>
                        </div>

                        <svg
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                    Signed in as
                                </p>
                                <h3 className="font-bold text-slate-900 text-sm truncate mt-0.5">
                                    {auth.user.name}
                                </h3>
                                <p className="text-xs text-teal-600 font-medium capitalize">
                                    {auth.user.role} Account
                                </p>
                            </div>

                            {auth.user.role === "patient" && (
                                <Link
                                    to="/patient/profile"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition border-b border-slate-100"
                                >
                                    <span>👤</span> My Account Profile
                                </Link>
                            )}

                            {auth.user.role === "doctor" && (
                                <Link
                                    to="/doctor/profile"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition border-b border-slate-100"
                                >
                                    <span>🩺</span> Doctor Profile
                                </Link>
                            )}

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                            >
                                <span>🚪</span> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;