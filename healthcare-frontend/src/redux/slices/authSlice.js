import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api.js';
import { getSavedToken } from '../../services/session.js';

function credentialsThunk(name, path) {
    return createAsyncThunk(name, async (credentials, { rejectWithValue }) => {
        try { return await apiRequest(path, { method: 'POST', body: credentials }); }
        catch (err) { return rejectWithValue({ message: err.message, status: err.status }); }
    });
}

export const loginUser = credentialsThunk('auth/login', '/auth/login');
export const registerPatient = credentialsThunk('auth/register', '/auth/register');
export const restoreSession = createAsyncThunk('auth/restore', async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return { user: null, token: null };
    try {
        const data = await apiRequest('/auth/me', { token });
        return { user: data.user, token };
    } catch (err) { return rejectWithValue({ message: err.message, status: err.status }); }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null, token: getSavedToken(), isAuthenticated: false,
        loading: true, error: null, requestId: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            state.requestId = null;
        },
        // Existing profile screens still edit demo data until profile migration.
        updateLocalProfile: (state, action) => {
            if (state.user) state.user.name = action.payload.name;
        },
    },
    extraReducers: (builder) => {
        for (const thunk of [loginUser, registerPatient, restoreSession]) {
            builder.addCase(thunk.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                state.requestId = action.meta.requestId;
            });
            builder.addCase(thunk.fulfilled, (state, action) => {
                if (state.requestId !== action.meta.requestId) return;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = !!action.payload.user;
                state.loading = false;
                state.requestId = null;
            });
            builder.addCase(thunk.rejected, (state, action) => {
                if (state.requestId !== action.meta.requestId) return;
                state.loading = false;
                state.requestId = null;
                state.error = action.payload?.message || 'Sign-in failed. Try again.';
                state.user = null;
                state.isAuthenticated = false;
                if (action.payload?.status === 401 || thunk !== restoreSession) state.token = null;
            });
        }
    },
});

export const { logout, updateLocalProfile } = authSlice.actions;
export default authSlice.reducer;
