import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { demoPayment } from '../redux/slices/appointmentSlice';
import { inr } from '../utils/appointmentView.js';
export default function DemoPayment({ appointment, enabled, startOpen = false, onPaid }) {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(startOpen);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    if (appointment.bill.status !== 'unpaid' || !['pending', 'confirmed', 'completed'].includes(appointment.status)) return null;
    if (!enabled) return <p className="text-sm">Please pay at the hospital. Online payment is unavailable.</p>;
    async function pay(outcome) {
        setBusy(true); setError('');
        try {
            const result = await dispatch(demoPayment({ id: appointment.id, outcome })).unwrap();
            if (result.appointment.bill.status === 'paid') { setOpen(false); onPaid?.(); }
            else setError('Demo payment failed. Your bill is still unpaid. Retry or pay at the hospital.');
        } catch (err) { setError(typeof err === 'string' ? err : 'Payment update failed'); }
        finally { setBusy(false); }
    }
    return <div className="space-y-3">
        {!open && <button type="button" className="bg-teal-700 text-white px-4 py-2 rounded-lg" onClick={() => setOpen(true)}>Pay online (demo)</button>}
        {open && <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
            <h3 className="font-bold">Project demo payment: {inr(appointment.bill.amount)}</h3>
            <p className="text-sm">No money is collected. These buttons simulate a payment result; this is not a connected card or UPI gateway.</p>
            <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} className="bg-teal-700 text-white px-4 py-2 rounded-lg" onClick={() => pay('success')}>{busy ? 'Saving...' : 'Simulate successful payment'}</button>
                <button type="button" disabled={busy} className="border rounded-lg px-4 py-2" onClick={() => pay('failed')}>Simulate failed payment</button>
                <button type="button" disabled={busy} className="underline" onClick={() => setOpen(false)}>Pay later</button></div>
        </div>}
        {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
    </div>;
}
