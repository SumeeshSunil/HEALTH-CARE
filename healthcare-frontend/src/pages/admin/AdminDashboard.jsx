import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import AppointmentRefresh from '../../components/AppointmentRefresh';
import { inr, billingTotals } from '../../utils/appointmentView.js';
export default function AdminDashboard() {
    const appointments = useSelector(state => state.appointment.appointments);
    const doctors = useSelector(state => state.doctors.doctors);
    const totals = billingTotals(appointments);
    return <Layout><h1 className="text-3xl font-bold">Hospital administration</h1><AppointmentRefresh />
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{[['Active doctors',doctors.length],['Patients with bookings',new Set(appointments.map(item => item.patientId)).size],['Pending approvals',appointments.filter(item => item.status === 'pending').length],['Hospital receipts recorded',inr(totals.received)]].map(([label,value]) =>
            <article key={label} className="bg-white rounded-2xl p-6"><h2 className="text-sm text-slate-500">{label}</h2><p className="text-3xl font-bold mt-2">{value}</p></article>)}</div>
        <div className="bg-white p-6 rounded-2xl flex flex-wrap gap-5">{[['/admin/appointments','Appointments and payments'],['/admin/hospital','Hospital Setup'],['/admin/doctors/create','Doctor Creation'],['/admin/doctors/timings','Doctor Timings'],['/admin/users','Manage Users'],['/admin/reports','Payment report']].map(([path,label]) => <Link key={path} className="text-teal-700 underline" to={path}>{label}</Link>)}</div>
    </Layout>;
}
