import { useState } from "react";
import { useSelector } from "react-redux";
import dummyPatients from "../../data/dummyPatients.json";
import dummyDoctors from "../../data/dummyDoctors.json";
import Layout from "../../components/Layout";

function IssueCertificate() {
    const auth = useSelector((state) => state.auth);
    const doctorObj = dummyDoctors.find((d) => d.name === auth?.user?.name || d.userId === auth?.user?.id) || dummyDoctors[0];

    const reduxPatients = useSelector((state) => state.patient?.patients || dummyPatients);

    const [selectedPatientId, setSelectedPatientId] = useState(reduxPatients[0]?.id || dummyPatients[0].id);
    const [certificateType, setCertificateType] = useState("Sick Leave Certificate");
    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]);
    const [diagnosisNotes, setDiagnosisNotes] = useState("Patient presented with acute fever and requires complete bed rest.");
    const [isGenerated, setIsGenerated] = useState(false);

    const selectedPatient = reduxPatients.find((p) => p.id === parseInt(selectedPatientId, 10) || p.userId === parseInt(selectedPatientId, 10)) || reduxPatients[0] || dummyPatients[0];

    const handleGenerate = (e) => {
        e.preventDefault();
        setIsGenerated(true);
    };

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                    Clinical Document Generator
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    Issue Medical Certificate
                </h1>
                <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed max-w-xl">
                    Generate official clinical leave or fitness certificates for registered patients.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-5">
                    <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                        Certificate Details Form
                    </h2>

                    <form onSubmit={handleGenerate} className="space-y-4 text-xs sm:text-sm">
                        <div>
                            <label className="block font-bold text-slate-700 mb-1.5">Select Patient</label>
                            <select
                                value={selectedPatientId}
                                onChange={(e) => {
                                    setSelectedPatientId(e.target.value);
                                    setIsGenerated(false);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500"
                            >
                                {dummyPatients.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} (Age: {p.age}, EHR #{p.id}, {p.address})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1.5">Certificate Type</label>
                            <select
                                value={certificateType}
                                onChange={(e) => {
                                    setCertificateType(e.target.value);
                                    setIsGenerated(false);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500"
                            >
                                <option value="Sick Leave Certificate">Sick Leave Certificate</option>
                                <option value="Medical Fitness Certificate">Medical Fitness Certificate</option>
                                <option value="Return to Work Authorization">Return to Work Authorization</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Effective Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 text-xs"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Valid Until Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 text-xs"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1.5">Clinical Justification & Notes</label>
                            <textarea
                                value={diagnosisNotes}
                                onChange={(e) => setDiagnosisNotes(e.target.value)}
                                rows="4"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-teal-600/20"
                        >
                            Generate Official Certificate Preview
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
                            <div>
                                <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                                    MEDICO CLINICAL HEALTH — KERALA
                                </h3>
                                <p className="text-[10px] font-bold text-teal-600">OFFICIAL MEDICAL CERTIFICATE</p>
                            </div>
                            <span className="text-xl">🩺</span>
                        </div>

                        <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
                            <p className="font-semibold">
                                This is to certify that <span className="font-extrabold text-slate-900 underline">{selectedPatient.name}</span> (Age: {selectedPatient.age}, Gender: {selectedPatient.gender}, Residing at: {selectedPatient.address}) has been examined under my clinical care.
                            </p>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                                <p className="font-bold text-teal-700">{certificateType}</p>
                                <p className="text-xs text-slate-600">{diagnosisNotes}</p>
                            </div>

                            <p>
                                Recommended leave period from <span className="font-bold">{startDate}</span> to <span className="font-bold">{endDate}</span>.
                            </p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200 flex justify-between items-end mt-8">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Attending Physician</p>
                            <p className="text-xs font-black text-slate-900 mt-1">{doctorObj.name}</p>
                            <p className="text-[10px] text-teal-600 font-semibold">{doctorObj.specialization} • {doctorObj.location}</p>
                        </div>

                        {isGenerated && (
                            <button
                                onClick={() => window.print()}
                                className="bg-slate-900 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow"
                            >
                                🖨️ Print Certificate
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default IssueCertificate;
