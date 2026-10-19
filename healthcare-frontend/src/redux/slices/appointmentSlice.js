import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';

export const fetchAppointments = createAsyncThunk('appointment/load', async (_, { getState, rejectWithValue }) => {
    try { return await apiRequest('/appointments', { token: getState().auth.token }); }
    catch (err) { return rejectWithValue(err.message); }
});
function mutation(name, request) {
    return createAsyncThunk('appointment/' + name, async (arg, { getState, rejectWithValue }) => {
        try {
            const { path, method, body } = request(arg);
            return await apiRequest(path, { method, body, token: getState().auth.token });
        } catch (err) { return rejectWithValue(err.message); }
    });
}
export const bookAppointment = mutation('book', body => ({ path: '/appointments', method: 'POST', body }));
const statusAction = (name, status) => mutation(name, id => ({ path: '/appointments/' + id + '/status', method: 'PATCH', body: { status } }));
export const cancelAppointment = statusAction('cancel', 'cancelled');
export const approveAppointment = statusAction('approve', 'confirmed');
export const rejectAppointment = statusAction('reject', 'rejected');
export const completeAppointment = statusAction('complete', 'completed');
export const demoPayment = mutation('demoPayment', ({ id, outcome }) => ({ path: '/appointments/' + id + '/payment/demo', method: 'POST', body: { outcome } }));
export const recordHospitalPayment = mutation('hospitalPayment', ({ id, method }) => ({ path: '/appointments/' + id + '/payment/hospital', method: 'POST', body: { method } }));
export const recordRefund = mutation('refund', id => ({ path: '/appointments/' + id + '/payment/refund', method: 'POST' }));

const initialState = { appointments: [], loading: false, error: null, requestId: null, pending: {}, demoPaymentsEnabled: false };
const slice = createSlice({
    name: 'appointment', initialState, reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchAppointments.pending, (state, action) => { state.loading = true; state.error = null; state.requestId = action.meta.requestId; });
        builder.addCase(fetchAppointments.fulfilled, (state, action) => {
            if (state.requestId !== action.meta.requestId) return;
            state.appointments = action.payload.appointments.map(incoming => {
                const current = state.appointments.find(item => item.id === incoming.id);
                return current && current.version > incoming.version ? current : incoming;
            }); state.demoPaymentsEnabled = action.payload.demoPaymentsEnabled;
            state.loading = false; state.requestId = null;
        });
        builder.addCase(fetchAppointments.rejected, (state, action) => {
            if (state.requestId !== action.meta.requestId) return;
            state.loading = false; state.requestId = null; state.error = action.payload || 'Could not load appointments';
        });
        for (const action of [bookAppointment, cancelAppointment, approveAppointment, rejectAppointment, completeAppointment, demoPayment, recordHospitalPayment, recordRefund]) {
            builder.addCase(action.pending, (state, result) => { state.pending[result.meta.requestId] = true; state.error = null; });
            builder.addCase(action.fulfilled, (state, result) => {
                if (!state.pending[result.meta.requestId]) return;
                delete state.pending[result.meta.requestId];
                const saved = result.payload.appointment;
                const index = state.appointments.findIndex(item => item.id === saved.id);
                if (index < 0) state.appointments.unshift(saved);
                else if ((saved.version ?? 0) >= (state.appointments[index].version ?? 0)) state.appointments[index] = saved;
                // Ignore an older list request that could overwrite this newer server response.
                state.requestId = null; state.loading = false; state.error = null;
            });
            builder.addCase(action.rejected, (state, result) => {
                if (!state.pending[result.meta.requestId]) return;
                delete state.pending[result.meta.requestId]; state.error = result.payload || 'Appointment update failed';
            });
        }
        builder.addCase('auth/logout', () => initialState);
    },
});
export default slice.reducer;
