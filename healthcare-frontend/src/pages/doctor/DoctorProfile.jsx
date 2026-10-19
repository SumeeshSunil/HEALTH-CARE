import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import { fetchHospitalData } from '../../redux/slices/doctorSlice';

export default function DoctorProfile() {
    const user = useSelector(state => state.auth.user);
    const { doctors, hospital, loading, error } = useSelector(state => state.doctors);
    const doctor = doctors.find(item => item.id === user.id);
    const dispatch = useDispatch();
    return <Layout><h1 className="text-3xl font-bold">My hospital profile</h1>
        {loading && <p role="status">Loading profile...</p>}
        {error && <p role="alert">{error} <button className="underline" onClick={() => dispatch(fetchHospitalData())}>Retry</button></p>}
        <section className="bg-white p-6 rounded-2xl space-y-3">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p>{hospital?.name || 'Our Hospital'}</p>
            <p>{user.email}</p>
            {doctor && <><p>Department: {doctor.specialization}</p><p>Qualification: {doctor.qualification || 'Not provided'}</p><p>Experience: {doctor.experience || 'Not provided'}</p><p>Consultation fee: ₹{doctor.fee}</p></>}
            <p className="text-sm text-slate-500">Contact hospital administration to update your professional details.</p>
        </section>
    </Layout>;
}
