import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { payBill } from "../../redux/slices/billingSlice";
import { addNotification } from "../../redux/slices/notificationSlice";
import bills from "../../data/dummyBills.json";
import patients from "../../data/dummyPatients.json";
import Layout from "../../components/Layout";
import { useToast } from "../../components/Toast";

function PatientBilling() {
    const dispatch = useDispatch();
    const toast = useToast();
    const auth = useSelector((state) => state.auth);
    const reduxBills = useSelector((state) => state.billing?.bills || bills);

    const [selectedTab, setSelectedTab] = useState("all");
    const [activePayBill, setActivePayBill] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("UPI / GPay");

    const reduxPatients = useSelector((state) => state.patient?.patients || patients);

    const currentPatient = reduxPatients.find(
        (p) => p.userId === auth?.user?.id || p.email?.toLowerCase() === auth?.user?.email?.toLowerCase() || p.id === auth?.user?.id
    ) || {
        id: auth?.user?.id || 4,
        userId: auth?.user?.id || 4,
        name: auth?.user?.name || "Patient",
        email: auth?.user?.email || "patient@healthcare.com"
    };

    const myBills = reduxBills.filter(
        (b) => b.patientId === currentPatient.id || b.patientId === auth?.user?.id
    );

    const filteredBills = myBills.filter((b) => {
        if (selectedTab === "all") return true;
        return b.status === selectedTab;
    });

    const totalUnpaid = myBills
        .filter((b) => b.status === "unpaid")
        .reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0);

    const handleConfirmPayment = (e) => {
        e.preventDefault();
        if (!activePayBill) return;

        const bill = activePayBill;
        const amount = bill.totalAmount || bill.amount || 0;

        dispatch(payBill({
            billId: bill.id,
            paymentMethod: paymentMethod
        }));

        dispatch(addNotification({
            title: "Payment Receipt Issued",
            message: `Payment of ₹${amount.toLocaleString("en-IN")} for Invoice #${bill.id} was processed via ${paymentMethod}.`,
            type: "billing",
            userId: currentUserId
        }));

        toast.success(
            `Invoice #${bill.id} settled for ₹${amount.toLocaleString("en-IN")} via ${paymentMethod}.`,
            "Payment Successful"
        );

        setActivePayBill(null);
    };

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                        Financial Statements
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                        Billing & Payment Ledger
                    </h1>
                    <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed max-w-xl">
                        Manage medical invoices, consultation fees, lab charges, and settlement receipts in INR (₹).
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl w-full md:w-auto text-left md:text-right shrink-0">
                    <p className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">
                        Outstanding Balance
                    </p>
                    <h2 className="text-3xl font-black text-white mt-1">
                        ₹{totalUnpaid.toLocaleString("en-IN")}
                    </h2>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center gap-2 overflow-x-auto">
                {["all", "unpaid", "paid"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition shrink-0 ${
                            selectedTab === tab
                                ? "bg-slate-900 text-white shadow-sm"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        {tab} Invoices ({tab === "all" ? myBills.length : myBills.filter(b => b.status === tab).length})
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredBills.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl mb-3">
                            💳
                        </div>
                        <h3 className="font-bold text-slate-800 text-base">No invoice records</h3>
                        <p className="text-xs text-slate-500 mt-1">No billing records found under the current filter.</p>
                    </div>
                ) : (
                    filteredBills.map((bill) => {
                        const amount = bill.totalAmount || bill.amount || 0;
                        return (
                            <div
                                key={bill.id}
                                className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:border-teal-300 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            >
                                <div className="flex items-start sm:items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 font-bold ${
                                        bill.status === "paid"
                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                            : "bg-rose-50 text-rose-600 border border-rose-200"
                                    }`}>
                                        {bill.status === "paid" ? "✓" : "!"}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-extrabold text-slate-900 text-base">
                                                Invoice #{bill.id}
                                            </h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                bill.status === "paid"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                            }`}>
                                                {bill.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium mt-1">
                                            Service: {bill.description || "Clinical Consultation & Medical Care"}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            Issue Date: {bill.date || "2026-07-20"} {bill.paymentMethod ? `• Paid via ${bill.paymentMethod}` : ""}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    <div className="text-left md:text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Amount Due</p>
                                        <p className="text-xl font-black text-slate-900">₹{amount.toLocaleString("en-IN")}</p>
                                    </div>

                                    {bill.status === "unpaid" ? (
                                        <button
                                            onClick={() => setActivePayBill(bill)}
                                            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-teal-600/20"
                                        >
                                            Pay via UPI / Card
                                        </button>
                                    ) : (
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                                            Settled ✓
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {activePayBill && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                                    Secure Gateway Checkout
                                </span>
                                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                                    Settle Invoice #{activePayBill.id}
                                </h2>
                            </div>
                            <button
                                onClick={() => setActivePayBill(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                            <div className="flex justify-between font-medium text-slate-600">
                                <span>Patient:</span>
                                <strong className="text-slate-900">{currentPatient.name}</strong>
                            </div>
                            <div className="flex justify-between font-medium text-slate-600">
                                <span>Service:</span>
                                <span className="text-slate-800">{activePayBill.description || "Consultation Fee"}</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                                <span>Total Amount:</span>
                                <span className="text-teal-700">₹{(activePayBill.totalAmount || activePayBill.amount || 0).toLocaleString("en-IN")}</span>
                            </div>
                        </div>

                        <form onSubmit={handleConfirmPayment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">
                                    Select Payment Method
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { id: "UPI / GPay", label: "📱 UPI (Google Pay / PhonePe / Paytm)" },
                                        { id: "Credit/Debit Card", label: "💳 Credit / Debit Card" },
                                        { id: "Net Banking", label: "🏦 Net Banking (HDFC, SBI, ICICI)" }
                                    ].map((m) => (
                                        <label
                                            key={m.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                                                paymentMethod === m.id
                                                    ? "bg-teal-50 border-teal-500 text-teal-900"
                                                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="payMethod"
                                                value={m.id}
                                                checked={paymentMethod === m.id}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="accent-teal-600"
                                            />
                                            {m.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setActivePayBill(null)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-xs font-extrabold transition shadow-lg shadow-teal-600/20"
                                >
                                    Confirm &amp; Pay ₹{(activePayBill.totalAmount || activePayBill.amount || 0).toLocaleString("en-IN")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default PatientBilling;
