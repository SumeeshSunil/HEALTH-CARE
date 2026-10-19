import PortalHeader from '../../components/PortalHeader';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import DemoPayment from '../../components/DemoPayment';
import AppointmentSummary from '../../components/AppointmentSummary';
import { apiRequest } from '../../services/api';
import { bookAppointment } from '../../redux/slices/appointmentSlice';
import { fetchHospitalData } from '../../redux/slices/doctorSlice';
import { hospitalToday, inr } from '../../utils/appointmentView.js';

export default function BookAppointment() {
    const { doctorId } = useParams();
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const { doctors, hospital, loading, error: directoryError } = useSelector(state => state.doctors);
    const doctor = doctors.find(item => item.id === doctorId);
    const appointments = useSelector(state => state.appointment.appointments);
    const [date, setDate] = useState(hospitalToday());
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [paymentChoice, setPaymentChoice] = useState('hospital');
    const [bookingKey] = useState(() => crypto.randomUUID());
    const [slots, setSlots] = useState([]);
    const [slotLoading, setSlotLoading] = useState(true);
    const [demoEnabled, setDemoEnabled] = useState(false);
    const [error, setError] = useState('');
    const [slotError, setSlotError] = useState('');
    const [saving, setSaving] = useState(false);
    const [createdId, setCreatedId] = useState(null);
    const [refresh, setRefresh] = useState(0);
    const created = appointments.find(item => item.id === createdId);
    useEffect(() => {
        let current = true;
        setSlotLoading(true); setSlotError(''); setSlots([]); setTime('');
        apiRequest('/appointments/availability?doctorId=' + encodeURIComponent(doctorId) + '&date=' + encodeURIComponent(date), { token })
            .then(data => { if (current) { setSlots(data.slots); setDemoEnabled(data.demoPaymentsEnabled); } })
            .catch(err => { if (current) setSlotError(err.message); })
            .finally(() => { if (current) setSlotLoading(false); });
        return () => { current = false; };
    }, [doctorId, date, token, refresh]);
    async function submit(e) {
        e.preventDefault(); setSaving(true); setError('');
        try {
            const result = await dispatch(bookAppointment({ doctorId, date, time, reason, paymentChoice, bookingKey })).unwrap();
            setCreatedId(result.appointment.id);
        } catch (err) { setError(typeof err === 'string' ? err : 'Booking failed'); setRefresh(n => n + 1); }
        finally { setSaving(false); }
    }
    if (created) return <Layout><PortalHeader title={<>Appointment requested</>} />
        <p>Your booking is saved and awaiting hospital approval. Payment status is tracked separately.</p>
        <AppointmentSummary appointment={created}>
            <DemoPayment key={created.id} appointment={created} enabled={demoEnabled} startOpen={paymentChoice === 'online'} />
        </AppointmentSummary>
        <Link className="portal-button portal-button--primary" to="/patient/my-appointments">View My Appointments</Link>
    </Layout>;
    return <Layout><PortalHeader title={<>Book a consultation</>} />
        {loading && <p role="status">Loading doctor...</p>}
        {directoryError && <p role="alert">{directoryError} <button onClick={() => dispatch(fetchHospitalData())}>Retry</button></p>}
        {!loading && !doctor && <p>Doctor unavailable. <Link to="/patient/doctor-search" className="portal-button portal-button--secondary">Choose another hospital doctor</Link>.</p>}
        {doctor && <form onSubmit={submit} className="portal-booking space-y-6 max-w-4xl">
            <header><h2 className="text-xl font-bold">{doctor.name}</h2><p>{doctor.specialization} | {hospital?.name}</p><p className="font-semibold mt-2">Consultation fee: {inr(doctor.fee)}</p></header>
            {(error || slotError) && <p role="alert" className="text-red-700">{error || slotError}</p>}
            <fieldset disabled={saving} className="space-y-4">
                <label className="block text-sm">Appointment date (India time)<input type="date" required min={hospitalToday()} value={date} onChange={e => setDate(e.target.value)} className="block border rounded-lg p-3 mt-1" /></label>
                {slotLoading ? <p role="status">Checking available slots...</p> : <label className="block text-sm">Consultation time<select required value={time} onChange={e => setTime(e.target.value)} className="block border rounded-lg p-3 mt-1 w-full">
                    <option value="">Choose a time</option>{slots.map(slot => <option key={slot.time} value={slot.time} disabled={slot.remaining === 0}>{slot.time} - {slot.remaining === 0 ? 'Full' : slot.remaining + ' places available'}</option>)}
                </select></label>}
                {!slotLoading && !slots.length && <p>No future consultation slots on this date. Choose another date.</p>}
                <label className="block text-sm">Reason for visit<textarea maxLength={2000} value={reason} onChange={e => setReason(e.target.value)} className="block border rounded-lg p-3 mt-1 w-full" /></label>
                <fieldset className="space-y-3"><legend className="font-bold mb-2">How would you like to pay?</legend>
                    <label className="flex gap-2 items-center"><input type="radio" name="paymentChoice" value="hospital" checked={paymentChoice === 'hospital'} onChange={() => setPaymentChoice('hospital')} />Pay at hospital</label>
                    <p className="text-sm text-slate-500">The bill remains unpaid until hospital staff record your cash, card or online payment.</p>
                    <label className="flex gap-2 items-center"><input type="radio" name="paymentChoice" value="online" disabled={!demoEnabled} checked={paymentChoice === 'online'} onChange={() => setPaymentChoice('online')} />Pay now (project demo)</label>
                    <p className="text-sm text-amber-800">Online checkout is simulated. No real money is collected.{!demoEnabled ? ' Demo payments are currently disabled.' : ''}</p>
                </fieldset>
            </fieldset>
            <button disabled={saving || slotLoading || !time || (paymentChoice === 'online' && !demoEnabled)} className="portal-button portal-button--primary w-full">{saving ? 'Saving booking...' : paymentChoice === 'online' ? 'Book and continue to demo payment' : 'Book - pay at hospital'}</button>
        </form>}
    </Layout>;
}
