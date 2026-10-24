import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';

export const fetchRecords = createAsyncThunk('records/load', async (_, { getState, rejectWithValue }) => {
    try { return await apiRequest('/records', { token: getState().auth.token }); }
    catch (e) { return rejectWithValue(e.message); }
});
const initialState = { records: [], loading: false, error: null, requestId: null };
const slice = createSlice({
    name: 'records', initialState, reducers: {},
    extraReducers: b => {
        b.addCase(fetchRecords.pending, (s, a) => { s.loading = true; s.error = null; s.requestId = a.meta.requestId; });
        b.addCase(fetchRecords.fulfilled, (s, a) => { if (s.requestId === a.meta.requestId) { s.records = a.payload.records; s.loading = false; s.requestId = null; } });
        b.addCase(fetchRecords.rejected, (s, a) => { if (s.requestId === a.meta.requestId) { s.error = a.payload; s.loading = false; s.requestId = null; } });
        b.addCase('auth/logout', () => initialState);
    },
});
export default slice.reducer;
