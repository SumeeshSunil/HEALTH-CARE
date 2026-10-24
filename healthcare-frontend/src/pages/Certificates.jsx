import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import { apiRequest } from '../services/api';

export default function Certificates() {
    const { user, token } = useSelector(s => s.auth);
    const appointments = useSelector(s => s.appointment.appointments);
    const patients = [...new Map(appointments.filter(a => a.status === 'completed').map(a => [a.patientId, { id: a.patientId, name: a.patientName }])).values()];
    const [certificates, setCertificates] = useState([]);
    const [form, setForm] = useState({ patientId: '', type: 'Sick Leave Certificate', startDate: '', endDate: '', notes: '' });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);
    useEffect(() => {
        let current = true; setBusy(true); setError('');
        apiRequest('/certificates', { token }).then(d => { if (current) setCertificates(d.certificates); })
            .catch(e => { if (current) setError(e.message); }).finally(() => { if (current) setBusy(false); });
        return () => { current = false; };
    }, [token, reload]);
    async function save(e) {
        e.preventDefault(); setBusy(true); setError('');
        try { const data = await apiRequest('/certificates', { token, method: 'POST', body: form }); setCertificates(c => [data.certificate, ...c]); setForm({ ...form, notes: '' }); }
        catch (e) { setError(e.message); } finally { setBusy(false); }
    }
    return <Layout><h1 className="text-3xl font-bold">Medical certificates</h1>
        <p>Certificates are saved with the patient account. This is a school demonstration.</p>
        {error && <p role="alert" className="text-red-700">{error}</p>}{busy && <p role="status">Please wait...</p>}
        <button disabled={busy} className="portal-button portal-button--secondary print:hidden" onClick={() => setReload(n => n + 1)}>Refresh certificates</button>
        {user.role === 'doctor' && <form onSubmit={save} className="bg-white rounded-2xl border p-5 space-y-3 print:hidden"><h2 className="font-bold">Issue certificate</h2>
            <label>Patient<select required className="department-input" value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}><option value="">Choose a patient with a completed consultation</option>{patients.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
            <label>Type<select className="department-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{['Sick Leave Certificate', 'Medical Fitness Certificate', 'Return to Work Authorization'].map(t => <option key={t}>{t}</option>)}</select></label>
            <div className="grid sm:grid-cols-2 gap-3"><label>From<input type="date" required className="department-input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}/></label><label>Until<input type="date" required min={form.startDate} className="department-input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}/></label></div>
            <label>Clinical notes<textarea required maxLength={2000} className="department-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}/></label><button disabled={busy} className="portal-button portal-button--primary">Save certificate</button>
        </form>}
        {!busy && !certificates.length && <p>No certificates issued yet.</p>}
        {certificates.map(c => <article className="bg-white border rounded-2xl p-6 space-y-3 break-inside-avoid" key={c.id}><h2 className="font-bold text-xl">{c.type}</h2><p>Patient: <strong>{c.patientName}</strong></p><p>Issued by {c.doctorName}</p><p>{c.startDate} to {c.endDate}</p><p className="whitespace-pre-wrap">{c.notes}</p><p className="text-xs text-slate-500 break-all">Certificate #{c.id} · {new Date(c.createdAt).toLocaleDateString('en-IN')}</p><button className="portal-button portal-button--secondary print:hidden" onClick={() => window.print()}>Print certificates</button></article>)}
    </Layout>;
}
