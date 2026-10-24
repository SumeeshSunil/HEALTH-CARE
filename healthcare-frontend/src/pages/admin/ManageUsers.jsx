import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import { apiRequest } from '../../services/api';
import { fetchHospitalData } from '../../redux/slices/doctorSlice';

export default function ManageUsers() {
    const { token, user: currentUser } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const [users, setUsers] = useState([]);
    const [role, setRole] = useState('all');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [reload, setReload] = useState(0);
    const [staff, setStaff] = useState({ name: '', email: '', password: '', role: 'lab' });
    async function createStaff(e) {
        e.preventDefault(); setBusy(true); setError('');
        try {
            const data = await apiRequest('/auth/staff', { method: 'POST', token, body: staff });
            setUsers(items => [data.user, ...items]);
            setStaff({ name: '', email: '', password: '', role: 'lab' });
        } catch (err) { setError(err.message); }
        finally { setBusy(false); }
    }
    useEffect(() => {
        let current = true;
        setBusy(true); setError('');
        apiRequest('/auth/users', { token }).then(data => { if (current) setUsers(data.users); })
            .catch(err => { if (current) setError(err.message); })
            .finally(() => { if (current) setBusy(false); });
        return () => { current = false; };
    }, [token, reload]);
    async function toggle(user) {
        setBusy(true); setError('');
        try {
            const data = await apiRequest('/auth/users/' + user.id + '/status', { method: 'PATCH', token, body: { isActive: !user.isActive } });
            setUsers(items => items.map(item => item.id === user.id ? data.user : item));
            dispatch(fetchHospitalData());
        } catch (err) { setError(err.message); }
        finally { setBusy(false); }
    }
    return <Layout><h1 className="text-3xl font-bold">Hospital users</h1>
        <form onSubmit={createStaff} className="bg-white rounded-2xl border p-5 space-y-3"><h2 className="font-bold">Create lab / pharmacy staff</h2><div className="grid sm:grid-cols-2 gap-3">
            <label>Name<input className="department-input" required maxLength={100} value={staff.name} onChange={e => setStaff({ ...staff, name: e.target.value })}/></label>
            <label>Email<input className="department-input" type="email" required maxLength={254} value={staff.email} onChange={e => setStaff({ ...staff, email: e.target.value })}/></label>
            <label>Password<input className="department-input" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={staff.password} onChange={e => setStaff({ ...staff, password: e.target.value })}/></label>
            <label>Department<select className="department-input" value={staff.role} onChange={e => setStaff({ ...staff, role: e.target.value })}><option value="lab">Laboratory</option><option value="pharmacy">Pharmacy</option></select></label>
        </div><button disabled={busy} className="portal-button portal-button--primary">Create staff account</button></form>
        <p className="text-slate-500">Registered accounts, newest 100. Disabling an account blocks login and future API requests.</p>
        {error && <p role="alert">{error} <button className="underline" onClick={() => setReload(n => n + 1)}>Retry</button></p>}
        {busy && <p role="status">Please wait...</p>}
        <label className="text-sm">Filter by role <select value={role} onChange={e => setRole(e.target.value)} className="border rounded-lg p-2">{['all','patient','doctor','admin','pharmacy','lab'].map(value => <option key={value}>{value}</option>)}</select></label>
        <div className="bg-white rounded-2xl p-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{users.filter(user => role === 'all' || user.role === role).map(user => <tr className="border-b" key={user.id}>
                <td className="p-3 font-semibold">{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{user.isActive ? 'Active' : 'Disabled'}</td>
                <td><button disabled={busy || user.id === currentUser.id} onClick={() => toggle(user)} className="border rounded-lg p-2 disabled:opacity-50">{user.isActive ? 'Disable' : 'Enable'}</button></td>
            </tr>)}</tbody>
        </table>{!busy && !users.length && <p>No users found.</p>}</div>
    </Layout>;
}
