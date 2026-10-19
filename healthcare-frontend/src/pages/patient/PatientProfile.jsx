import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { updateMyProfile } from "../../redux/slices/authSlice";
import { ageFromDob } from "../../utils/patientProfile.js";
import { hospitalToday } from "../../utils/appointmentView.js";
import Layout from "../../components/Layout";
import { useToast } from "../../components/Toast";

function PatientProfile() {
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();
    const toast = useToast();
    const currentPatient = { ...user, phone: user.mobile, age: ageFromDob(user.dob) };
    const profileValues = () => ({ name: user.name || '', dob: user.dob || '', gender: user.gender || '',
        bloodGroup: user.bloodGroup || '', mobile: user.mobile || '', address: user.address || '', emergencyContact: user.emergencyContact || '' });
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(profileValues);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async e => {
        e.preventDefault(); setSaving(true); setError('');
        try {
            await dispatch(updateMyProfile(formData)).unwrap();
            setIsEditing(false);
            toast.success('Your profile details have been saved.', 'Profile Saved');
        } catch (err) { setError(typeof err === 'string' ? err : 'Could not save your profile. Please retry.'); }
        finally { setSaving(false); }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-6 gap-4">
                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center border-2 border-white shadow-md shrink-0">
                            👤
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                {currentPatient.name}
                            </h1>
                            <p className="text-xs font-bold text-slate-500 mt-0.5">
                                Patient ID: #{currentPatient.id} • {currentPatient.email}
                            </p>
                        </div>
                    </div>

                    <button
                        disabled={saving}
                        onClick={() => { setFormData(profileValues()); setError(''); setIsEditing(!isEditing); }}
                        className="bg-slate-900 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow w-full sm:w-auto"
                    >
                        {isEditing ? "Cancel Edit" : "Edit Profile"}
                    </button>
                </div>

                {error && <p role="alert" className="text-sm text-rose-700 bg-rose-50 rounded-xl p-3">{error}</p>}
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Date of Birth</label>
                                <input
                                    type="date"
                                    max={hospitalToday()}
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                >
                                    <option value="">Not provided</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Blood Group</label>
                                <select
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                >
                                    <option value="">Not provided</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Phone Number</label>
                                <input
                                    type="text"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Emergency Contact</label>
                                <input
                                    type="text"
                                    name="emergencyContact"
                                    value={formData.emergencyContact}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-bold text-slate-700 mb-1.5">Residential Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                disabled={saving} onClick={() => setIsEditing(false)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-md shadow-teal-600/20"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Date of Birth, Age &amp; Gender</p>
                            <p className="font-bold text-slate-800">{currentPatient.age} years old • {currentPatient.gender}</p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Blood Group</p>
                            <p className="font-bold text-teal-700">{currentPatient.bloodGroup || "Not provided"}</p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Contact Phone</p>
                            <p className="font-bold text-slate-800">{currentPatient.phone || "Not provided"}</p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Emergency Phone</p>
                            <p className="font-bold text-slate-800">{currentPatient.emergencyContact || "Not provided"}</p>
                        </div>

                        <div className="sm:col-span-2 bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                            <p className="font-bold text-slate-800">{currentPatient.address || "Not provided"}</p>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default PatientProfile;
