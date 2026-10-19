import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import dummyPatients from "../../data/dummyPatients.json";
import dummyRecords from "../../data/dummyRecords.json";
import Layout from "../../components/Layout";
import { addRecord } from "../../redux/slices/recordsSlice";

function PatientRecordView() {
    const dispatch = useDispatch();
    const reduxPatients = useSelector((state) => state.patient?.patients || dummyPatients);
    const reduxRecords = useSelector((state) => state.records?.records || dummyRecords);

    const [selectedPatientId, setSelectedPatientId] = useState(reduxPatients[0]?.id || 1);
    const [newDiagnosis, setNewDiagnosis] = useState("");
    const [newPrescription, setNewPrescription] = useState("");

    const selectedPatient = reduxPatients.find((p) => p.id === parseInt(selectedPatientId, 10) || p.userId === parseInt(selectedPatientId, 10)) || reduxPatients[0] || dummyPatients[0];
    const patientRecords = reduxRecords.filter((r) => r.patientId === selectedPatient.id || r.patientId === selectedPatient.userId);

    const handleAddRecord = (e) => {
        e.preventDefault();
        if (!newDiagnosis.trim()) return;

        const newRec = {
            id: Date.now(),
            patientId: selectedPatient.id,
            doctorId: 1,
            date: new Date().toISOString().split("T")[0],
            diagnosis: newDiagnosis,
            prescriptions: newPrescription ? [{ medicine: newPrescription, dosage: "Standard" }] : [],
            notes: "Recorded during clinical follow-up visit."
        };

        setRecordsList([newRec, ...recordsList]);
        setNewDiagnosis("");
        setNewPrescription("");
        alert("Clinical diagnosis record added to patient EHR.");
    };

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                    EHR Viewer & Logger
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    Patient Medical History & Prescription
                </h1>
                <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed max-w-xl">
                    Inspect complete electronic health records and append new clinical observations or prescriptions.
                </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-400 uppercase shrink-0">Select Patient EHR:</span>
                    <select
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs font-bold focus:outline-none focus:border-teal-500 flex-1"
                    >
                        {dummyPatients.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name} (EHR #{p.id} • {p.age} yrs • Blood: {p.bloodGroup})
                            </option>
                        ))}
                    </select>
                </div>

                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200">
                    Emergency Contact: {selectedPatient.emergencyContact}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
                        ➕ Record New Consultation Entry
                    </h3>

                    <form onSubmit={handleAddRecord} className="space-y-4 text-xs sm:text-sm">
                        <div>
                            <label className="block font-bold text-slate-700 mb-1">Diagnosis Summary</label>
                            <input
                                type="text"
                                placeholder="e.g., Hypertension Follow-up"
                                value={newDiagnosis}
                                onChange={(e) => setNewDiagnosis(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">Prescription Medicine & Dosage</label>
                            <input
                                type="text"
                                placeholder="e.g., Lisinopril 10mg once daily"
                                value={newPrescription}
                                onChange={(e) => setNewPrescription(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-teal-600/20"
                        >
                            Save Clinical Record
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {patientRecords.length === 0 ? (
                        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80">
                            <p className="text-xs text-slate-500">No medical history records logged for this patient yet.</p>
                        </div>
                    ) : (
                        patientRecords.map((rec) => (
                            <div key={rec.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                    <h4 className="font-extrabold text-slate-900 text-base">{rec.diagnosis}</h4>
                                    <span className="text-xs font-bold text-slate-400">📅 {rec.date}</span>
                                </div>

                                <p className="text-xs text-slate-600 leading-relaxed">{rec.notes}</p>

                                {rec.prescriptions && rec.prescriptions.length > 0 && (
                                    <div className="pt-2 flex flex-wrap gap-2">
                                        {rec.prescriptions.map((med, idx) => (
                                            <span key={idx} className="bg-teal-50 text-teal-700 font-bold px-3 py-1 rounded-xl text-xs border border-teal-200">
                                                💊 {med.medicine || med} ({med.dosage || "Standard"})
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default PatientRecordView;
