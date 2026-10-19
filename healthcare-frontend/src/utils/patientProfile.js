import { hospitalToday } from './appointmentView.js';
export function ageFromDob(dob, today = hospitalToday()) {
    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob) || dob > today) return null;
    const date = new Date(dob + 'T00:00:00Z');
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dob) return null;
    let age = Number(today.slice(0, 4)) - Number(dob.slice(0, 4));
    if (today.slice(5) < dob.slice(5)) age--;
    return age;
}

export function bookedPatientProfiles(appointments, doctorId) {
    if (!doctorId) return [];
    const patients = new Map();
    for (const appointment of appointments) {
        if (appointment.doctorId !== doctorId || !appointment.patientId || patients.has(appointment.patientId)) continue;
        patients.set(appointment.patientId, { ...appointment.patientDetails, id: appointment.patientId,
            name: appointment.patientDetails?.name || appointment.patientName || 'Registered patient',
            email: appointment.patientDetails?.email || appointment.patientEmail || '' });
    }
    return [...patients.values()];
}
