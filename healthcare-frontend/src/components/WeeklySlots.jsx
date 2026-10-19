import { weekDays } from '../utils/weeklySlots.js';
export default function WeeklySlots({ value, onChange, disabled = false }) {
    return <fieldset disabled={disabled} className="space-y-3">
        <legend className="font-bold mb-2">Weekly consultation slots</legend>
        <p className="text-sm text-slate-500">Separate times with commas, for example 09:00 AM, 10:30 AM. Leave off-duty days blank.</p>
        <div className="grid gap-3 sm:grid-cols-2">
            {weekDays.map(day => <label className="text-sm" key={day}>{day}
                <input className="block w-full border border-slate-300 rounded-lg p-2 mt-1" value={value[day] || ''}
                    onChange={e => onChange({ ...value, [day]: e.target.value })} placeholder="09:00 AM, 10:30 AM" />
            </label>)}
        </div>
    </fieldset>;
}
