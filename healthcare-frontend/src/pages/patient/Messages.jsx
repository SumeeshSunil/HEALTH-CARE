import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import dummyDoctors from "../../data/dummyDoctors.json";
import dummyPatients from "../../data/dummyPatients.json";
import Layout from "../../components/Layout";
import { sendMessage } from "../../redux/slices/messageSlice";

function Messages() {
    const dispatch = useDispatch();
    const auth = useSelector((state) => state.auth);
    const reduxMessages = useSelector((state) => state.messages?.messages || []);

    const userRole = auth?.user?.role || "patient";

    const reduxPatients = useSelector((state) => state.patient?.patients || dummyPatients);

    const currentPatient = reduxPatients.find(
        (p) => p.userId === auth?.user?.id || p.email?.toLowerCase() === auth?.user?.email?.toLowerCase() || p.id === auth?.user?.id
    ) || {
        id: auth?.user?.id || 4,
        userId: auth?.user?.id || 4,
        name: auth?.user?.name || "Patient",
        email: auth?.user?.email || "patient@healthcare.com"
    };

    const [activeDoctorId, setActiveDoctorId] = useState(dummyDoctors[0].id);
    const [inputMessage, setInputMessage] = useState("");

    const activeDoctor = dummyDoctors.find((d) => d.id === Number(activeDoctorId)) || dummyDoctors[0];

    const chatHistory = reduxMessages.filter(
        (m) => m.patientId === currentPatient.id && m.doctorId === Number(activeDoctorId)
    );

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        dispatch(sendMessage({
            patientId: currentPatient.id,
            doctorId: activeDoctorId,
            sender: "patient",
            text: inputMessage.trim(),
        }));

        setInputMessage("");
    };

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                    Clinical Messaging
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    Doctor Consultation Chat
                </h1>
                <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed">
                    Direct secure messaging channel with attending medical specialists in Kerala.
                </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 overflow-hidden min-h-[500px]">
                <div className="border-b md:border-b-0 md:border-r border-slate-200 p-4 space-y-3 bg-slate-50/50">
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider px-2">
                        Specialist Doctors
                    </h3>
                    <div className="space-y-2">
                        {dummyDoctors.map((doc) => {
                            const doctorMsgs = reduxMessages.filter(
                                (m) => m.patientId === currentPatient.id && m.doctorId === doc.id
                            );
                            const lastMsg = doctorMsgs[doctorMsgs.length - 1];
                            const isSelected = doc.id === Number(activeDoctorId);

                            return (
                                <div
                                    key={doc.id}
                                    onClick={() => setActiveDoctorId(doc.id)}
                                    className={`p-3 rounded-2xl cursor-pointer transition flex items-center gap-3 ${
                                        isSelected
                                            ? "bg-white border border-teal-300 shadow-sm"
                                            : "hover:bg-white/80 border border-transparent"
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 font-bold flex items-center justify-center shrink-0">
                                        {doc.name.replace(/^Dr\.?\s*/i, "").charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-slate-900 text-xs truncate">
                                            {doc.name}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                            {lastMsg ? lastMsg.text : doc.specialization}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="md:col-span-2 flex flex-col h-[500px] justify-between bg-white">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-teal-400 font-bold flex items-center justify-center shrink-0">
                            {activeDoctor.name.replace(/^Dr\.?\s*/i, "").charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">{activeDoctor.name}</h4>
                            <p className="text-[10px] text-teal-600 font-semibold">{activeDoctor.specialization} • {activeDoctor.location}</p>
                        </div>
                    </div>

                    <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50/20">
                        {chatHistory.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                                No message history with {activeDoctor.name} yet. Send a query below.
                            </div>
                        ) : (
                            chatHistory.map((msg) => {
                                const isMe = msg.sender === "patient";
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                                isMe
                                                    ? "bg-teal-600 text-white rounded-br-none shadow-sm"
                                                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                                            }`}
                                        >
                                            <p>{msg.text}</p>
                                            <span
                                                className={`block text-[9px] mt-1 text-right ${
                                                    isMe ? "text-teal-200" : "text-slate-400"
                                                }`}
                                            >
                                                {msg.time} • {msg.date}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            placeholder={`Message ${activeDoctor.name}...`}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-teal-500 focus:bg-white transition text-slate-800"
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim()}
                            className="bg-slate-900 hover:bg-teal-600 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

export default Messages;
