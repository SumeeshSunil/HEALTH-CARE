export const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export function slotsToForm(availability = []) {
    return Object.fromEntries(weekDays.map(day => [day, availability.find(item => item.day === day)?.slots.join(', ') || '']));
}
export function formToSlots(form) {
    return weekDays.map(day => ({ day, slots: (form[day] || '').split(',').map(slot => slot.trim().toUpperCase()).filter(Boolean) }))
        .filter(item => item.slots.length);
}
