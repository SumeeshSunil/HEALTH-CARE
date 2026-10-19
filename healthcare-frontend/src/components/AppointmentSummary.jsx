import { CalendarDays, Clock3, Stethoscope, UserRound, Receipt } from 'lucide-react';
import { inr } from '../utils/appointmentView.js';
function Badge({ value, children }) { return <span className={'portal-badge portal-badge--' + value}>{children || value.replaceAll('_', ' ')}</span>; }
export default function AppointmentSummary({ appointment, showPatient = false, children }) {
 const bill = appointment.bill;
 return <article className="portal-appointment">
  <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="portal-doctor-icon"><Stethoscope size={24}/></div><div><h2 className="text-lg font-extrabold text-slate-900">{appointment.doctorName}</h2><p className="text-sm font-medium text-teal-700">{appointment.department}</p></div></div><div className="sm:text-right"><p className="text-xs font-semibold text-slate-500">Consultation fee</p><p className="text-xl font-extrabold text-slate-900">{inr(bill.amount)}</p></div></div>
  {showPatient && <div className="portal-patient"><UserRound size={17}/><div><p className="font-semibold">{appointment.patientName}</p><p className="text-xs text-slate-500 break-all">{appointment.patientEmail}</p></div></div>}
  <div className="portal-visit"><span><CalendarDays size={17}/>{appointment.date}</span><span><Clock3 size={17}/>{appointment.time} <small>India time</small></span></div>
  {appointment.reason && <p className="text-sm text-slate-600 leading-relaxed">{appointment.reason}</p>}
  <div className="flex flex-wrap gap-2"><Badge value={appointment.status}/><Badge value={bill.status}>Payment: {bill.status.replaceAll('_', ' ')}{bill.isDemo ? ' (demo)' : ''}</Badge></div>
  <div className="portal-invoice"><Receipt size={16}/><div className="min-w-0"><p className="break-all">{bill.invoiceNumber}</p><p>{bill.paymentChoice === 'hospital' ? 'Pay at hospital' : 'Pay now (demo)'}{bill.paymentMethod ? ' · ' + bill.paymentMethod : ''}</p></div></div>
  {bill.status === 'refund_pending' && <p className="portal-notice">Refund pending. Hospital administration must record its completion.</p>}
  {children && <div className="portal-appointment-actions">{children}</div>}
 </article>;
}
