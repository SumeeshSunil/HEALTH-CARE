import { Link } from "react-router-dom";
import dummyPatients from "../../data/dummyPatients.json";
import dummyDoctors from "../../data/dummyDoctors.json";
import dummyBills from "../../data/dummyBills.json";
import Layout from "../../components/Layout";

function AdminDashboard() {
    const totalPatients = dummyPatients.length;
    const totalDoctors = dummyDoctors.length;
    const totalRevenue = dummyBills.reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0);

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                        Administration & Governance
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                        System Control Dashboard
                    </h1>
                    <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed max-w-xl">
                        Monitor hospital facility operations, user access roles, doctor schedules, and billing revenue.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-xl border border-emerald-500/30 text-xs font-bold shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    All Services Online
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Patients</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{totalPatients}</h3>
                    <p className="text-xs text-emerald-600 font-semibold mt-2">Active Accounts</p>
                </div>

                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Doctors</p>
                    <h3 className="text-3xl font-extrabold text-teal-600 mt-2">{totalDoctors}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-2">Licensed Staff</p>
                </div>

                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Billing Revenue</p>
                    <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">₹{totalRevenue.toLocaleString("en-IN")}</h3>
                    <p className="text-xs text-emerald-600 font-semibold mt-2">Quarterly Settlement</p>
                </div>

                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Sessions</p>
                    <h3 className="text-3xl font-extrabold text-sky-600 mt-2">24</h3>
                    <p className="text-xs text-sky-600 font-semibold mt-2">Secure Connections</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/admin/users"
                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition space-y-3"
                >
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 font-extrabold text-xl flex items-center justify-center">
                        👥
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">User Management</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Control account roles for doctors, patients, and administrators.
                    </p>
                </Link>

                <Link
                    to="/admin/schedules"
                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition space-y-3"
                >
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 font-extrabold text-xl flex items-center justify-center">
                        📅
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">Facility Schedules</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Configure clinical operating hours and department room allocations.
                    </p>
                </Link>

                <Link
                    to="/admin/reports"
                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition space-y-3"
                >
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 font-extrabold text-xl flex items-center justify-center">
                        📊
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">System Analytics</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        View financial ledgers, audit trails, and consultation volume graphs.
                    </p>
                </Link>
            </div>
        </Layout>
    );
}

export default AdminDashboard;
