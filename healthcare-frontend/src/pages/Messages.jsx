import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import { apiRequest } from '../services/api';

export default function Messages() {
    const { user, token } = useSelector(s => s.auth);
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selected, setSelected] = useState('');
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [reload, setReload] = useState(0);
    useEffect(() => {
        let current = true;
        setBusy(true); setError('');
        Promise.all([apiRequest('/messages/contacts', { token }), apiRequest('/messages', { token })])
            .then(([c, m]) => { if (current) { setContacts(c.contacts); setMessages(m.messages); } })
            .catch(e => { if (current) setError(e.message); }).finally(() => { if (current) setBusy(false); });
        return () => { current = false; };
    }, [token, reload]);
    const contact = contacts.find(c => c.id === selected) || contacts[0];
    const history = contact ? messages.filter(m => user.role === 'patient' ? m.doctorId === contact.id : m.patientId === contact.id) : [];
    async function send(e) {
        e.preventDefault(); if (!contact) return;
        setBusy(true); setError('');
        try { const data = await apiRequest('/messages', { token, method: 'POST', body: { recipientId: contact.id, text } }); setMessages(m => [...m, data.message]); setText(''); }
        catch (e) { setError(e.message); } finally { setBusy(false); }
    }
    return <Layout><h1 className="text-3xl font-bold">Messages</h1><p>Contact {user.role === 'patient' ? 'doctors' : 'patients'} linked to your appointments.</p>
        <button disabled={busy} className="portal-button portal-button--secondary" onClick={() => setReload(n => n + 1)}>Refresh messages</button>{busy && <p role="status">Please wait...</p>}{error && <p role="alert" className="text-red-700">{error}</p>}
        {!contacts.length ? <p>No contacts yet. Contacts appear after an appointment is booked.</p> : <>
            <label>Conversation<select className="department-input" value={contact.id} onChange={e => setSelected(e.target.value)}>{contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <section aria-label="Messages" className="bg-white border rounded-2xl p-5 space-y-3 max-h-[50vh] overflow-y-auto">{history.length ? history.map(m => <article className={'rounded-xl p-4 ' + (m.senderId === user.id ? 'bg-teal-50' : 'bg-slate-100')} key={m.id}><p className="text-xs font-bold">{m.senderId === user.id ? 'You' : contact.name} · {new Date(m.createdAt).toLocaleString('en-IN')}</p><p className="whitespace-pre-wrap break-words mt-2">{m.text}</p></article>) : <p>No messages in this conversation.</p>}</section>
            <form onSubmit={send} className="space-y-3"><label>Message<textarea className="department-input" required maxLength={2000} value={text} onChange={e => setText(e.target.value)}/></label><button disabled={busy || !text.trim()} className="portal-button portal-button--primary">Send message</button></form>
        </>}
    </Layout>;
}
