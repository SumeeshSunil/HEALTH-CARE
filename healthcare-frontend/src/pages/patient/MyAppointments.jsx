import PortalHeader from '../../components/PortalHeader';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import AppointmentRefresh from '../../components/AppointmentRefresh';
import AppointmentSummary from '../../components/AppointmentSummary';
import DemoPayment from '../../components/DemoPayment';
import { cancelAppointment } from '../../redux/slices/appointmentSlice';

export default function MyAppointments() {
    const { appointments, loading, demoPaymentsEnabled } = useSelector(state => state.appointment);
    const [filter, setFilter] = useState('all');
    const [busy, setBusy] = useState(null);
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    async function cancel(id) {
        setBusy(id); setError('');
        try { await dispatch(cancelAppointment(id)).unwrap(); }
        catch (err) { setError(typeof err === 'string' ? err : 'Cancellation failed'); }
        finally { setBusy(null); }
    }
    const filtered = appointments.filter(item => filter === 'all' || item.status === filter);
    return <Layout><PortalHeader title={<>My Appointments</>} /><AppointmentRefresh />
        <Link to="/patient/doctor-search" className="portal-button portal-button--primary">Book another consultation</Link>
        <label className="portal-status-filter">Appointment status <select className="border rounded-lg p-2" value={filter} onChange={e => setFilter(e.target.value)}>{['all','pending','confirmed','completed','cancelled','rejected'].map(value => <option key={value}>{value}</option>)}</select></label>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {!loading && !filtered.length && <div className="portal-empty"><h2>No appointments to show</h2><p>Your appointments will appear here. Try another status filter or book a consultation.</p></div>}
        {filtered.map(item => <AppointmentSummary key={item.id} appointment={item}>
            <DemoPayment appointment={item} enabled={demoPaymentsEnabled} />
            {['pending','confirmed'].includes(item.status) && <button disabled={busy !== null} className="portal-button portal-button--danger" onClick={() => cancel(item.id)}>{busy === item.id ? 'Cancelling...' : 'Cancel appointment'}</button>}
        </AppointmentSummary>)}
    </Layout>;
}
