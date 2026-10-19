import { createSlice } from "@reduxjs/toolkit";
import dummyDoctors from "../../data/dummyDoctors.json";

const doctorSlice = createSlice({
    name: "doctors",
    initialState: {
        doctors: dummyDoctors,
    },
    reducers: {
        addDoctor: (state, action) => {
            const newDoc = action.payload;
            const exists = state.doctors.find((d) => d.userId === newDoc.userId || d.id === newDoc.id || d.name === newDoc.name);
            if (!exists) {
                state.doctors.push(newDoc);
            }
        },
        updateDoctorSchedule: (state, action) => {
            const { doctorId, availability } = action.payload;
            const doctor = state.doctors.find((d) => d.id === Number(doctorId) || d.userId === Number(doctorId));
            if (doctor) {
                doctor.availability = availability;
            }
        },
        updateDoctorProfile: (state, action) => {
            const { doctorId, updatedData } = action.payload;
            const index = state.doctors.findIndex((d) => d.id === Number(doctorId) || d.userId === Number(doctorId));
            if (index !== -1) {
                state.doctors[index] = { ...state.doctors[index], ...updatedData };
            } else {
                state.doctors.push({ id: doctorId, userId: doctorId, ...updatedData });
            }
        }
    }
});

export const { addDoctor, updateDoctorSchedule, updateDoctorProfile } = doctorSlice.actions;
export default doctorSlice.reducer;
