import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import DoctorAppointmentCard from "../../components/DoctorAppointmentCard";
import AppointmentRefresh from "../../components/AppointmentRefresh";
import Layout from "../../components/Layout";
import { saveConsultation } from "../../redux/slices/appointmentSlice";
import { fetchRecords } from "../../redux/slices/recordsSlice";
import { useToast } from "../../components/Toast";

function DoctorAppointments() {
    const auth = useSelector((state) => state.auth);
    const { appointments: reduxAppointments, loading, error } = useSelector(state => state.appointment);
    const reduxRecords = useSelector((state) => state.records?.records || []);
    const dispatch = useDispatch();
    const toast = useToast();

    // Use the actual booking response, never a demo patient's profile.
    const getPatientInfo = (patientId, fallbackName) => {
        const booking = reduxAppointments.find(item => item.patientId === patientId);
        return { name: booking?.patientName || fallbackName || 'Registered Patient',
            userId: patientId, email: booking?.patientEmail || 'Not provided',
            phone: booking?.patientDetails?.mobile || 'Not provided',
            dob: booking?.patientDetails?.dob || 'Not provided',
            gender: booking?.patientDetails?.gender || 'Not provided', bloodGroup: booking?.patientDetails?.bloodGroup || 'Not provided' };
    };

    const [statusFilter, setStatusFilter] = useState("all");

    const [activeConsultationApp, setActiveConsultationApp] = useState(null);

    const [diagnosis, setDiagnosis] = useState("");
    const [clinicalNotes, setClinicalNotes] = useState("");
    const [medicines, setMedicines] = useState([
        { medicine: "Paracetamol 500mg", schedule: "1-0-1-0", timingLabel: "(Morning - Noon - Evening - Night)", duration: "5 Days - After Food" }
    ]);

    const doctorObj = { id: auth.user.id, name: auth.user.name };

    const doctorAppointments = reduxAppointments.filter(
        (a) => a.doctorId === doctorObj.id
    );

    const filteredAppointments = doctorAppointments.filter((a) => {
        if (statusFilter === "all") return true;
        return a.status === statusFilter;
    });

    const openConsultationModal = (appointment) => {
        setActiveConsultationApp(appointment);
        setDiagnosis(appointment.reason || "General Medical Checkup");
        setClinicalNotes("Patient presented with standard clinical symptoms. Prescribed targeted medication.");
        setMedicines([
            { medicine: "Paracetamol 500mg", schedule: "1-0-1-0", timingLabel: "(Morning - Noon - Evening - Night)", duration: "5 Days - After Food" }
        ]);
    };

    const handleAddMedicine = () => {
        setMedicines([
            ...medicines,
            { medicine: "", schedule: "1-0-1-0", timingLabel: "(Morning - Noon - Evening - Night)", duration: "5 Days - After Food" }
        ]);
    };

    const handleUpdateMedicine = (index, field, value) => {
        const updated = [...medicines];
        updated[index][field] = value;
        setMedicines(updated);
    };

    const handleRemoveMedicine = (index) => {
        setMedicines(medicines.filter((_, idx) => idx !== index));
    };

    const [savingConsultation, setSavingConsultation] = useState(false);
    const handleSaveConsultation = async (e) => {
        e.preventDefault();
        if (!activeConsultationApp) return;

        const appointment = activeConsultationApp;
        const patient = getPatientInfo(appointment.patientId, appointment.patientName);

        setSavingConsultation(true);
        try {
            const formattedPrescription = medicines
                .filter((m) => m.medicine.trim() !== "")
                .map((m) => ({
                    medicine: m.medicine,
                    dosage: `${m.schedule} ${m.timingLabel}`,
                    duration: m.duration
                }));

            const newEhrRecord = {
                id: appointment.id,
                diagnosis: diagnosis || "General Consultation",
                notes: clinicalNotes,
                prescriptions: formattedPrescription,
            };
            await dispatch(saveConsultation(newEhrRecord)).unwrap();
            dispatch(fetchRecords());

            toast.success(
                `Consultation completed & prescription saved for ${patient?.name || "patient"}.`,
                "Consultation Complete"
            );

            setActiveConsultationApp(null);
        } catch (err) { toast.error(typeof err === 'string' ? err : 'Could not complete the consultation'); }
        finally { setSavingConsultation(false); }
    };

    return (
        <Layout>
            <AppointmentRefresh />
            <p className="text-sm text-teal-800">Consultation notes and prescriptions are saved with the appointment and are available in the patient's medical history.</p>
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                    Clinical Workflow
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    Doctor Consultation Queue
                </h1>
                <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed max-w-xl">
                    View all patients booked with you, including requests awaiting hospital approval. Open an approved visit to begin the consultation.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["all", "confirmed", "pending", "completed"].map((s) => {
                    const count = s === "all" ? doctorAppointments.length : doctorAppointments.filter(a => a.status === s).length;
                    const colors = {
                        all: "bg-slate-900 text-white",
                        confirmed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        pending: "bg-amber-50 text-amber-700 border border-amber-200",
                        completed: "bg-sky-50 text-sky-700 border border-sky-200",
                    };
                    return (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`p-3 rounded-2xl text-left transition ${statusFilter === s ? "ring-2 ring-teal-500 ring-offset-2" : "opacity-80 hover:opacity-100"} ${colors[s]}`}
                        >
                            <p className="text-xs font-bold uppercase tracking-wider opacity-70 capitalize">{s}</p>
                            <p className="text-2xl font-extrabold mt-1">{count}</p>
                        </button>
                    );
                })}
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center gap-2 overflow-x-auto">
                {["all", "confirmed", "pending", "completed", "cancelled", "rejected"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition shrink-0 ${
                            statusFilter === status
                                ? "bg-slate-900 text-white shadow-sm"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        {status} ({status === "all" ? doctorAppointments.length : doctorAppointments.filter(a => a.status === status).length})
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {loading && doctorAppointments.length === 0 ? <p role="status" className="portal-empty">Loading your patient bookings...</p> : error && doctorAppointments.length === 0 ? <p role="alert" className="portal-notice">Unable to load bookings. Use Refresh appointments to retry.</p> : filteredAppointments.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl mb-3">
                            📋
                        </div>
                        <h3 className="font-bold text-slate-800 text-base">No patient bookings in this category</h3>
                        <p className="text-xs text-slate-500 mt-1">Pending requests are shown before approval. Check another category or refresh for new bookings.</p>
                    </div>
                ) : (
                    filteredAppointments.map(appointment => <DoctorAppointmentCard key={appointment.id} appointment={appointment} onConsult={openConsultationModal} />)
                )}
            </div>

            {activeConsultationApp && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                                    Clinical Consultation Workspace
                                </span>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                                    Consulting: {getPatientInfo(activeConsultationApp.patientId, activeConsultationApp.patientName).name}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Appointment Date: {activeConsultationApp.date} at {activeConsultationApp.time}
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveConsultationApp(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                📋 Patient Clinical History & Profile
                            </h3>
                            {(() => {
                                const pat = getPatientInfo(activeConsultationApp.patientId, activeConsultationApp.patientName);
                                const historyRecords = reduxRecords.filter(r => r.patientId === activeConsultationApp.patientId);
                                return (
                                    <div className="space-y-2 text-xs">
                                        <div className="flex flex-wrap gap-3 font-semibold text-slate-700">
                                            <span>Date of birth: <strong className="text-slate-900">{pat?.dob}</strong></span>
                                            <span>Gender: <strong className="text-slate-900">{pat?.gender}</strong></span>
                                            <span>Blood Group: <strong className="text-teal-700">{pat?.bloodGroup || "Not provided"}</strong></span>
                                            <span>Phone: <strong className="text-slate-900">{pat?.phone}</strong></span>
                                        </div>
                                        {historyRecords.length > 0 ? (
                                            <div className="mt-2 pt-2 border-t border-slate-200">
                                                <p className="text-[11px] font-bold text-slate-500">Past Diagnoses:</p>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {historyRecords.map((r, i) => (
                                                        <span key={i} className="bg-white text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200">
                                                            • {r.diagnosis} ({r.date})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-slate-400 italic">First consultation record for this patient.</p>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        <form onSubmit={handleSaveConsultation} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                                        Diagnosis / Chief Complaint
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                        placeholder="e.g. Acute viral fever, Mild hypertension..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-teal-500 focus:bg-white transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                                        Physician Observations & Advice
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={clinicalNotes}
                                        onChange={(e) => setClinicalNotes(e.target.value)}
                                        placeholder="Clinical observations and lifestyle advice..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-teal-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 border-t border-slate-100 pt-5">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                                            💊 Prescription & Dosage Schedule (1-0-1-0)
                                        </h3>
                                        <p className="text-[10px] text-slate-500">Morning - Noon - Evening - Night dosage timing</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddMedicine}
                                        className="bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                                    >
                                        + Add Medicine
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {medicines.map((med, idx) => (
                                        <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                            <div className="flex justify-between items-center gap-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Medicine #{idx + 1}</span>
                                                {medicines.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMedicine(idx)}
                                                        className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                                                    >
                                                        ✕ Remove
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Medicine Name & Strength</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={med.medicine}
                                                        onChange={(e) => handleUpdateMedicine(idx, "medicine", e.target.value)}
                                                        placeholder="e.g. Paracetamol 500mg, Amoxicillin 250mg"
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-teal-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Duration & Food Instructions</label>
                                                    <input
                                                        type="text"
                                                        value={med.duration}
                                                        onChange={(e) => handleUpdateMedicine(idx, "duration", e.target.value)}
                                                        placeholder="e.g. 5 Days - After Food"
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-teal-500"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                                    Dosage Timing (Morning - Noon - Evening - Night):
                                                </label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {[
                                                        { schedule: "1-0-1-0", label: "1-0-1-0 (Morn & Eve)" },
                                                        { schedule: "1-1-1-1", label: "1-1-1-1 (4 times/day)" },
                                                        { schedule: "1-0-0-1", label: "1-0-0-1 (Morn & Night)" },
                                                        { schedule: "0-1-0-1", label: "0-1-0-1 (Noon & Night)" },
                                                        { schedule: "1-0-0-0", label: "1-0-0-0 (Morn Only)" },
                                                        { schedule: "0-0-0-1", label: "0-0-0-1 (Night Only)" },
                                                    ].map((preset) => (
                                                        <button
                                                            key={preset.schedule}
                                                            type="button"
                                                            onClick={() => handleUpdateMedicine(idx, "schedule", preset.schedule)}
                                                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition border ${
                                                                med.schedule === preset.schedule
                                                                    ? "bg-slate-900 text-white border-slate-900"
                                                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                                            }`}
                                                        >
                                                            {preset.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                                <button
                                    type="button"
                                    onClick={() => setActiveConsultationApp(null)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                        disabled={savingConsultation}
                                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-xs font-extrabold transition shadow-lg shadow-teal-600/25"
                                >
                                    ✓ Save Prescription & Complete Consultation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default DoctorAppointments;
