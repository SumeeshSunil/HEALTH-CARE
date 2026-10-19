import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import appointmentReducer from "./slices/appointmentSlice";
import recordsReducer from "./slices/recordsSlice";
import patientReducer from "./slices/patientSlice";
import notificationReducer from "./slices/notificationSlice";
import messageReducer from "./slices/messageSlice";
import doctorReducer from "./slices/doctorSlice";
import usersReducer from "./slices/usersSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        appointment: appointmentReducer,        records: recordsReducer,
        patient: patientReducer,
        notifications: notificationReducer,
        messages: messageReducer,
        doctors: doctorReducer,
        users: usersReducer,
    }
});