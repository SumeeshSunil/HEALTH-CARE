import { createSlice } from "@reduxjs/toolkit";
import recordsData from "../../data/dummyRecords.json";

const recordsSlice = createSlice({
    name: 'records',
    initialState: {
        records: recordsData,
    },
    reducers: {
        addRecord: (state, action) => {
            state.records.push(action.payload);
        }
    }
});

export const { addRecord } = recordsSlice.actions;
export default recordsSlice.reducer;
