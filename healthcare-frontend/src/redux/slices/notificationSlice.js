import { createSlice } from "@reduxjs/toolkit";

const initialNotifications = [
    {
        id: 1,
        title: "Appointment Reminder",
        message: "Your upcoming consultation with Dr. Arjun Menon is scheduled for 2026-07-27 at 09:00 AM.",
        time: "2 hours ago",
        unread: true,
        type: "appointment",
        userId: 4
    },
    {
        id: 2,
        title: "Appointment Confirmed",
        message: "Your appointment with Dr. Priya Nair on 2026-07-29 at 01:00 PM has been confirmed by Admin.",
        time: "1 day ago",
        unread: true,
        type: "appointment",
        userId: 4
    },
    {
        id: 3,
        title: "Invoice Issued",
        message: "New billing invoice for ₹1,500.00 is available for settlement.",
        time: "3 days ago",
        unread: false,
        type: "billing",
        userId: 4
    }
];

const notificationSlice = createSlice({
    name: "notifications",
    initialState: {
        notifications: initialNotifications,
    },
    reducers: {
        addNotification: (state, action) => {
            const newNotif = {
                id: Date.now(),
                time: "Just now",
                unread: true,
                ...action.payload,
            };
            state.notifications.unshift(newNotif);
        },
        markRead: (state, action) => {
            const notif = state.notifications.find((n) => n.id === action.payload);
            if (notif) notif.unread = false;
        },
        markAllRead: (state, action) => {
            const { userId } = action.payload || {};
            state.notifications.forEach((n) => {
                if (!userId || n.userId === userId) {
                    n.unread = false;
                }
            });
        },
    },
});

export const { addNotification, markRead, markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;
