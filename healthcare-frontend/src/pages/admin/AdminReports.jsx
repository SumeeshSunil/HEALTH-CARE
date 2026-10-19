import dummyBills from "../../data/dummyBills.json";
import Layout from "../../components/Layout";

function AdminReports() {
    const totalCollected = dummyBills.filter((b) => b.status === "paid").reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0);
    const totalPending = dummyBills.filter((b) => b.status === "unpaid").reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0);

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                    Business Analytics
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    Clinical Financial & Operational Analytics
                </h1>
                <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed max-w-xl">
                    Comprehensive audit summaries, invoice collection stats, and appointment performance metrics in INR (₹).
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Settled Collections</p>
                    <h2 className="text-3xl font-black text-emerald-600">₹{totalCollected.toLocaleString("en-IN")}</h2>
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                        <p className="text-xs font-bold text-emerald-800">100% Verified Ledger Transactions (UPI / Cards)</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending Receivables</p>
                    <h2 className="text-3xl font-black text-rose-600">₹{totalPending.toLocaleString("en-IN")}</h2>
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                        <p className="text-xs font-bold text-rose-800">Automated Reminders Active</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default AdminReports;
