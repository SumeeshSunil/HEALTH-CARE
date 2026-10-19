import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import doctors from "../../data/dummyDoctors.json";
import patients from "../../data/dummyPatients.json";
import appointments from "../../data/dummyAppointments.json";
import Layout from "../../components/Layout";

function DoctorDashboard() {
    const auth = useSelector((state) => state.auth);
    const reduxAppointments = useSelector((state) => state.appointment?.appointments || appointments);

    const doctorProfile = doctors.find((d) => d.name === auth?.user?.name || d.userId === auth?.user?.id) || doctors[0];
    const doctorAppointments = reduxAppointments.filter((a) => a.doctorId === doctorProfile.id);

    const todayCount = doctorAppointments.filter((a) => a.status !== "cancelled").length;
    const pendingCount = doctorAppointments.filter((a) => a.status === "pending").length;
    const completedCount = doctorAppointments.filter((a) => a.status === "completed").length;

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                        Doctor Portal Overview
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                        Welcome, {auth?.user?.name || doctorProfile.name}
                    </h1>
                    <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed max-w-xl">
                        Manage patient consultations, update clinical records, review medical histories, and issue certificates.
                    </p>
                </div>

                <Link
                    to="/doctor/issue-certificate"
                    className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-3 rounded-xl text-xs font-bold transition shadow-lg shadow-teal-500/25 shrink-0"
                >
                    + Issue Medical Certificate
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Today's Consultations</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{todayCount}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl font-bold">
                            🩺
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending Review</p>
                            <h3 className="text-3xl font-extrabold text-amber-600 mt-2">{pendingCount}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
                            ⏳
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Completed Visits</p>
                            <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">{completedCount}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                            ✓
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Patient Queue</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Consultations scheduled for today</p>
                        </div>
                        <Link to="/doctor/appointments" className="text-xs font-bold text-teal-600 hover:underline">
                            View Queue →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {doctorAppointments.slice(0, 5).map((appointment) => {
                            const patient = patients.find((p) => p.id === appointment.patientId) || {
                                name: "Patient Record",
                                age: 32,
                                gender: "Female"
                            };

                            return (
                                <div
                                    key={appointment.id}
                                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-300 font-bold flex items-center justify-center text-sm shrink-0">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">{patient.name}</h4>
                                            <p className="text-xs text-slate-500">
                                                {patient.age} yrs • {patient.gender} • 🕒 {appointment.time}
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        to="/doctor/patient-records"
                                        className="bg-slate-900 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow"
                                    >
                                        Open EHR Record
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                        Quick Clinical Actions
                    </h2>
                    <div className="space-y-3">
                        <Link
                            to="/doctor/issue-certificate"
                            className="block p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-teal-50 hover:border-teal-300 transition"
                        >
                            <h4 className="font-bold text-slate-900 text-sm">📜 Generate Certificate</h4>
                            <p className="text-xs text-slate-500 mt-1">Issue sick leave or fitness documents.</p>
                        </Link>

                        <Link
                            to="/doctor/schedule"
                            className="block p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-sky-50 hover:border-sky-300 transition"
                        >
                            <h4 className="font-bold text-slate-900 text-sm">📅 Manage Consultation Slots</h4>
                            <p className="text-xs text-slate-500 mt-1">Set daily availability hours.</p>
                        </Link>

                        <Link
                            to="/doctor/profile"
                            className="block p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-300 transition"
                        >
                            <h4 className="font-bold text-slate-900 text-sm">👤 Update Credentials</h4>
                            <p className="text-xs text-slate-500 mt-1">Edit specialization and fee details.</p>
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default DoctorDashboard;
