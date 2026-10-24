import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import AppointmentRefresh from '../../components/AppointmentRefresh';
import { ageFromDob, bookedPatientProfiles } from '../../utils/patientProfile.js';
import { apiRequest } from '../../services/api';
import { fetchRecords } from '../../redux/slices/recordsSlice';

export default function PatientRecordView() {
    const user = useSelector(state => state.auth.user);
    const token = useSelector(state => state.auth.token);
    const recordError = useSelector(state => state.records.error);
    const dispatch = useDispatch();
    const [labResults, setLabResults] = useState([]);
    const [labError, setLabError] = useState('');
    const [reload, setReload] = useState(0);
    useEffect(() => {
        let current = true;
        apiRequest('/lab-results', { token }).then(d => { if (current) { setLabResults(d.results); setLabError(''); } }).catch(e => { if (current) setLabError(e.message); });
        return () => { current = false; };
    }, [token, reload]);
    const { appointments, loading, error } = useSelector(state => state.appointment);
    const records = useSelector(state => state.records.records);
    const patients = bookedPatientProfiles(appointments, user?.id);
    const [params] = useSearchParams();
    const [selectedId, setSelectedId] = useState(params.get('patientId') || '');
    const patient = patients.find(item => item.id === selectedId) || patients[0];
    const age = ageFromDob(patient?.dob);
    const history = patient ? records.filter(item => item.patientId === patient.id && item.doctorId === user.id) : [];
    const visits = patient ? appointments.filter(item => item.patientId === patient.id && item.doctorId === user.id) : [];
    const details = patient ? [['Date of birth', patient.dob], ['Age', age === null ? '' : age + ' years'], ['Gender', patient.gender],
        ['Blood group', patient.bloodGroup], ['Email', patient.email], ['Phone', patient.mobile],
        ['Emergency contact', patient.emergencyContact], ['Address', patient.address]] : [];
    return <Layout>
        <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
            <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">Patient Records</span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Patient Medical History &amp; Profile</h1>
            <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed max-w-xl">View saved profile details for patients who have booked a consultation with you.</p>
        </header>
        <AppointmentRefresh/>
        <button className="portal-button portal-button--secondary" onClick={() => { dispatch(fetchRecords()); setReload(n => n + 1); }}>Refresh records and lab reports</button>
        {(recordError || labError) && <p role="alert" className="text-red-700">{recordError || labError}</p>}
        {patient && <section className="bg-white rounded-2xl border p-5 space-y-3"><h2 className="font-bold">{patient.name}: lab reports</h2>{labResults.filter(r => r.patientId === patient.id).map(r => <article className="rounded-xl bg-teal-50 p-4" key={r.id}><h3 className="font-bold">{r.test}</h3><p className="text-xs text-slate-500">{new Date(r.date).toLocaleDateString('en-IN')}</p><p className="whitespace-pre-wrap">{r.result}</p></article>)}{!labResults.some(r => r.patientId === patient.id) && <p>No completed lab reports.</p>}</section>}
        {!patient ? <div className="portal-empty"><h2>{loading ? 'Loading patient details...' : error ? 'Patient details could not be loaded' : 'No booked patients yet'}</h2><p>{error ? 'Refresh appointments to try again.' : 'Patients will appear here when they book with you.'}</p></div> : <>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                <label className="text-xs font-bold text-slate-500 flex flex-wrap items-center gap-3">Select Patient
                    <select value={patient.id} onChange={e => setSelectedId(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-teal-500 max-w-full">
                        {patients.map(item => <option key={item.id} value={item.id}>{item.name} — {item.email}</option>)}
                    </select>
                </label>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-2 rounded-full border border-teal-200">{visits.length} booked visit{visits.length === 1 ? '' : 's'}</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-5">
                    <div className="flex gap-3 items-center border-b border-slate-100 pb-4"><div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-extrabold text-xl shrink-0">{patient.name.charAt(0)}</div><div className="min-w-0"><h2 className="font-extrabold text-slate-900">{patient.name}</h2><p className="text-xs text-slate-400 break-all">Patient ID: {patient.id}</p></div></div>
                    <dl className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">{details.map(([label, value]) => <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100"><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className={'text-sm font-semibold mt-1 whitespace-pre-wrap break-words ' + (label === 'Blood group' ? 'text-teal-700' : 'text-slate-800')}>{value || 'Not provided'}</dd></div>)}</dl>
                    <p className="text-xs text-slate-500">These details come from the patient's saved profile.</p>
                </section>
                <div className="lg:col-span-2 space-y-4">
                    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4"><h2 className="font-extrabold text-slate-900">Booked visits</h2>{visits.map(visit => <article key={visit.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2"><div className="flex flex-wrap justify-between gap-2"><p className="font-bold text-sm text-slate-800">{visit.date} · {visit.time} (India time)</p><span className={'portal-badge portal-badge--' + visit.status}>{visit.status}</span></div><p className="text-sm text-slate-600 whitespace-pre-wrap break-words">{visit.reason || 'No reason provided.'}</p></article>)}<Link className="portal-button portal-button--primary" to="/doctor/appointments">Open consultation queue</Link></section>
                    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4"><h2 className="font-extrabold text-slate-900">Clinical history</h2><p className="text-xs text-amber-800">Consultation notes, prescriptions, profile details and bookings are saved in MongoDB.</p>{history.length ? history.map(record => <article key={record.id} className="border border-slate-200 rounded-2xl p-4 space-y-3"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold text-slate-900">{record.diagnosis}</h3><p className="text-xs text-slate-500">{record.date}</p></div><p className="text-sm text-slate-600">{record.notes}</p>{record.prescriptions?.map((medicine, index) => <p key={index} className="text-sm text-teal-700">{medicine.medicine || medicine} · {medicine.dosage || ''} · {medicine.duration || ''}</p>)}</article>) : <p className="text-sm text-slate-500">No saved consultation notes for this patient yet.</p>}</section>
                </div>
            </div>
        </>}
    </Layout>;
}
