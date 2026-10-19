import { createSlice } from "@reduxjs/toolkit";

const initialMessages = [
    {
        id: 1,
        patientId: 1,
        doctorId: 1,
        sender: "patient",
        text: "Hello Doctor Arjun, I wanted to ask about my chest pain follow-up.",
        time: "09:30 AM",
        date: "2026-07-28"
    },
    {
        id: 2,
        patientId: 1,
        doctorId: 1,
        sender: "doctor",
        text: "Hello Kannan! Please describe the pain — is it sharp or dull? Any shortness of breath?",
        time: "09:45 AM",
        date: "2026-07-28"
    },
    {
        id: 3,
        patientId: 1,
        doctorId: 1,
        sender: "patient",
        text: "It's a dull ache that subsides after resting. No shortness of breath.",
        time: "10:00 AM",
        date: "2026-07-28"
    },
    {
        id: 4,
        patientId: 1,
        doctorId: 1,
        sender: "doctor",
        text: "Understood. Please continue your prescribed medication and come in if it worsens.",
        time: "10:15 AM",
        date: "2026-07-28"
    },
    {
        id: 5,
        patientId: 2,
        doctorId: 1,
        sender: "patient",
        text: "Dr. Arjun, checking in regarding my recent cholesterol report.",
        time: "02:00 PM",
        date: "2026-07-26"
    },
    {
        id: 6,
        patientId: 2,
        doctorId: 1,
        sender: "doctor",
        text: "Your LDL is slightly elevated. Reduce saturated fats and maintain regular exercise.",
        time: "02:30 PM",
        date: "2026-07-26"
    },
    {
        id: 7,
        patientId: 1,
        doctorId: 2,
        sender: "doctor",
        text: "Hello Kannan! How is your skin rash feeling after applying the cream?",
        time: "11:00 AM",
        date: "2026-07-29"
    },
    {
        id: 8,
        patientId: 1,
        doctorId: 2,
        sender: "patient",
        text: "It has reduced significantly Dr. Priya, thank you!",
        time: "11:20 AM",
        date: "2026-07-29"
    }
];

const messageSlice = createSlice({
    name: "messages",
    initialState: {
        messages: initialMessages,
    },
    reducers: {
        sendMessage: (state, action) => {
            const { patientId, doctorId, sender, text } = action.payload;
            const newMsg = {
                id: Date.now(),
                patientId: Number(patientId),
                doctorId: Number(doctorId),
                sender,
                text,
                time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                date: new Date().toISOString().split("T")[0],
            };
            state.messages.push(newMsg);
        },
    },
});

export const { sendMessage } = messageSlice.actions;
export default messageSlice.reducer;
