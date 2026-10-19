import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../redux/slices/appointmentSlice';
export default function AppointmentRefresh() {
    const { loading, error } = useSelector(state => state.appointment);
    const dispatch = useDispatch();
    return <div className="flex flex-wrap items-center gap-3 text-sm">
        <button type="button" disabled={loading} onClick={() => dispatch(fetchAppointments())} className="border border-slate-300 rounded-lg px-4 py-2 bg-white">{loading ? 'Refreshing...' : 'Refresh appointments'}</button>
        {error && <p role="alert" className="text-red-700">{error}</p>}
    </div>;
}
