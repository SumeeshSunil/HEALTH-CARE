import { inr } from '../utils/appointmentView.js';
export default function AppointmentSummary({ appointment, showPatient = false, children }) {
    const bill = appointment.bill;
    return <article className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold text-lg">{appointment.doctorName}</h2><p className="text-sm text-teal-700">{appointment.department}</p></div>
            <p className="font-semibold">{inr(bill.amount)}</p></div>
        {showPatient && <p className="text-sm">Patient: {appointment.patientName} ({appointment.patientEmail})</p>}
        <p>{appointment.date} at {appointment.time} <span className="text-sm text-slate-500">(India time)</span></p>
        {appointment.reason && <p className="text-sm text-slate-600">{appointment.reason}</p>}
        <div className="flex flex-wrap gap-2 text-sm"><span className="bg-slate-100 px-3 py-1 rounded-full">Appointment: {appointment.status}</span>
            <span className="bg-teal-50 px-3 py-1 rounded-full">Payment: {bill.status.replaceAll('_', ' ')}{bill.isDemo ? ' (demo)' : ''}</span></div>
        <p className="text-xs text-slate-500">{bill.invoiceNumber} | Booking choice: {bill.paymentChoice === 'hospital' ? 'Pay at hospital' : 'Pay now (demo)'}{bill.paymentMethod ? ' | Method: ' + bill.paymentMethod : ''}</p>
        {bill.status === 'refund_pending' && <p className="text-sm text-amber-800">Refund pending. Hospital administration must record its completion.</p>}
        {children}
    </article>;
}
