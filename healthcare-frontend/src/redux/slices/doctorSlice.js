import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';

export const fetchHospitalData = createAsyncThunk('doctors/loadHospital', async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
        const [details, departments, doctors] = await Promise.all([
            apiRequest('/hospital', { token }), apiRequest('/hospital/departments', { token }), apiRequest('/hospital/doctors', { token }),
        ]);
        return { hospital: details.hospital, departments: departments.departments, doctors: doctors.doctors };
    } catch (err) { return rejectWithValue(err.message); }
});

const initialState = { doctors: [], departments: [], hospital: null, loading: false, error: null, requestId: null };
const doctorSlice = createSlice({
    name: 'doctors', initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchHospitalData.pending, (state, action) => {
            state.loading = true; state.error = null; state.requestId = action.meta.requestId;
        });
        builder.addCase(fetchHospitalData.fulfilled, (state, action) => {
            if (state.requestId !== action.meta.requestId) return;
            Object.assign(state, action.payload, { loading: false, error: null, requestId: null });
        });
        builder.addCase(fetchHospitalData.rejected, (state, action) => {
            if (state.requestId !== action.meta.requestId) return;
            state.loading = false; state.error = action.payload || 'Could not load hospital details'; state.requestId = null;
        });
        builder.addCase('auth/logout', () => initialState);
    },
});
export default doctorSlice.reducer;
