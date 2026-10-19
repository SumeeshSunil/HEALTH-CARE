import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import WeeklySlots from '../../components/WeeklySlots';
import { slotsToForm, formToSlots } from '../../utils/weeklySlots.js';
import { apiRequest } from '../../services/api';
import { fetchHospitalData } from '../../redux/slices/doctorSlice';

export default function DoctorTimings() {
    const token = useSelector(state => state.auth.token);
    const dispatch = useDispatch();
    const [params, setParams] = useSearchParams();
    const selectedId = params.get('doctor') || '';
    const [doctors, setDoctors] = useState([]);
    const doctor = doctors.find(item => item.id === selectedId);
    const [slots, setSlots] = useState(slotsToForm());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [reload, setReload] = useState(0);
    useEffect(() => {
        let current = true;
        setLoading(true); setError('');
        apiRequest('/hospital/doctors?includeInactive=true', { token })
            .then(data => { if (current) setDoctors(data.doctors); })
            .catch(err => { if (current) setError(err.message); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, [token, reload]);
    useEffect(() => { setSlots(slotsToForm(doctor?.availability)); }, [doctor]);

    async function submit(e) {
        e.preventDefault();
        if (!doctor) return;
        setSaving(true); setError(''); setMessage('');
        try {
            const data = await apiRequest('/hospital/doctors/' + doctor.id + '/availability', {
                method: 'PUT', token, body: { availability: formToSlots(slots) },
            });
            // Keep admin-only email information while replacing the saved schedule.
            setDoctors(items => items.map(item => item.id === data.doctor.id ? { ...item, ...data.doctor } : item));
            dispatch(fetchHospitalData());
            setMessage('Consultation timings saved for ' + doctor.name + '.');
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    }
    const busy = loading || saving;
    return <Layout>
        <header><p className="text-sm text-teal-700 font-semibold">Doctor Schedules</p><h1 className="text-3xl font-bold mt-1">Doctor Timings</h1>
            <p className="text-slate-500 mt-2">Choose a created doctor and manage their weekly consultation slots.</p></header>
        {loading && <p role="status">Loading doctors...</p>}
        {error && <p role="alert" className="text-red-700">{error} <button className="underline" disabled={saving} onClick={() => setReload(n => n + 1)}>Reload</button></p>}
        {message && <p role="status" className="text-teal-700">{message}</p>}
        {!loading && !error && !doctors.length && <p>No doctors created yet. <Link className="underline text-teal-700" to="/admin/doctors/create">Create a doctor first</Link>.</p>}
        <section className="bg-white p-6 rounded-2xl space-y-3">
            <label htmlFor="timings-doctor" className="font-semibold">Created doctor</label>
            <select id="timings-doctor" disabled={busy} className="block border rounded-lg p-3 w-full" value={selectedId} onChange={e => { setParams(e.target.value ? { doctor: e.target.value } : {}); setError(''); setMessage(''); }}>
                <option value="">Choose a doctor</option>
                {doctors.map(item => <option key={item.id} value={item.id}>{item.name} - {item.specialization}{item.isActive ? '' : ' (Disabled)'}</option>)}
            </select>
            {doctor && <p className="text-sm text-slate-500">{doctor.email} | {doctor.specialization}</p>}
            {doctor && !doctor.isActive && <p className="text-sm">This account is disabled. Saved timings will be available to patients when the account is enabled.</p>}
            {!loading && selectedId && !doctor && <p role="alert">Doctor not found. Choose a doctor from the list.</p>}
        </section>
        {doctor && <form className="bg-white p-6 rounded-2xl space-y-4" onSubmit={submit}>
            <h2 className="text-xl font-bold">{doctor.name}</h2>
            <WeeklySlots value={slots} onChange={setSlots} disabled={busy} />
            <button disabled={busy} className="bg-teal-700 text-white p-3 rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save doctor timings'}</button>
        </form>}
    </Layout>;
}
