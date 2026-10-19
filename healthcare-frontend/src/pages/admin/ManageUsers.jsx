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
