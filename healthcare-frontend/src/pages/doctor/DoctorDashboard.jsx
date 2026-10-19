import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import AppointmentRefresh from '../../components/AppointmentRefresh';
import { hospitalToday } from '../../utils/appointmentView.js';
export default function DoctorDashboard() {
    const user = useSelector(state => state.auth.user);
    const appointments = useSelector(state => state.appointment.appointments);
    return <Layout><h1 className="text-3xl font-bold">Welcome, {user.name}</h1><AppointmentRefresh />
        <div className="grid sm:grid-cols-3 gap-4">{[["Today's consultations",appointments.filter(item => item.date === hospitalToday() && ['confirmed','completed'].includes(item.status)).length],['Awaiting admin approval',appointments.filter(item => item.status === 'pending').length],['Completed consultations',appointments.filter(item => item.status === 'completed').length]].map(([label,value]) => <article key={label} className="bg-white p-6 rounded-2xl"><h2 className="text-sm text-slate-500">{label}</h2><p className="text-3xl font-bold mt-2">{value}</p></article>)}</div>
        <div className="bg-white p-6 rounded-2xl flex flex-wrap gap-5"><Link className="text-teal-700 underline" to="/doctor/appointments">Consultation queue</Link><Link className="text-teal-700 underline" to="/doctor/schedule">My Schedule</Link><Link className="text-teal-700 underline" to="/doctor/profile">My Profile</Link></div>
    </Layout>;
}
