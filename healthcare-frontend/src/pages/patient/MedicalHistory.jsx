import { useSelector } from "react-redux";
import records from "../../data/dummyRecords.json";
import patients from "../../data/dummyPatients.json";
import doctors from "../../data/dummyDoctors.json";
import Layout from "../../components/Layout";

function MedicalHistory() {
    const auth = useSelector((state) => state.auth);
    const reduxRecords = useSelector((state) => state.records?.records || records);

    const reduxPatients = useSelector((state) => state.patient?.patients || patients);

    const currentPatient = reduxPatients.find(
        (p) => p.userId === auth?.user?.id || p.email?.toLowerCase() === auth?.user?.email?.toLowerCase() || p.id === auth?.user?.id
    ) || {
        id: auth?.user?.id || 4,
        userId: auth?.user?.id || 4,
        name: auth?.user?.name || "Patient",
        email: auth?.user?.email || "patient@healthcare.com"
    };

    const myRecords = reduxRecords.filter(
        (r) => r.patientId === currentPatient.id || r.patientId === auth?.user?.id
    );

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                    Electronic Health Records (EHR)
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    Clinical Medical History
                </h1>
                <p className="text-slate-300 mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed max-w-2xl">
                    Comprehensive chronological record of medical diagnoses, clinical observations, prescribed medications with dosage timing schedules, and physician notes.
                </p>
            </div>

            <div className="space-y-6">
                {myRecords.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl mb-3">
                            📄
                        </div>
                        <h3 className="font-bold text-slate-800 text-base">No medical records on file</h3>
                        <p className="text-xs text-slate-500 mt-1">Clinical records will appear here after your consultations are completed.</p>
                    </div>
                ) : (
                    myRecords.map((record) => {
                        const doctor = doctors.find((d) => d.id === record.doctorId) || {
                            name: "Attending Physician",
                            specialization: "General Medicine"
                        };

                        const prescriptionsList = record.prescriptions || record.prescription || [];

                        return (
                            <div
                                key={record.id}
                                className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6 hover:shadow-md transition"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                                            Consultation Record #{record.id}
                                        </span>
                                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                                            {record.diagnosis}
                                        </h3>
                                    </div>
                                    <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-full text-xs shrink-0">
                                        📅 {record.date}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Attending Physician
                                        </p>
                                        <p className="font-extrabold text-slate-900 text-sm">
                                            {doctor.name}
                                        </p>
                                        <p className="text-xs font-semibold text-teal-600">
                                            {doctor.specialization}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Clinical Notes & Symptoms
                                        </p>
                                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                            {record.notes || "Patient presented with standard clinical indicators. Prescribed targeted treatment plan."}
                                        </p>
                                    </div>
                                </div>

                                {prescriptionsList.length > 0 && (
                                    <div className="border-t border-slate-100 pt-5">
                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                                            💊 Prescribed Medications & Dosage Schedule
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {prescriptionsList.map((med, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-teal-50/50 border border-teal-100 p-4 rounded-xl flex items-start gap-3"
                                                >
                                                    <span className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                                        Rx
                                                    </span>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-xs">
                                                            {med.medicine || med.name || med}
                                                        </p>
                                                        <p className="text-[11px] text-teal-800 font-extrabold mt-0.5">
                                                            Timing: {med.dosage || "1-0-1-0"}
                                                        </p>
                                                        {med.duration && (
                                                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                                Duration: {med.duration}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </Layout>
    );
}

export default MedicalHistory;
