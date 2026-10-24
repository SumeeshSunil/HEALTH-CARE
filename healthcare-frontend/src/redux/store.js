import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import appointmentReducer from "./slices/appointmentSlice";
import recordsReducer from "./slices/recordsSlice";
import notificationReducer from "./slices/notificationSlice";
import doctorReducer from "./slices/doctorSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        appointment: appointmentReducer,        records: recordsReducer,
        notifications: notificationReducer,
        doctors: doctorReducer,
    }
});
