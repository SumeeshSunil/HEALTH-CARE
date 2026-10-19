import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import patients from "../../data/dummyPatients.json";
import doctors from "../../data/dummyDoctors.json";
import bills from "../../data/dummyBills.json";

import Layout from "../../components/Layout";

function PatientDashboard() {
    const auth = useSelector((state) => state.auth);
    const appointments = useSelector((state) => state.appointment?.appointments || []);

    const reduxPatients = useSelector((state) => state.patient?.patients || patients);

    const patientProfile = reduxPatients.find(
        (p) => p.userId === auth?.user?.id || p.email?.toLowerCase() === auth?.user?.email?.toLowerCase() || p.id === auth?.user?.id
    ) || {
        id: auth?.user?.id || 4,
        userId: auth?.user?.id || 4,
        name: auth?.user?.name || "Patient",
        email: auth?.user?.email || "patient@healthcare.com",
        age: 28,
        gender: "Patient",
        phone: "+91 9876543210",
        address: "Kerala"
    };

    const myAppointments = appointments.filter(
        (a) => a.patientId === patientProfile.id || a.patientId === auth?.user?.id
    );

    const upcomingAppointments = myAppointments.filter(
        (a) => a.status !== "cancelled"
    ).length;

    const myBills = bills.filter((b) => b.patientId === patientProfile.id);
    const unpaidBills = myBills.filter((b) => b.status === "unpaid").length;

    const getStatusBadge = (status) => {
        switch (status) {
            case "confirmed":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "pending":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "cancelled":
                return "bg-rose-50 text-rose-700 border-rose-200";
            case "completed":
                return "bg-sky-50 text-sky-700 border-sky-200";
            default:
                return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    return (
        <Layout>
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                        Patient Overview
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                        Welcome back, {auth?.user?.name || patientProfile.name}
                    </h1>
                    <p className="text-slate-300 mt-3 text-xs sm:text-sm leading-relaxed">
                        Access your clinical summaries, upcoming consultations, prescriptions, and medical billing statements in one place.
                    </p>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none hidden md:block"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Upcoming Visits
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                                {upcomingAppointments}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xl shrink-0">
                            📅
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Scheduled & Active</span>
                        <Link to="/patient/my-appointments" className="text-sky-600 font-semibold hover:underline">
                            View details →
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Unpaid Invoices
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2">
                                {unpaidBills}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl shrink-0">
                            💳
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Pending Payments</span>
                        <Link to="/patient/billing" className="text-rose-600 font-semibold hover:underline">
                            Pay balance →
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Health Status
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
                                Active
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
                            🩺
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Records updated</span>
                        <Link to="/patient/medical-history" className="text-teal-600 font-semibold hover:underline">
                            Medical records →
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
                    Quick Healthcare Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        to="/patient/doctor-search"
                        className="group p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-teal-50/60 hover:border-teal-300 transition flex items-center gap-4"
                    >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center text-lg sm:text-xl font-bold shadow-md shadow-teal-600/20 group-hover:scale-105 transition shrink-0">
                            🔍
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-teal-700 transition text-xs sm:text-sm">
                                Book Appointment
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Find specialists & dates
                            </p>
                        </div>
                    </Link>

                    <Link
                        to="/patient/medical-history"
                        className="group p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/60 hover:border-blue-300 transition flex items-center gap-4"
                    >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg sm:text-xl font-bold shadow-md shadow-blue-600/20 group-hover:scale-105 transition shrink-0">
                            📋
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition text-xs sm:text-sm">
                                Medical History
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Diagnoses & lab tests
                            </p>
                        </div>
                    </Link>

                    <Link
                        to="/patient/billing"
                        className="group p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-purple-50/60 hover:border-purple-300 transition flex items-center gap-4"
                    >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center text-lg sm:text-xl font-bold shadow-md shadow-purple-600/20 group-hover:scale-105 transition shrink-0">
                            💳
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-purple-700 transition text-xs sm:text-sm">
                                Invoices & Billing
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Clear unpaid balance
                            </p>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            Upcoming Consultations
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Confirmed and pending doctor visits
                        </p>
                    </div>
                    <Link
                        to="/patient/my-appointments"
                        className="text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-800"
                    >
                        View all →
                    </Link>
                </div>

                <div className="space-y-4">
                    {myAppointments.map((appointment) => {
                        const doctor = doctors.find(
                            (d) => d.id === appointment.doctorId
                        ) || { name: "Doctor", specialization: "Specialist" };

                        return (
                            <div
                                key={appointment.id}
                                className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-teal-300 hover:shadow-sm transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                            >
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900 text-teal-400 font-bold text-base sm:text-lg flex items-center justify-center shrink-0">
                                        {doctor.name.replace(/^Dr\.?\s*/i, "").charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                                            {doctor.name}
                                        </h4>
                                        <p className="text-xs font-semibold text-teal-600 mt-0.5">
                                            {doctor.specialization}
                                        </p>
                                        <div className="flex items-center gap-3 sm:gap-4 mt-1.5 text-[11px] sm:text-xs text-slate-500">
                                            <span>📅 {appointment.date}</span>
                                            <span>🕒 {appointment.time}</span>
                                        </div>
                                    </div>
                                </div>

                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${getStatusBadge(
                                        appointment.status
                                    )}`}
                                >
                                    {appointment.status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Layout>
    );
}

export default PatientDashboard;