import { HttpError } from './HttpError.js';
import { hospitalClock, validDate } from './appointments.js';
export const genders = ['', 'Male', 'Female', 'Other', 'Prefer not to say'];
export const bloodGroups = ['', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// Whitelist personal details; account permissions are managed on admin routes.
export function patientProfileUpdate(body, now = new Date()) {
  const limits = { name: 100, mobile: 30, address: 500, dob: 10, gender: 30, bloodGroup: 3, emergencyContact: 30 };
  if (!body || typeof body !== 'object' || Array.isArray(body) || !Object.keys(body).length) throw new HttpError(400, 'Provide profile details to update');
  const values = {};
  for (const [key, value] of Object.entries(body)) {
    if (!Object.hasOwn(limits, key)) throw new HttpError(400, 'This field cannot be changed from your patient profile: ' + key);
    if (typeof value !== 'string' || value.length > limits[key]) throw new HttpError(400, 'Provide a valid ' + key);
    values[key] = value.trim();
  }
  if (values.name !== undefined && !values.name) throw new HttpError(400, 'Full name is required');
  if (values.dob && (!validDate(values.dob) || values.dob > hospitalClock(now).date)) throw new HttpError(400, 'Provide a valid date of birth that is not in the future');
  if (values.gender !== undefined && !genders.includes(values.gender)) throw new HttpError(400, 'Choose a valid gender');
  if (values.bloodGroup !== undefined && !bloodGroups.includes(values.bloodGroup)) throw new HttpError(400, 'Choose a valid blood group');
  return values;
}
