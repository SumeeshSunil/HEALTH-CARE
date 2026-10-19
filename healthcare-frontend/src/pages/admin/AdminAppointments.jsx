import PortalHeader from '../../components/PortalHeader';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import AppointmentRefresh from '../../components/AppointmentRefresh';
import AppointmentSummary from '../../components/AppointmentSummary';
import { approveAppointment, rejectAppointment, cancelAppointment, recordHospitalPayment, recordRefund } from '../../redux/slices/appointmentSlice';

export default function AdminAppointments() {
    const { appointments, loading } = useSelector(state => state.appointment);
    const dispatch = useDispatch();
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [busy, setBusy] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [methods, setMethods] = useState({});
    async function act(action, id, text) {
        setBusy(id); setError(''); setMessage('');
        try { await dispatch(action).unwrap(); setMessage(text); }
        catch (err) { setError(typeof err === 'string' ? err : 'Appointment update failed'); }
        finally { setBusy(null); }
    }
    const filtered = appointments.filter(item => (filter === 'all' || item.status === filter)
        && (item.patientName + ' ' + item.doctorName + ' ' + item.patientEmail).toLowerCase().includes(query.toLowerCase()));
    return <Layout><PortalHeader title={<>Appointments and consultation payments</>} /><AppointmentRefresh />
        <div className="portal-filter"><label className="text-sm">Status <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded-lg p-2">{['all','pending','confirmed','completed','cancelled','rejected'].map(value => <option key={value}>{value}</option>)}</select></label>
            <label className="text-sm">Patient or doctor <input value={query} onChange={e => setQuery(e.target.value)} className="border rounded-lg p-2" /></label></div>
        {error && <p role="alert" className="text-red-700">{error}</p>}{message && <p role="status" className="text-teal-700">{message}</p>}
        {!loading && !filtered.length && <div className="portal-empty"><h2>No appointments to show</h2><p>Your appointments will appear here. Try another status filter or book a consultation.</p></div>}
        {filtered.map(item => <AppointmentSummary key={item.id} appointment={item} showPatient>
            <div className="flex flex-wrap gap-3">
                {item.status === 'pending' && <><button disabled={busy !== null} className="portal-button portal-button--primary" onClick={() => act(approveAppointment(item.id), item.id, 'Appointment approved')}>Approve appointment</button>
                    <button disabled={busy !== null} className="portal-button portal-button--secondary" onClick={() => act(rejectAppointment(item.id), item.id, 'Appointment rejected')}>Reject appointment</button></>}
                {item.status === 'confirmed' && <button disabled={busy !== null} className="portal-button portal-button--danger" onClick={() => act(cancelAppointment(item.id), item.id, 'Appointment cancelled')}>Cancel appointment</button>}
            </div>
            {item.bill.status === 'unpaid' && ['pending','confirmed','completed'].includes(item.status) && <div className="portal-payment-record space-y-3">
                <p className="text-sm">Record payment only after the hospital has received it. This action does not process a card or transfer money.</p>
                <label className="text-sm">Received payment method <select disabled={busy !== null} value={methods[item.id] || 'cash'} className="border rounded-lg p-2" onChange={e => setMethods({ ...methods, [item.id]: e.target.value })}>
                    <option value="cash">Cash</option><option value="card">Card</option><option value="online">Online transfer / UPI</option>
                </select></label>
                <button disabled={busy !== null} className="portal-button portal-button--dark" onClick={() => act(recordHospitalPayment({ id: item.id, method: methods[item.id] || 'cash' }), item.id, 'Received payment recorded')}>{busy === item.id ? 'Saving...' : 'Record payment received'}</button>
            </div>}
            {item.bill.status === 'refund_pending' && <div className="space-y-2"><p className="text-sm">{item.bill.isDemo ? 'This was a demo payment; no actual money needs to be returned.' : 'Complete the refund outside the app, then record it below.'}</p>
                <button disabled={busy !== null} className="portal-button portal-button--secondary" onClick={() => act(recordRefund(item.id), item.id, 'Refund completion recorded')}>{item.bill.isDemo ? 'Complete demo refund' : 'Record refund completed'}</button></div>}
        </AppointmentSummary>)}
    </Layout>;
}
