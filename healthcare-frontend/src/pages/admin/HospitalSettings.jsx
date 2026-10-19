import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import { apiRequest } from '../../services/api';
import { fetchHospitalData } from '../../redux/slices/doctorSlice';

export default function HospitalSettings() {
    const token = useSelector(state => state.auth.token);
    const dispatch = useDispatch();
    const [hospital, setHospital] = useState({ name: '', address: '', phone: '', openingHours: '' });
    const [departments, setDepartments] = useState([]);
    const [departmentName, setDepartmentName] = useState('');
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [reload, setReload] = useState(0);
    useEffect(() => {
        let current = true;
        setBusy(true);
        Promise.all([apiRequest('/hospital', { token }), apiRequest('/hospital/departments', { token })])
            .then(([h, d]) => { if (current) { setHospital(h.hospital); setDepartments(d.departments); setError(''); } })
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
    const inputClass = 'block w-full border border-slate-300 rounded-lg p-2 mt-1';
    return <Layout>
        <header><h1 className="text-3xl font-bold">Hospital setup</h1><p className="text-slate-500 mt-2">Manage hospital details and departments.</p></header>
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
            <p>{departments.map(item => item.name).join(' | ') || 'Add your first department below.'}</p>
            <label className="block text-sm">New department<input disabled={busy} required maxLength={100} className={inputClass} value={departmentName} onChange={e => setDepartmentName(e.target.value)} placeholder="General Medicine" /></label>
            <button disabled={busy} className="bg-slate-900 text-white p-3 rounded-lg">Add department</button>
        </form>
    </Layout>;
}
