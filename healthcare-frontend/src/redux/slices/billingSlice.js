import { createSlice } from "@reduxjs/toolkit";
import billsData from "../../data/dummyBills.json";

const billingSlice = createSlice({
    name: 'billing',
    initialState: {
        bills: billsData,
    },
    reducers: {
        addBill: (state, action) => {
            state.bills.push(action.payload);
        },
        payBill: (state, action) => {
            const payload = action.payload;
            const billId = typeof payload === "object" ? payload.billId : payload;
            const paymentMethod = typeof payload === "object" && payload.paymentMethod ? payload.paymentMethod : "UPI";

            const bill = state.bills.find((b) => Number(b.id) === Number(billId));
            if (bill) {
                bill.status = "paid";
                bill.paymentMethod = paymentMethod;
                bill.paidOn = new Date().toISOString().split("T")[0];
            }
        }
    }
});

export const { addBill, payBill } = billingSlice.actions;
export default billingSlice.reducer;
