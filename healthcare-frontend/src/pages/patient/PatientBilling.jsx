import { useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import AppointmentRefresh from '../../components/AppointmentRefresh';
import AppointmentSummary from '../../components/AppointmentSummary';
import DemoPayment from '../../components/DemoPayment';
import { inr, billingTotals } from '../../utils/appointmentView.js';

export default function PatientBilling() {
    const { appointments, loading, demoPaymentsEnabled } = useSelector(state => state.appointment);
    const [filter, setFilter] = useState('all');
    const totals = billingTotals(appointments);
    const filtered = appointments.filter(item => filter === 'all' || item.bill.status === filter);
    return <Layout><h1 className="text-3xl font-bold">Consultation bills</h1><AppointmentRefresh />
        <div className="bg-slate-900 text-white p-6 rounded-2xl"><p>Outstanding consultation fees</p><h2 className="text-3xl font-bold mt-2">{inr(totals.unpaid)}</h2></div>
        <p className="text-sm text-slate-500">Each booking has one consultation bill. Online payments are project demos; hospital payments are recorded by staff after receipt.</p>
        <label className="text-sm">Payment status <select className="border rounded-lg p-2" value={filter} onChange={e => setFilter(e.target.value)}>{['all','unpaid','paid','void','refund_pending','refunded'].map(value => <option key={value} value={value}>{value.replaceAll('_',' ')}</option>)}</select></label>
        {!loading && !filtered.length && <p>No bills found.</p>}
        {filtered.map(item => <AppointmentSummary key={item.id} appointment={item}>
            {item.bill.reference && <p className="text-xs text-slate-500 break-all">Receipt reference: {item.bill.reference}</p>}
            <DemoPayment appointment={item} enabled={demoPaymentsEnabled} />
        </AppointmentSummary>)}
    </Layout>;
}
