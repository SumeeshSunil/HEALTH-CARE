import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Layout from "../../components/Layout";
import dummyDoctors from "../../data/dummyDoctors.json";
import dummyPatients from "../../data/dummyPatients.json";
import { sendMessage } from "../../redux/slices/messageSlice";

function DoctorMessages() {
    const dispatch = useDispatch();
    const auth = useSelector((state) => state.auth);
    const reduxMessages = useSelector((state) => state.messages?.messages || []);

    const doctorObj = dummyDoctors.find(
        (d) => d.name === auth?.user?.name || d.userId === auth?.user?.id
    ) || dummyDoctors[0];

    const reduxPatients = useSelector((state) => state.patient?.patients || dummyPatients);

    const [selectedPatientId, setSelectedPatientId] = useState(reduxPatients[0]?.id || dummyPatients[0].id);
    const [newMessage, setNewMessage] = useState("");

    const activePatient = reduxPatients.find((p) => p.id === Number(selectedPatientId) || p.userId === Number(selectedPatientId)) || reduxPatients[0] || dummyPatients[0];

    const currentChatMessages = reduxMessages.filter(
        (m) => m.doctorId === doctorObj.id && m.patientId === Number(selectedPatientId)
    );

    const handleSend = () => {
        if (!newMessage.trim()) return;
        dispatch(sendMessage({
            patientId: selectedPatientId,
            doctorId: doctorObj.id,
            sender: "doctor",
            text: newMessage.trim(),
        }));
        setNewMessage("");
    };

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                    Clinical Communication
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    Patient Consultation Messages
                </h1>
                <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed">
                    Communicate with your patients securely. Persistent consultation updates and follow-ups.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
                <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-slate-900 text-sm">Patient Conversations</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">{dummyPatients.length} patient channels</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {dummyPatients.map((patient) => {
                            const patientMsgs = reduxMessages.filter(
                                (m) => m.doctorId === doctorObj.id && m.patientId === patient.id
                            );
                            const lastMsg = patientMsgs[patientMsgs.length - 1];
                            const isSelected = patient.id === Number(selectedPatientId);

                            return (
                                <button
                                    key={patient.id}
                                    onClick={() => setSelectedPatientId(patient.id)}
                                    className={`w-full text-left p-4 transition ${isSelected ? "bg-teal-50 border-l-4 border-teal-500" : "hover:bg-slate-50"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-900 text-sm truncate">{patient.name}</p>
                                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                {lastMsg ? lastMsg.text : "No messages yet"}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-300 font-extrabold flex items-center justify-center shrink-0">
                            {activePatient.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">{activePatient.name}</p>
                            <p className="text-[11px] text-teal-600 font-semibold">
                                {activePatient.age} yrs • {activePatient.gender} • 📞 {activePatient.phone}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-slate-50/30">
                        {currentChatMessages.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                                No message history with {activePatient.name} yet. Type below to start consulting.
                            </div>
                        ) : (
                            currentChatMessages.map((msg) => {
                                const isDoctor = msg.sender === "doctor";
                                return (
                                    <div key={msg.id} className={`flex ${isDoctor ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                            isDoctor
                                                ? "bg-teal-600 text-white rounded-br-sm shadow-sm"
                                                : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
                                        }`}>
                                            <p>{msg.text}</p>
                                            <p className={`text-[10px] mt-1.5 ${isDoctor ? "text-teal-100 text-right" : "text-slate-400"}`}>
                                                {msg.time} • {msg.date}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-white">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder={`Send clinical message to ${activePatient.name}...`}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!newMessage.trim()}
                                className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white px-5 py-3 rounded-xl text-sm font-bold transition shadow-sm"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 font-medium">
                            🔒 Messages persist in Redux store across navigation.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default DoctorMessages;
