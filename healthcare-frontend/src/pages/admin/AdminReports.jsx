import PortalHeader from '../../components/PortalHeader';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import Layout from '../../components/Layout';
import AppointmentRefresh from '../../components/AppointmentRefresh';
import { inr, billingTotals } from '../../utils/appointmentView.js';
export default function AdminReports() {
    const appointments = useSelector(state => state.appointment.appointments);
    const totals = billingTotals(appointments);
    const token = useSelector(s => s.auth.token);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);
    useEffect(() => {
        let current = true;
        apiRequest('/reports', { token }).then(d => { if (current) { setSummary(d.summary); setError(''); } }).catch(e => { if (current) setError(e.message); });
        return () => { current = false; };
    }, [token, reload]);
    return <Layout><PortalHeader title={<>Consultation payment report</>} /><AppointmentRefresh />
        <p className="text-sm text-slate-500">Hospital receipts are manually recorded by staff. Demo payments are shown separately and are excluded from hospital collections.</p>
        <section className="bg-white rounded-2xl p-5 space-y-3"><h2 className="font-bold">Lab and medicine report</h2><button className="portal-button portal-button--secondary" onClick={() => setReload(n => n + 1)}>Refresh department totals</button>{error && <p role="alert">{error}</p>}{summary && <><p>Lab orders: {summary.labOrders} · Medicine orders: {summary.medicineOrders}</p><p>Counter receipts: {inr(summary.hospitalReceipts)} · Simulated payments: {inr(summary.demoPayments)} · Unpaid: {inr(summary.unpaid)}</p></>}</section>
        <div className="grid sm:grid-cols-2 gap-4">{[['Hospital receipts recorded',totals.received],['Demo payments',totals.demo],['Unpaid consultation bills',totals.unpaid],['Refunds pending',totals.refundPending]].map(([label,total]) =>
            <article key={label} className="portal-stat"><h2 className="text-sm text-slate-500">{label}</h2><p className="text-3xl font-bold mt-2">{inr(total)}</p></article>)}</div>
        <div className="bg-white rounded-2xl p-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Invoice</th><th>Patient</th><th>Amount</th><th>Status</th><th>Method</th><th>Source</th></tr></thead>
            <tbody>{appointments.map(item => <tr key={item.id} className="border-t"><td className="p-2">{item.bill.invoiceNumber}</td><td>{item.patientName}</td><td>{inr(item.bill.amount)}</td><td>{item.bill.status.replaceAll('_',' ')}</td><td>{item.bill.paymentMethod || '-'}</td><td>{item.bill.source || 'Not paid'}</td></tr>)}</tbody>
        </table></div>
    </Layout>;
}
