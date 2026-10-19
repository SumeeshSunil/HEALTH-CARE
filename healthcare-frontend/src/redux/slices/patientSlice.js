import { createSlice } from "@reduxjs/toolkit";
import patientsData from "../../data/dummyPatients.json";

const patientSlice = createSlice({
    name: 'patient',
    initialState: {
        patients: patientsData,
    },
    reducers: {
        addPatient: (state, action) => {
            const newPatient = action.payload;
            const exists = state.patients.find((p) => p.userId === newPatient.userId || p.id === newPatient.id || (newPatient.email && p.email?.toLowerCase() === newPatient.email?.toLowerCase()));
            if (!exists) {
                state.patients.push(newPatient);
            }
        },
        updatePatientProfile: (state, action) => {
            const updated = action.payload;
            const index = state.patients.findIndex(
                (p) => p.id === updated.id || p.userId === updated.userId || (updated.email && p.email?.toLowerCase() === updated.email?.toLowerCase())
            );

            if (index !== -1) {
                state.patients[index] = { ...state.patients[index], ...updated };
            } else {
                state.patients.push(updated);
            }
        }
    }
});

export const { addPatient, updatePatientProfile } = patientSlice.actions;
export default patientSlice.reducer;
