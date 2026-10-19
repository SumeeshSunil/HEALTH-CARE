import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
    const location = useLocation();
    const auth = useSelector((state) => state.auth);

    if (!auth?.user) {
        return null;
    }

    const role = auth.user.role || "patient";
    const isActive = (path) => location.pathname === path;

    const navConfigs = {
        patient: [
            {
                path: "/patient/dashboard",
                label: "Dashboard",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                )
            },
            {
                path: "/patient/doctor-search",
                label: "Find Doctors",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                )
            },
            {
                path: "/patient/my-appointments",
                label: "Appointments",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )
            },
            {
                path: "/patient/medical-history",
                label: "Medical Records",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                )
            },
            {
                path: "/patient/billing",
                label: "Billing & Payments",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                )
            },
            {
                path: "/patient/notifications",
                label: "Notifications",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                )
            },
            {
                path: "/patient/messages",
                label: "Messages",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )
            },
            {
                path: "/patient/profile",
                label: "My Profile",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                )
            }
        ],
        doctor: [
            {
                path: "/doctor/dashboard",
                label: "Doctor Dashboard",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                )
            },
            {
                path: "/doctor/appointments",
                label: "Appointments Queue",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )
            },
            {
                path: "/doctor/schedule",
                label: "My Schedule",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            },
            {
                path: "/doctor/patient-records",
                label: "Patient Records",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                )
            },
            {
                path: "/doctor/messages",
                label: "Patient Messages",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )
            },
            {
                path: "/doctor/issue-certificate",
                label: "Issue Certificate",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                )
            },
            {
                path: "/doctor/profile",
                label: "Doctor Profile",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                )
            }
        ],
        admin: [
            {
                path: "/admin/dashboard",
                label: "Admin Dashboard",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                )
            },
            {
                path: "/admin/appointments",
                label: "All Appointments",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                )
            },
            {
                path: "/admin/schedules",
                label: "Approve & Manage Slots",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )
            },
            {
                path: "/admin/users",
                label: "Manage Users",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                )
            },
            {
                path: "/admin/reports",
                label: "System Reports",
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                )
            }
        ]
    };

    const currentNavItems = navConfigs[role] || navConfigs.patient;

    const sidebarContent = (
        <div className="flex flex-col h-full justify-between overflow-y-auto">
            <div>
                {isCollapsed ? (
                    <div className="flex flex-col items-center justify-center p-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-lg shadow-sm">
                            ✦
                        </div>
                        <button
                            onClick={() => setIsCollapsed && setIsCollapsed(false)}
                            className="mt-2 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                            title="Expand Sidebar"
                        >
                            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="p-3 mb-6 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm shrink-0 border border-teal-500/30">
                                ✦
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider capitalize">
                                    {role} Portal
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    v2.4 Connected
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsCollapsed && setIsCollapsed(true)}
                            className="hidden md:flex text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition shrink-0"
                            title="Collapse Sidebar"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>
                )}

                <nav className="space-y-1">
                    {currentNavItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                                title={isCollapsed ? item.label : ""}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition duration-200 ${
                                    active
                                        ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                                } ${isCollapsed ? "justify-center px-0" : ""}`}
                            >
                                <span className={`shrink-0 ${active ? "text-white" : "text-slate-400"}`}>
                                    {item.icon}
                                </span>
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {!isCollapsed && (
                <div className="mt-8 pt-4 border-t border-slate-800/80 px-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
                        <span className="text-[11px] font-medium text-slate-400 truncate">
                            Clinical System Active
                        </span>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 border-r border-slate-800 p-4 transition-all duration-300 transform md:translate-x-0 ${
                    isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
                } ${isCollapsed ? "md:w-20" : "md:w-64"} md:static md:z-auto md:min-h-[calc(100vh-65px)] shrink-0`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}

export default Sidebar;
