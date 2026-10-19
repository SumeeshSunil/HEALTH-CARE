import { RefreshCw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../redux/slices/appointmentSlice';
export default function AppointmentRefresh() {
    const { loading, error } = useSelector(state => state.appointment);
    const dispatch = useDispatch();
    return <div className="flex flex-wrap items-center gap-3 text-sm">
        <button type="button" disabled={loading} onClick={() => dispatch(fetchAppointments())} className="portal-button portal-button--secondary"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/>{loading ? 'Refreshing...' : 'Refresh appointments'}</button>
        {error && <p role="alert" className="text-red-700">{error}</p>}
    </div>;
}
