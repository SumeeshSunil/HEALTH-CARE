export const inr = amount => 'INR ' + Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function hospitalToday(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return values.year + '-' + values.month + '-' + values.day;
}
export function billingTotals(appointments) {
    const totals = { received: 0, demo: 0, unpaid: 0, refundPending: 0 };
    for (const appointment of appointments) {
        const bill = appointment.bill;
        if (bill.status === 'paid') totals[bill.isDemo ? 'demo' : 'received'] += bill.amount;
        if (bill.status === 'unpaid') totals.unpaid += bill.amount;
        if (bill.status === 'refund_pending') totals.refundPending += bill.amount;
    }
    return totals;
}
