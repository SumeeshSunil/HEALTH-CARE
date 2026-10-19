import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { apiRequest } from '../../services/api';
import { fetchHospitalData } from '../../redux/slices/doctorSlice';

const emptyDoctor = { name: '', email: '', password: '', departmentId: '', fee: 0, qualification: '', experience: '', isActive: true };

export default function DoctorCreation() {
    const token = useSelector(state => state.auth.token);
    const dispatch = useDispatch();
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [doctor, setDoctor] = useState(emptyDoctor);
    const [editingId, setEditingId] = useState(null);
    const [savedDoctor, setSavedDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let current = true;
        setLoading(true); setError('');
        Promise.all([apiRequest('/hospital/departments', { token }), apiRequest('/hospital/doctors?includeInactive=true', { token })])
            .then(([d, docs]) => { if (current) { setDepartments(d.departments); setDoctors(docs.doctors); } })
            .catch(err => { if (current) setError(err.message); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, [token, reload]);

    async function submit(e) {
        e.preventDefault(); setSaving(true); setError(''); setMessage(''); setSavedDoctor(null);
        const body = {
            name: doctor.name, email: doctor.email, departmentId: doctor.departmentId,
            fee: Number(doctor.fee), qualification: doctor.qualification,
            experience: doctor.experience, isActive: doctor.isActive,
        };
        if (!editingId) body.password = doctor.password;
        try {
            const data = await apiRequest('/hospital/doctors' + (editingId ? '/' + editingId : ''), {
                method: editingId ? 'PATCH' : 'POST', token, body,
            });
            setMessage(editingId ? 'Doctor details updated.' : 'Doctor account created. Add their consultation slots under Doctor Timings.');
            setSavedDoctor(data.doctor);
            setDoctors(items => [...items.filter(item => item.id !== data.doctor.id), data.doctor].sort((a, b) => a.name.localeCompare(b.name)));
            setDoctor(emptyDoctor); setEditingId(null); dispatch(fetchHospitalData());
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    }
    function field(name, value) { setDoctor(current => ({ ...current, [name]: value })); }
    const busy = loading || saving;
    const inputClass = 'block w-full border border-slate-300 rounded-lg p-2 mt-1';

    return <Layout>
        <header><p className="text-sm text-teal-700 font-semibold">Doctor Schedules</p><h1 className="text-3xl font-bold mt-1">Doctor Creation</h1>
            <p className="text-slate-500 mt-2">Create and manage hospital doctor accounts. Set consultation hours separately in Doctor Timings.</p></header>
        {error && <p role="alert" className="text-red-700">{error} <button className="underline" onClick={() => setReload(n => n + 1)}>Reload</button></p>}
        {message && <div role="status" className="text-teal-700">{message} {savedDoctor && <Link className="underline font-semibold" to={'/admin/doctors/timings?doctor=' + savedDoctor.id}>Set timings for {savedDoctor.name}</Link>}</div>}
        {loading && <p role="status">Loading doctors...</p>}
        <form onSubmit={submit} className="bg-white p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold">{editingId ? 'Edit doctor details' : 'New doctor account'}</h2>
            {!loading && !departments.length && <p>Add departments in <Link to="/admin/hospital" className="underline text-teal-700">Hospital Setup</Link> before creating a doctor.</p>}
            <fieldset disabled={busy} className="grid sm:grid-cols-2 gap-4">
                {[['name', 'Full name', 100], ['email', 'Login email', 254], ['qualification', 'Qualification', 150], ['experience', 'Experience', 100]].map(([key, label, max]) =>
                    <label key={key} className="text-sm">{label}<input type={key === 'email' ? 'email' : 'text'} required={key === 'name' || key === 'email'} maxLength={max} className={inputClass} value={doctor[key]} onChange={e => field(key, e.target.value)} /></label>)}
                {!editingId && <label className="text-sm">Initial password<input type="password" autoComplete="new-password" minLength={8} maxLength={128} required className={inputClass} value={doctor.password} onChange={e => field('password', e.target.value)} /></label>}
                <label htmlFor="doctor-department" className="text-sm">Department<select id="doctor-department" required className={inputClass} value={doctor.departmentId} onChange={e => field('departmentId', e.target.value)}>
                    <option value="">Choose department</option>{departments.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select></label>
                <label className="text-sm">Consultation fee (INR)<input type="number" required min="0" max="100000" step="0.01" className={inputClass} value={doctor.fee} onChange={e => field('fee', e.target.value)} /></label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={doctor.isActive} onChange={e => field('isActive', e.target.checked)} />Active account</label>
            </fieldset>
            <button disabled={busy || !departments.length} className="bg-teal-700 text-white p-3 rounded-lg disabled:opacity-50">{saving ? 'Saving...' : editingId ? 'Save doctor details' : 'Create doctor'}</button>
            {editingId && <button type="button" disabled={busy} className="ml-4 underline" onClick={() => { setEditingId(null); setDoctor(emptyDoctor); }}>Cancel edit</button>}
        </form>
        <section className="bg-white p-6 rounded-2xl space-y-4"><h2 className="text-xl font-bold">Created doctors</h2>
            {!loading && !doctors.length && <p>No doctors created yet.</p>}
            {doctors.map(item => <article key={item.id} className="border-b py-4 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                <div><h3 className="font-bold">{item.name}</h3><p className="text-sm">{item.specialization} | INR {item.fee} | {item.isActive ? 'Active' : 'Disabled'}</p><p className="text-sm text-slate-500">{item.email}</p></div>
                <div className="flex gap-3 items-center"><button disabled={busy} className="border rounded-lg px-4 py-2" onClick={() => { setEditingId(item.id); setDoctor({ ...emptyDoctor, ...item }); setMessage(''); }}>Edit details</button>
                    <Link className="text-teal-700 underline text-sm" to={'/admin/doctors/timings?doctor=' + item.id}>Manage timings</Link></div>
            </article>)}
        </section>
    </Layout>;
}
