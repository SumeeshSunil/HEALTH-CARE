import { createSlice } from "@reduxjs/toolkit";
import dummyUsers from "../../data/dummyUsers.json";

const usersSlice = createSlice({
    name: "users",
    initialState: {
        users: dummyUsers,
    },
    reducers: {
        registerUser: (state, action) => {
            const newUser = action.payload;
            const exists = state.users.find((u) => u.email.toLowerCase() === newUser.email.toLowerCase());
            if (!exists) {
                state.users.push(newUser);
            }
        }
    }
});

export const { registerUser } = usersSlice.actions;
export default usersSlice.reducer;
