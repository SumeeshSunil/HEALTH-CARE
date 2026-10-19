import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import WeeklySlots from '../../components/WeeklySlots';
import { slotsToForm, formToSlots } from '../../utils/weeklySlots.js';
import { apiRequest } from '../../services/api';
import { fetchHospitalData } from '../../redux/slices/doctorSlice';

export default function DoctorSchedule() {
    const { user, token } = useSelector(state => state.auth);
    const { doctors, loading, error } = useSelector(state => state.doctors);
    const doctor = doctors.find(item => item.id === user.id);
    const dispatch = useDispatch();
    const [slots, setSlots] = useState(slotsToForm());
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    useEffect(() => { if (doctor) setSlots(slotsToForm(doctor.availability)); }, [doctor]);
    async function submit(e) {
        e.preventDefault(); setBusy(true); setMessage('');
        try {
            await apiRequest('/hospital/doctors/' + user.id + '/availability', { method: 'PUT', token, body: { availability: formToSlots(slots) } });
            await dispatch(fetchHospitalData()).unwrap(); setMessage('Your weekly schedule has been saved.');
        } catch (err) { setMessage(err.message || err); }
        finally { setBusy(false); }
    }
    return <Layout><h1 className="text-3xl font-bold">My hospital schedule</h1>
        {loading && <p role="status">Loading schedule...</p>}
        {error && <p role="alert">{error} <button className="underline" onClick={() => dispatch(fetchHospitalData())}>Retry</button></p>}
        {message && <p role="status">{message}</p>}
        {!loading && !error && !doctor && <p>Your doctor details are unavailable. Contact hospital administration.</p>}
        {doctor && <form className="bg-white p-6 rounded-2xl space-y-4" onSubmit={submit}>
            <WeeklySlots value={slots} onChange={setSlots} disabled={busy || loading} />
            <button disabled={busy || loading} className="bg-teal-700 text-white p-3 rounded-lg">{busy ? 'Saving...' : 'Save weekly schedule'}</button>
        </form>}
    </Layout>;
}
