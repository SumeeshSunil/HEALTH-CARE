import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user");

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: storedUser ? JSON.parse(storedUser) : null,
        isAuthenticated: !!storedUser,
        loading: false,
        error: null,
    },
    reducers: {
        login: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.error = null;
            localStorage.setItem("user", JSON.stringify(action.payload));
        },
        loginSuccess: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.error = null;
            localStorage.setItem("user", JSON.stringify(action.payload));
        },
        loginFailure: (state, action) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            localStorage.removeItem("user");
        }
    }
});

export const { login, loginSuccess, loginFailure, logout } = authSlice.actions;

export default authSlice.reducer;