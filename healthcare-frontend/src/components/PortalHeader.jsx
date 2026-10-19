import { CalendarDays } from 'lucide-react';
export default function PortalHeader({ title, description, children }) {
 return <header className="portal-header"><div className="portal-header-icon"><CalendarDays size={26}/></div><div className="min-w-0 flex-1"><p className="portal-eyebrow">Hospital care portal</p><h1>{title}</h1>{description && <p className="portal-description">{description}</p>}</div>{children}</header>;
}
