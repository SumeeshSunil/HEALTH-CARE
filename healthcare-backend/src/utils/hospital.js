export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const timePattern = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;

// A blank array means the doctor is not accepting appointments yet.
export function validAvailability(value) {
  return Array.isArray(value) && value.length <= 7
    && new Set(value.map(item => item?.day)).size === value.length
    && value.every(item => item && days.includes(item.day) && Array.isArray(item.slots)
      && item.slots.length <= 48 && new Set(item.slots).size === item.slots.length
      && item.slots.every(slot => typeof slot === 'string' && timePattern.test(slot)));
}

export function doctorResponse(user) {
  const profile = user.doctorProfile;
  return {
    id: user.id, userId: user.id, name: user.name, isActive: user.isActive,
    departmentId: profile.department?.id || String(profile.department || ''),
    specialization: profile.department?.name || '', fee: profile.fee,
    qualification: profile.qualification, experience: profile.experience,
    availability: profile.availability.map(item => ({ day: item.day, slots: [...item.slots] })),
  };
}

// Editing account details must not replace consultation slots saved separately.
export function doctorDetailsUpdate(data) {
  return {
    name: data.name, email: data.email, isActive: data.isActive,
    'doctorProfile.department': data.doctorProfile.department,
    'doctorProfile.fee': data.doctorProfile.fee,
    'doctorProfile.qualification': data.doctorProfile.qualification,
    'doctorProfile.experience': data.doctorProfile.experience,
  };
}
