import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { approveAppointment, rejectAppointment } from "../../redux/slices/appointmentSlice";
import { addNotification } from "../../redux/slices/notificationSlice";
import dummyDoctors from "../../data/dummyDoctors.json";
import dummyPatients from "../../data/dummyPatients.json";
import Layout from "../../components/Layout";
import { useToast } from "../../components/Toast";

function ManageSchedules() {
    const dispatch = useDispatch();
    const toast = useToast();
    const appointments = useSelector((state) => state.appointment?.appointments || []);
    const reduxPatients = useSelector((state) => state.patient?.patients || dummyPatients);
    const reduxDoctors = useSelector((state) => state.doctors?.doctors || dummyDoctors);

    const [allFilter, setAllFilter] = useState("pending");

    const pendingAppointments = appointments.filter((a) => a.status === "pending");
    const filteredAppointments = allFilter === "all"
        ? appointments
        : appointments.filter((a) => a.status === allFilter);

    const getSlotOccupancy = (doctorId, date, timeSlot) => {
        return appointments.filter(
            (a) => a.doctorId === doctorId && a.date === date && a.time === timeSlot && a.status !== "cancelled"
        ).length;
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
                message: `Your appointment with ${doctor?.name || "your doctor"} on ${app.date} at ${app.time} has been confirmed by Admin.`,
                type: "appointment",
                userId: patientUserId,
            }));
        }

        toast.success(
            `${patientName}'s appointment with ${doctor?.name || "doctor"} has been confirmed.`,
            "Appointment Approved"
        );
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
                message: `Your appointment request with ${doctor?.name || "your doctor"} on ${app.date} was declined. Please try another time slot.`,
                type: "appointment",
                userId: patient.userId,
            }));
        }

        toast.warning(
            `${patient?.name || "Patient"}'s appointment has been rejected.`,
            "Appointment Rejected"
        );
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "confirmed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
            case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
            case "completed": return "bg-sky-50 text-sky-700 border-sky-200";
            default: return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                        Admin Approval & Slot Control
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                        Approve Appointments & Facility Slots
                    </h1>
                    <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed max-w-xl">
                        Verify incoming patient requests against doctor availability limits (max 4 patients per slot).
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 text-left md:text-right">
                    <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Pending Verification</p>
                    <h2 className="text-2xl font-black text-white">{pendingAppointments.length} Requests</h2>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-2 overflow-x-auto">
                {["pending", "confirmed", "completed", "cancelled", "all"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setAllFilter(s)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition shrink-0 ${
                            allFilter === s ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        {s} ({s === "all" ? appointments.length : appointments.filter(a => a.status === s).length})
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {allFilter === "pending" ? "Pending Appointment Requests" : `${allFilter.charAt(0).toUpperCase() + allFilter.slice(1)} Appointments`}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {allFilter === "pending" ? "Verify schedule capacity before confirming" : "Viewing filtered appointment records"}
                        </p>
                    </div>
                </div>

                {filteredAppointments.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3 text-xl">
                            ✓
                        </div>
                        <p className="text-xs font-bold text-slate-500">No appointments in this category</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAppointments.map((app) => {
                            const patient = reduxPatients.find((p) => p.id === app.patientId || p.userId === app.patientId) || {
                                name: app.patientName || "Registered Patient", age: 28, gender: "Patient", phone: "+91 9876543210", address: "Kerala"
                            };
                            const doctor = reduxDoctors.find((d) => d.id === app.doctorId) || {
                                name: "Attending Doctor", specialization: "Clinical Specialist"
                            };
                            const occupancy = getSlotOccupancy(app.doctorId, app.date, app.time);

                            return (
                                <div
                                    key={app.id}
                                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-teal-300 font-extrabold text-lg flex items-center justify-center shrink-0">
                                            {patient.name.charAt(0)}
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-extrabold text-slate-900 text-base">{patient.name}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(app.status)}`}>
                                                    {app.status}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                                                    Age: {patient.age} • {patient.gender}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-600 mt-1">
                                                Doctor: <span className="font-bold text-slate-900">{doctor.name}</span> ({doctor.specialization})
                                            </p>

                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                                                <span>📅 <strong className="text-slate-800">{app.date}</strong></span>
                                                <span>🕒 <strong className="text-slate-800">{app.time}</strong></span>
                                                <span>📞 {patient.phone}</span>
                                                <span className={`font-bold px-2 py-0.5 rounded-md ${
                                                    occupancy >= 4 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-800"
                                                }`}>
                                                    Occupancy: {occupancy}/4 booked
                                                </span>
                                            </div>

                                            {app.reason && (
                                                <p className="text-xs text-slate-500 italic mt-1">
                                                    Complaint: "{app.reason}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {app.status === "pending" && (
                                        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                                            <button
                                                onClick={() => handleApprove(app)}
                                                className="flex-1 lg:flex-none bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-teal-600/20"
                                            >
                                                ✓ Approve & Confirm
                                            </button>
                                            <button
                                                onClick={() => handleReject(app)}
                                                className="flex-1 lg:flex-none bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-xl text-xs font-bold transition"
                                            >
                                                ✕ Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Doctor Suites & Daily Availability
                </h2>
                <div className="space-y-4">
                    {dummyDoctors.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-slate-50/60 rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        >
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-base">{doc.name}</h3>
                                <p className="text-xs font-bold text-teal-600 mt-0.5">{doc.specialization} • {doc.location}</p>
                                {doc.availability && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {doc.availability.map((avail, idx) => (
                                            <span key={idx} className="bg-white text-slate-700 font-semibold px-2.5 py-1 rounded-lg text-[11px] border border-slate-200">
                                                {avail.day}: {avail.slots.join(", ")}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl shrink-0">
                                Max 4 Patients/Slot Cap Active
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}

export default ManageSchedules;
