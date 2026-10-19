import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { approveAppointment, rejectAppointment } from "../../redux/slices/appointmentSlice";
import { addNotification } from "../../redux/slices/notificationSlice";
import dummyDoctors from "../../data/dummyDoctors.json";
import dummyPatients from "../../data/dummyPatients.json";
import Layout from "../../components/Layout";
import { useToast } from "../../components/Toast";

function AdminAppointments() {
    const dispatch = useDispatch();
    const toast = useToast();
    const appointments = useSelector((state) => state.appointment?.appointments || []);
    const reduxPatients = useSelector((state) => state.patient?.patients || dummyPatients);
    const reduxDoctors = useSelector((state) => state.doctors?.doctors || dummyDoctors);

    const [statusFilter, setStatusFilter] = useState("all");
    const [searchText, setSearchText] = useState("");

    const getStatusBadge = (status) => {
        switch (status) {
            case "confirmed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
            case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
            case "completed": return "bg-sky-50 text-sky-700 border-sky-200";
            default: return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    const filtered = appointments.filter((a) => {
        const patient = reduxPatients.find((p) => p.id === a.patientId || p.userId === a.patientId);
        const doctor = reduxDoctors.find((d) => d.id === a.doctorId);
        const patientName = patient?.name || a.patientName || "Patient";
        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
        const matchesSearch = !searchText || (
            patientName.toLowerCase().includes(searchText.toLowerCase()) ||
            doctor?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            a.reason?.toLowerCase().includes(searchText.toLowerCase())
        );
        return matchesStatus && matchesSearch;
    });

    const counts = {
        all: appointments.length,
        pending: appointments.filter((a) => a.status === "pending").length,
        confirmed: appointments.filter((a) => a.status === "confirmed").length,
        completed: appointments.filter((a) => a.status === "completed").length,
        cancelled: appointments.filter((a) => a.status === "cancelled").length,
    };

    const handleApprove = (app) => {
        const patient = reduxPatients.find((p) => p.id === app.patientId || p.userId === app.patientId);
        const doctor = reduxDoctors.find((d) => d.id === app.doctorId);
        const patientName = patient?.name || app.patientName || "Patient";
        const patientUserId = patient?.userId || app.patientId;

        dispatch(approveAppointment(app.id));
        if (patientUserId) {
            dispatch(addNotification({
                title: "Appointment Confirmed",
                message: `Your appointment with ${doctor?.name || "your doctor"} on ${app.date} at ${app.time} has been confirmed.`,
                type: "appointment",
                userId: patientUserId,
            }));
        }
        toast.success(`${patientName}'s appointment confirmed.`, "Confirmed");
    };

    const handleReject = (app) => {
        const patient = reduxPatients.find((p) => p.id === app.patientId || p.userId === app.patientId);
        const doctor = reduxDoctors.find((d) => d.id === app.doctorId);
        const patientName = patient?.name || app.patientName || "Patient";
        const patientUserId = patient?.userId || app.patientId;
        dispatch(rejectAppointment(app.id));
        if (patient?.userId) {
            dispatch(addNotification({
                title: "Appointment Rejected",
                message: `Your appointment request with ${doctor?.name} on ${app.date} was declined.`,
                type: "appointment",
                userId: patient.userId,
            }));
        }
        toast.warning(`Appointment for ${patient?.name} has been rejected.`, "Rejected");
    };

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                        Appointment Overview
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                        All Appointments
                    </h1>
                    <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed max-w-xl">
                        Full system-wide view of every patient appointment across all statuses and doctors.
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                    {[
                        { label: "Pending", value: counts.pending, color: "text-amber-300" },
                        { label: "Confirmed", value: counts.confirmed, color: "text-emerald-300" },
                        { label: "Completed", value: counts.completed, color: "text-sky-300" },
                        { label: "Cancelled", value: counts.cancelled, color: "text-rose-300" },
                    ].map((s) => (
                        <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl p-3 text-center">
                            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search by patient, doctor, or reason..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                    {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition shrink-0 ${
                                statusFilter === s ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            {s} ({counts[s] ?? appointments.length})
                        </button>
                    ))}
                </div>
            </div>

            <p className="text-sm text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-900">{filtered.length}</span> of {appointments.length} appointments
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-2xl mb-3">🔍</div>
                        <h3 className="font-bold text-slate-800">No appointments found</h3>
                        <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filter.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <div className="col-span-3">Patient</div>
                            <div className="col-span-3">Doctor</div>
                            <div className="col-span-2">Date & Time</div>
                            <div className="col-span-2">Reason</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-1">Actions</div>
                        </div>

                        {filtered.map((app) => {
                            const patient = reduxPatients.find((p) => p.id === app.patientId || p.userId === app.patientId) || { name: app.patientName || "Registered Patient", age: 28, gender: "Patient" };
                            const doctor = reduxDoctors.find((d) => d.id === app.doctorId) || { name: "Unknown Doctor", specialization: "--" };

                            return (
                                <div key={app.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-5 py-4 hover:bg-slate-50/50 transition items-center">
                                    <div className="sm:col-span-3 flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-teal-300 font-bold text-sm flex items-center justify-center shrink-0">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{patient.name}</p>
                                            <p className="text-[11px] text-slate-500">{patient.age} yrs • {patient.gender}</p>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <p className="font-bold text-slate-900 text-sm">{doctor.name}</p>
                                        <p className="text-[11px] text-teal-600 font-semibold">{doctor.specialization}</p>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <p className="text-xs font-bold text-slate-800">{app.date}</p>
                                        <p className="text-[11px] text-slate-500">{app.time}</p>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <p className="text-xs text-slate-600 line-clamp-2">{app.reason || "—"}</p>
                                    </div>

                                    <div className="sm:col-span-1">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${getStatusBadge(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>

                                    <div className="sm:col-span-1 flex flex-row sm:flex-col gap-2">
                                        {app.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(app)}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition"
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(app)}
                                                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg text-[11px] font-bold transition"
                                                >
                                                    ✕ Reject
                                                </button>
                                            </>
                                        )}
                                        {app.status !== "pending" && (
                                            <span className="text-[11px] text-slate-400 font-medium">—</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default AdminAppointments;
