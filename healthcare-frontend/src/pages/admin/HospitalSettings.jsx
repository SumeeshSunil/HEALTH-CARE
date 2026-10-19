import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import WeeklySlots from '../../components/WeeklySlots';
import { slotsToForm, formToSlots } from '../../utils/weeklySlots.js';
import { apiRequest } from '../../services/api';
import { fetchHospitalData } from '../../redux/slices/doctorSlice';

export default function HospitalSettings() {
    const token = useSelector(state => state.auth.token);
    const dispatch = useDispatch();
    const [hospital, setHospital] = useState({ name: '', address: '', phone: '', openingHours: '' });
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [departmentName, setDepartmentName] = useState('');
    const emptyDoctor = { name: '', email: '', password: '', departmentId: '', fee: 0, qualification: '', experience: '', isActive: true };
    const [doctor, setDoctor] = useState(emptyDoctor);
    const [editingId, setEditingId] = useState(null);
    const [slots, setSlots] = useState(slotsToForm());
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [reload, setReload] = useState(0);
    useEffect(() => {
        let current = true;
        setBusy(true);
        Promise.all([apiRequest('/hospital', { token }), apiRequest('/hospital/departments', { token }), apiRequest('/hospital/doctors?includeInactive=true', { token })])
            .then(([h, d, docs]) => { if (current) { setHospital(h.hospital); setDepartments(d.departments); setDoctors(docs.doctors); setError(''); } })
            .catch(err => { if (current) setError(err.message); })
            .finally(() => { if (current) setBusy(false); });
        return () => { current = false; };
    }, [token, reload]);
    async function save(path, method, body, success, after) {
        setBusy(true); setError(''); setMessage('');
        try {
            await apiRequest(path, { method, body, token });
            after?.(); setMessage(success); setReload(n => n + 1); dispatch(fetchHospitalData());
        } catch (err) { setError(err.message); }
        finally { setBusy(false); }
    }
    function doctorField(name, value) { setDoctor(current => ({ ...current, [name]: value })); }
    const inputClass = 'block w-full border border-slate-300 rounded-lg p-2 mt-1';
    return <Layout>
        <header><h1 className="text-3xl font-bold">Hospital setup</h1><p className="text-slate-500 mt-2">Manage this hospital, its departments, and doctor accounts.</p></header>
        {error && <div role="alert" className="text-red-700">{error} <button className="underline" onClick={() => setReload(n => n + 1)}>Reload</button></div>}
        {message && <p role="status" className="text-teal-700">{message}</p>}
        {busy && <p role="status">Please wait...</p>}
        <form className="bg-white p-6 rounded-2xl space-y-4" onSubmit={e => { e.preventDefault(); save('/hospital', 'PUT', hospital, 'Hospital details saved'); }}>
            <h2 className="text-xl font-bold">Hospital details</h2>
            <fieldset disabled={busy} className="grid sm:grid-cols-2 gap-4">
                {[['name', 'Hospital name', 100], ['address', 'Address', 500], ['phone', 'Phone', 30], ['openingHours', 'Opening hours', 200]].map(([field, label, max]) =>
                    <label key={field} className="text-sm">{label}<input required={field === 'name'} maxLength={max} className={inputClass} value={hospital[field] || ''} onChange={e => setHospital({ ...hospital, [field]: e.target.value })} /></label>)}
            </fieldset>
            <button disabled={busy} className="bg-slate-900 text-white p-3 rounded-lg">Save hospital</button>
        </form>
        <form className="bg-white p-6 rounded-2xl space-y-4" onSubmit={e => { e.preventDefault(); save('/hospital/departments', 'POST', { name: departmentName }, 'Department added', () => setDepartmentName('')); }}>
            <h2 className="text-xl font-bold">Departments</h2>
            <p>{departments.map(item => item.name).join(' · ') || 'Add your first department below.'}</p>
            <label className="block text-sm">New department<input disabled={busy} required maxLength={100} className={inputClass} value={departmentName} onChange={e => setDepartmentName(e.target.value)} placeholder="General Medicine" /></label>
            <button disabled={busy} className="bg-slate-900 text-white p-3 rounded-lg">Add department</button>
        </form>
        <form className="bg-white p-6 rounded-2xl space-y-4" onSubmit={e => {
            e.preventDefault();
            const body = { ...doctor, fee: Number(doctor.fee), availability: formToSlots(slots) };
            if (editingId) delete body.password;
            save('/hospital/doctors' + (editingId ? '/' + editingId : ''), editingId ? 'PATCH' : 'POST', body,
                editingId ? 'Doctor updated' : 'Doctor account created', () => { setDoctor(emptyDoctor); setEditingId(null); setSlots(slotsToForm()); });
        }}>
            <h2 className="text-xl font-bold">{editingId ? 'Edit doctor' : 'Add doctor account'}</h2>
            {!departments.length && <p>Add a department before creating a doctor.</p>}
            <fieldset disabled={busy} className="grid sm:grid-cols-2 gap-4">
                {[['name','Full name',100],['email','Login email',254],['qualification','Qualification',150],['experience','Experience',100]].map(([field,label,max]) =>
                    <label key={field} className="text-sm">{label}<input className={inputClass} type={field === 'email' ? 'email' : 'text'} required={field === 'name' || field === 'email'} maxLength={max} value={doctor[field]} onChange={e => doctorField(field,e.target.value)} /></label>)}
                {!editingId && <label className="text-sm">Initial password<input type="password" autoComplete="new-password" required minLength={8} maxLength={128} className={inputClass} value={doctor.password} onChange={e => doctorField('password',e.target.value)} /></label>}
                <label className="text-sm">Department<select required className={inputClass} value={doctor.departmentId} onChange={e => doctorField('departmentId',e.target.value)}><option value="">Choose department</option>{departments.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label className="text-sm">Consultation fee (₹)<input type="number" required min="0" max="100000" step="0.01" className={inputClass} value={doctor.fee} onChange={e => doctorField('fee',e.target.value)} /></label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={doctor.isActive} onChange={e => doctorField('isActive',e.target.checked)} /> Active account</label>
            </fieldset>
            <WeeklySlots value={slots} onChange={setSlots} disabled={busy} />
            <button disabled={busy || !departments.length} className="bg-teal-700 text-white p-3 rounded-lg">{editingId ? 'Save doctor' : 'Create doctor'}</button>
            {editingId && <button type="button" className="ml-4 underline" onClick={() => { setEditingId(null); setDoctor(emptyDoctor); setSlots(slotsToForm()); }}>Cancel edit</button>}
        </form>
        <section className="bg-white p-6 rounded-2xl space-y-4"><h2 className="text-xl font-bold">Hospital doctors</h2>
            {!doctors.length && <p>No doctors added yet.</p>}
            {doctors.map(item => <div key={item.id} className="border-b py-3 flex justify-between gap-4 items-center">
                <div><h3 className="font-bold">{item.name}</h3><p className="text-sm">{item.specialization} · ₹{item.fee} · {item.isActive ? 'Active' : 'Disabled'}</p><p className="text-sm text-slate-500">{item.email}</p></div>
                <button disabled={busy} className="border rounded-lg px-4 py-2" onClick={() => { setEditingId(item.id); setDoctor({ ...emptyDoctor, ...item }); setSlots(slotsToForm(item.availability)); }}>Edit</button>
            </div>)}
        </section>
    </Layout>;
}
