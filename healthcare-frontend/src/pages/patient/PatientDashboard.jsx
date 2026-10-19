import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import AppointmentRefresh from '../../components/AppointmentRefresh';
import { inr, billingTotals, hospitalToday } from '../../utils/appointmentView.js';
export default function PatientDashboard() {
    const user = useSelector(state => state.auth.user);
    const appointments = useSelector(state => state.appointment.appointments);
    const totals = billingTotals(appointments);
    const upcoming = appointments.filter(item => ['pending','confirmed'].includes(item.status) && item.date >= hospitalToday());
    return <Layout><h1 className="text-3xl font-bold">Welcome, {user.name}</h1><AppointmentRefresh />
        <div className="grid sm:grid-cols-3 gap-4">{[['Upcoming visits',upcoming.length],['Pending approvals',appointments.filter(item => item.status === 'pending').length],['Unpaid consultation fees',inr(totals.unpaid)]].map(([label,value]) => <article key={label} className="bg-white p-6 rounded-2xl"><h2 className="text-sm text-slate-500">{label}</h2><p className="text-3xl font-bold mt-2">{value}</p></article>)}</div>
        <div className="bg-white p-6 rounded-2xl flex flex-wrap gap-5"><Link to="/patient/doctor-search" className="text-teal-700 underline">Book a consultation</Link><Link to="/patient/my-appointments" className="text-teal-700 underline">My Appointments</Link><Link to="/patient/billing" className="text-teal-700 underline">Consultation bills</Link></div>
    </Layout>;
}
