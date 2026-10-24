import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiRequest } from '../services/api';
import { inr } from '../utils/appointmentView';

const empty = { name: '', price: '', description: '', stock: 0, isActive: true };
export default function Department({ kind }) {
    const { user, token } = useSelector(s => s.auth);
    const patient = user.role === 'patient';
    const title = kind === 'lab' ? 'Laboratory' : 'Medicine department';
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [form, setForm] = useState(empty);
    const [editing, setEditing] = useState(null);
    const [quantities, setQuantities] = useState({});
    const [results, setResults] = useState({});
    const [enabled, setEnabled] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [reload, setReload] = useState(0);
    // Keep a key across network retries; remove it only after receiving the order.
    const [bookingKeys, setBookingKeys] = useState({});
    useEffect(() => {
        let current = true;
        setBusy(true); setError('');
        Promise.all([apiRequest('/services/catalog/' + kind, { token }), apiRequest('/services/orders', { token })])
            .then(([catalog, data]) => { if (current) { setItems(catalog.items); setOrders(data.orders.filter(o => o.kind === kind)); setEnabled(data.demoPaymentsEnabled); } })
            .catch(e => { if (current) setError(e.message); })
            .finally(() => { if (current) setBusy(false); });
        return () => { current = false; };
    }, [kind, token, reload]);
    async function action(path, method, body, message) {
        setBusy(true); setError(''); setNotice('');
        try {
            const data = await apiRequest(path, { method, body, token });
            setNotice(message); setReload(n => n + 1); return data;
        } catch (e) { setError(e.message); return null; }
        finally { setBusy(false); }
    }
    async function save(e) {
        e.preventDefault();
        const saved = await action('/services/catalog/' + kind + (editing ? '/' + editing : ''), editing ? 'PATCH' : 'POST',
            { ...form, price: Number(form.price), stock: Number(form.stock) }, 'Catalog saved');
        if (saved) { setForm(empty); setEditing(null); }
    }
    async function book(item) {
        const quantity = kind === 'lab' ? 1 : Number(quantities[item.id] || 1);
        const details = item.id + ':' + quantity;
        const bookingKey = bookingKeys[details] || crypto.randomUUID();
        setBookingKeys(keys => ({ ...keys, [details]: bookingKey }));
        const saved = await action('/services/orders', 'POST', { itemId: item.id, quantity, bookingKey }, 'Order created. Pay below or at the department counter.');
        if (saved) setBookingKeys(keys => { const next = { ...keys }; delete next[details]; return next; });
    }
    const payment = (order, method, outcome = 'success') => action('/services/orders/' + order.id + '/payment', 'POST', { method, outcome }, outcome === 'failed' ? 'Payment failure simulated. You can retry.' : 'Payment recorded');
    const status = (order, next) => action('/services/orders/' + order.id + '/status', 'PATCH', { status: next, result: results[order.id] || '' }, 'Order updated');
    return <Layout>
        <header className="bg-slate-900 text-white rounded-3xl p-7 space-y-2"><h1 className="text-3xl font-bold">{title}</h1><p>{patient ? 'Browse services, place an order and view your results or collection status.' : 'Manage the catalog, receive payments and fulfill patient orders.'}</p></header>
        <div className="flex gap-3 flex-wrap"><button disabled={busy} className="portal-button portal-button--secondary" onClick={() => setReload(n => n + 1)}>Refresh</button>{patient && <Link className="portal-button portal-button--secondary" to="/patient/billing">Consultation bills</Link>}</div>
        {busy && <p role="status">Please wait...</p>}{error && <p role="alert" className="text-red-700">{error}</p>}{notice && <p role="status" className="text-teal-700">{notice}</p>}
        {!patient && <form onSubmit={save} className="bg-white border rounded-2xl p-5 space-y-3"><h2 className="font-bold">{editing ? 'Edit item' : 'Add ' + (kind === 'lab' ? 'lab test' : 'medicine')}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
                <label>Name<input className="department-input" required maxLength={150} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label>
                <label>Price (INR)<input className="department-input" type="number" required min="0" max="100000" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}/></label>
                <label>Description<input className="department-input" maxLength={1000} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/></label>
                {kind === 'medicine' && !editing && <label>Initial stock<input className="department-input" type="number" min="0" max="1000000" step="1" required value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}/></label>}
            </div>
            <label className="flex gap-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}/>Available to patients</label>
            <button disabled={busy} className="portal-button portal-button--primary">Save item</button>{editing && <button type="button" className="portal-button portal-button--secondary ml-2" onClick={() => { setEditing(null); setForm(empty); }}>Cancel edit</button>}
        </form>}
        <section className="space-y-3"><h2 className="text-xl font-bold">{kind === 'lab' ? 'Available tests' : 'Medicine catalog'}</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{items.map(item => <article className="bg-white rounded-2xl border p-5 space-y-3" key={item.id}>
                <h3 className="font-bold text-lg">{item.name}</h3><p className="text-slate-600">{item.description}</p><p className="font-bold text-teal-700">{inr(item.price)} {kind === 'medicine' && <span className="font-normal text-slate-500">· Stock: {item.stock}</span>}</p>
                {!item.isActive && <p>Inactive</p>}
                {patient ? <><label className={kind === 'lab' ? 'hidden' : 'block'}>Quantity<input aria-label={'Quantity for ' + item.name} className="department-input" type="number" min="1" max="100" step="1" value={quantities[item.id] || 1} onChange={e => setQuantities({ ...quantities, [item.id]: e.target.value })}/></label><button disabled={busy || (kind === 'medicine' && !item.stock)} onClick={() => book(item)} className="portal-button portal-button--primary">{kind === 'lab' ? 'Book test' : 'Order medicine'}</button></>
                    : <><button disabled={busy} className="portal-button portal-button--secondary" onClick={() => { setEditing(item.id); setForm(item); }}>Edit</button>{kind === 'medicine' && <form className="flex gap-2" onSubmit={e => { e.preventDefault(); const quantity = Number(new FormData(e.currentTarget).get('quantity')); action('/services/catalog/medicine/' + item.id + '/restock', 'POST', { quantity }, 'Stock added'); }}><input aria-label={'Restock ' + item.name} name="quantity" className="department-input" placeholder="Add stock" type="number" min="1" max="100000" required/><button disabled={busy} className="portal-button portal-button--secondary">Restock</button></form>}</>}
            </article>)}</div>{!busy && !items.length && <p>No items yet. Department staff can add them.</p>}
        </section>
        <section className="space-y-4"><h2 className="text-xl font-bold">{patient ? 'My orders and receipts' : 'Patient orders'}</h2>
            <p className="text-sm text-slate-500">Online payments are simulations for the school project and transfer no money. Cash/card records confirm payment already received at the counter. Medicine stock is deducted on collection; orders do not reserve stock.</p>
            {!busy && !orders.length && <p>No orders yet.</p>}
            {orders.map(order => <article key={order.id} className="bg-white rounded-2xl border p-5 space-y-3">
                <div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold">{order.itemName} × {order.quantity}</h3><strong>{inr(order.amount)}</strong></div>
                {!patient && <p>Patient: {order.patientName}</p>}<p className="text-xs text-slate-500 break-all">Order #{order.id} · {new Date(order.createdAt).toLocaleString('en-IN')}</p>
                <p>Status: <strong>{order.status.replaceAll('_', ' ')}</strong> · Payment: <strong>{order.payment.status}</strong>{order.payment.method === 'demo' ? ' (simulation)' : order.payment.method ? ' (' + order.payment.method + ')' : ''}</p>
                {order.payment.reference && <p className="text-sm break-all">Receipt: {order.payment.reference}</p>}
                {order.result && <div className="p-4 bg-teal-50 rounded-xl whitespace-pre-wrap"><h4 className="font-bold">Lab report</h4>{order.result}</div>}
                {order.payment.status === 'unpaid' && <div className="flex gap-2 flex-wrap">{patient ? enabled ? <><button disabled={busy} className="portal-button portal-button--primary" onClick={() => payment(order, 'demo')}>Simulate successful payment</button><button disabled={busy} className="portal-button portal-button--secondary" onClick={() => payment(order, 'demo', 'failed')}>Simulate failure</button></> : <p>Pay at the department counter.</p> : ['cash', 'card'].map(method => <button key={method} disabled={busy} className="portal-button portal-button--primary" onClick={() => payment(order, method)}>Record {method} received</button>)}</div>}
                {!patient && order.payment.status === 'paid' && <div className="space-y-2">{kind === 'lab' ? <>{order.status === 'pending' && <button disabled={busy} className="portal-button portal-button--primary" onClick={() => status(order, 'sample_collected')}>Mark sample collected</button>}{order.status === 'sample_collected' && <><label>Lab report<textarea required maxLength={5000} className="department-input" value={results[order.id] || ''} onChange={e => setResults({ ...results, [order.id]: e.target.value })}/></label><button disabled={busy || !results[order.id]?.trim()} className="portal-button portal-button--primary" onClick={() => status(order, 'completed')}>Save and release report</button></>}</> : order.status === 'pending' && <button disabled={busy} className="portal-button portal-button--primary" onClick={() => status(order, 'dispensed')}>Dispense medicines</button>}</div>}
            </article>)}
        </section>
    </Layout>;
}
