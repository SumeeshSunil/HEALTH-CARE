import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { fetchHospitalData } from '../../redux/slices/doctorSlice';

export default function DoctorSearch() {
    const { hospital, departments, doctors, loading, error } = useSelector(state => state.doctors);
    const [query, setQuery] = useState('');
    const [department, setDepartment] = useState('');
    const dispatch = useDispatch();
    const filtered = doctors.filter(doctor => (!department || doctor.departmentId === department)
        && (doctor.name + ' ' + doctor.specialization).toLowerCase().includes(query.toLowerCase()));
    return <Layout>
        <header className="bg-slate-900 text-white rounded-3xl p-6 space-y-2">
            <p className="text-teal-300 text-sm">{hospital?.name || 'Our Hospital'}</p>
            <h1 className="text-3xl font-bold">Our departments and doctors</h1>
            {hospital?.address && <p>{hospital.address}</p>}
            <p className="text-sm text-slate-300">{[hospital?.phone, hospital?.openingHours].filter(Boolean).join(' · ')}</p>
        </header>
        <div className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row gap-4">
            <label className="flex-1 text-sm">Doctor or department
                <input className="block border rounded-lg p-3 w-full mt-1" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search our hospital" />
            </label>
            <label className="text-sm">Department
                <select className="block border rounded-lg p-3 mt-1" value={department} onChange={e => setDepartment(e.target.value)}>
                    <option value="">All departments</option>
                    {departments.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
            </label>
        </div>
        {loading && <p role="status">Loading hospital doctors...</p>}
        {error && <div role="alert">{error} <button className="underline" onClick={() => dispatch(fetchHospitalData())}>Retry</button></div>}
        {!loading && !error && !filtered.length && <p>No doctors available for this selection.</p>}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(doctor => <article key={doctor.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                <h2 className="text-xl font-bold">{doctor.name}</h2>
                <p className="font-semibold text-teal-700">{doctor.specialization}</p>
                {doctor.qualification && <p>{doctor.qualification}</p>}
                {doctor.experience && <p className="text-sm text-slate-500">{doctor.experience}</p>}
                <p>Consultation fee: ₹{doctor.fee}</p>
                <p className="text-sm text-slate-500">{doctor.availability.filter(item => item.slots.length).map(item => item.day).join(', ') || 'No consultation slots scheduled'}</p>
                {doctor.availability.some(item => item.slots.length) && <Link className="block bg-teal-700 text-white text-center p-3 rounded-lg" to={'/patient/book-appointment/' + doctor.id}>Book consultation</Link>}
            </article>)}
        </div>
    </Layout>;
}
