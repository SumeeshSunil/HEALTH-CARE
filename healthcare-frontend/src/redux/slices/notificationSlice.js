import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';
export const fetchNotifications = createAsyncThunk('notifications/load', async (_, { getState, rejectWithValue }) => {
    try { return await apiRequest('/notifications', { token: getState().auth.token }); }
    catch (e) { return rejectWithValue(e.message); }
});
function readAction(name, all) {
    return createAsyncThunk(name, async (id, { getState, rejectWithValue }) => {
        const state = getState();
        const keys = all ? state.notifications.notifications.filter(n => n.unread).map(n => n.id) : [id];
        try {
            for (let offset = 0; offset < keys.length; offset += 500) await apiRequest('/notifications/read', {
                token: state.auth.token, method: 'POST', body: { keys: keys.slice(offset, offset + 500) },
            });
            return keys;
        } catch (e) { return rejectWithValue(e.message); }
    });
}
export const markRead = readAction('notifications/read', false);
export const markAllRead = readAction('notifications/readAll', true);
const initialState = { notifications: [], error: null, requestId: null };
const slice = createSlice({ name: 'notifications', initialState, reducers: {}, extraReducers: b => {
    b.addCase(fetchNotifications.pending, (s, a) => { s.requestId = a.meta.requestId; s.error = null; });
    b.addCase(fetchNotifications.fulfilled, (s, a) => { if (s.requestId === a.meta.requestId) { s.notifications = a.payload.notifications; s.requestId = null; } });
    b.addCase(fetchNotifications.rejected, (s, a) => { if (s.requestId === a.meta.requestId) { s.error = a.payload; s.requestId = null; } });
    for (const action of [markRead, markAllRead]) {
        b.addCase(action.fulfilled, (s, a) => { s.notifications.forEach(n => { if (a.payload.includes(n.id)) n.unread = false; }); s.error = null; s.requestId = null; });
        b.addCase(action.rejected, (s, a) => { s.error = a.payload; });
    }
    b.addCase('auth/logout', () => initialState);
} });
export default slice.reducer;
