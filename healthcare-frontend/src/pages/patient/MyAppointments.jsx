import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { cancelAppointment } from "../../redux/slices/appointmentSlice";
import doctors from "../../data/dummyDoctors.json";
import patients from "../../data/dummyPatients.json";
import Layout from "../../components/Layout";
import { useToast } from "../../components/Toast";

function MyAppointments() {
    const dispatch = useDispatch();
    const toast = useToast();
    const auth = useSelector((state) => state.auth);
    const appointments = useSelector((state) => state.appointment?.appointments || []);

    const [filter, setFilter] = useState("all");

    const reduxPatients = useSelector((state) => state.patient?.patients || patients);

    const currentPatient = reduxPatients.find(
        (p) => p.userId === auth?.user?.id || p.email?.toLowerCase() === auth?.user?.email?.toLowerCase() || p.id === auth?.user?.id
    ) || {
        id: auth?.user?.id || 4,
        userId: auth?.user?.id || 4,
        name: auth?.user?.name || "Patient",
        email: auth?.user?.email || "patient@healthcare.com"
    };

    const myAppointments = appointments.filter(
        (a) => a.patientId === currentPatient.id || a.patientId === auth?.user?.id
    );

    const filteredAppointments = myAppointments.filter((a) => {
        if (filter === "all") return true;
        return a.status === filter;
    });

    const handleCancel = (appointment) => {
        const doctor = doctors.find((d) => d.id === appointment.doctorId);
        dispatch(cancelAppointment(appointment.id));
        toast.warning(
            `Your appointment with ${doctor?.name || "the doctor"} on ${appointment.date} has been cancelled.`,
            "Appointment Cancelled"
        );
    };

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
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                    Appointments Management
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    My Scheduled Consultations
                </h1>
                <p className="text-slate-300 mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed max-w-2xl">
                    Review and track all your scheduled doctor visits, past consultations, and status updates.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { key: "all", label: "Total", color: "bg-slate-900 text-white" },
                    { key: "confirmed", label: "Confirmed", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
                    { key: "pending", label: "Pending", color: "bg-amber-50 text-amber-700 border border-amber-200" },
                    { key: "completed", label: "Completed", color: "bg-sky-50 text-sky-700 border border-sky-200" },
                ].map(({ key, label, color }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`p-3 rounded-2xl text-left transition ${filter === key ? "ring-2 ring-teal-500 ring-offset-2" : "opacity-80 hover:opacity-100"} ${color}`}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
                        <p className="text-2xl font-extrabold mt-1">
                            {key === "all" ? myAppointments.length : myAppointments.filter(a => a.status === key).length}
                        </p>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center gap-2 overflow-x-auto">
                {["all", "confirmed", "pending", "completed", "cancelled"].map((statusKey) => (
                    <button
                        key={statusKey}
                        onClick={() => setFilter(statusKey)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition shrink-0 ${
                            filter === statusKey
                                ? "bg-slate-900 text-white shadow-sm"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        {statusKey} ({statusKey === "all" ? myAppointments.length : myAppointments.filter(a => a.status === statusKey).length})
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl mb-3">
                            📅
                        </div>
                        <h3 className="font-bold text-slate-800 text-base">No appointments found</h3>
                        <p className="text-xs text-slate-500 mt-1">There are no consultations matching your selected status filter.</p>
                    </div>
                ) : (
                    filteredAppointments.map((appointment) => {
                        const doctor = doctors.find((d) => d.id === appointment.doctorId) || {
                            name: "Specialist Doctor",
                            specialization: "Clinical Care"
                        };

                        return (
                            <div
                                key={appointment.id}
                                className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:border-teal-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                            >
                                <div className="flex items-start sm:items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-900 text-teal-300 font-extrabold text-xl flex items-center justify-center shrink-0 border border-slate-700 shadow-sm">
                                        {doctor.name.replace(/^Dr\.?\s*/i, "").charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                                                {doctor.name}
                                            </h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(appointment.status)}`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-teal-600 mt-0.5">
                                            {doctor.specialization}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                                            <span>📅 {appointment.date}</span>
                                            <span>🕒 {appointment.time}</span>
                                            <span>📋 {appointment.reason || appointment.notes || "General Checkup"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start md:items-end gap-2">
                                    {appointment.status === "pending" && (
                                        <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                                            ⏳ Awaiting admin approval
                                        </span>
                                    )}
                                    {appointment.status === "completed" && (
                                        <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
                                            ✓ Visit complete — check billing
                                        </span>
                                    )}
                                    {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                                        <button
                                            onClick={() => handleCancel(appointment)}
                                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-xl text-xs font-bold transition"
                                        >
                                            Cancel Appointment
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </Layout>
    );
}

export default MyAppointments;
