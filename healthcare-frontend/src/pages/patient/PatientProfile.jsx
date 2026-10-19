import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { updatePatientProfile } from "../../redux/slices/patientSlice";
import { login } from "../../redux/slices/authSlice";
import patients from "../../data/dummyPatients.json";
import Layout from "../../components/Layout";
import { useToast } from "../../components/Toast";

function PatientProfile() {
    const auth = useSelector((state) => state.auth);
    const patientsList = useSelector((state) => state.patient?.patients || patients);
    const dispatch = useDispatch();
    const toast = useToast();

    const currentPatient = patientsList.find(
        (p) => p.userId === auth?.user?.id || p.email?.toLowerCase() === auth?.user?.email?.toLowerCase() || p.id === auth?.user?.id
    ) || {
        id: auth?.user?.id || 4,
        userId: auth?.user?.id || 4,
        name: auth?.user?.name || "Patient",
        email: auth?.user?.email || "patient@healthcare.com",
        age: 28,
        gender: "Patient",
        phone: "+91 9876543210",
        address: "Kerala",
        bloodGroup: "O+",
        emergencyContact: "+91 9876543211"
    };

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: currentPatient.name || auth?.user?.name || "",
        age: currentPatient.age || "28",
        gender: currentPatient.gender || "Patient",
        bloodGroup: currentPatient.bloodGroup || "O+",
        phone: currentPatient.phone || "",
        address: currentPatient.address || "",
        emergencyContact: currentPatient.emergencyContact || "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const updatedObj = {
            id: currentPatient.id || auth?.user?.id,
            userId: currentPatient.userId || auth?.user?.id,
            email: currentPatient.email || auth?.user?.email,
            ...formData
        };

        dispatch(updatePatientProfile(updatedObj));

        if (auth?.user) {
            dispatch(login({
                ...auth.user,
                name: formData.name,
                address: formData.address,
                phone: formData.phone
            }));
        }

        setIsEditing(false);
        toast.success("Patient demographic profile updated successfully.", "Profile Saved");
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
                        onClick={() => setIsEditing(!isEditing)}
                        className="bg-slate-900 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow w-full sm:w-auto"
                    >
                        {isEditing ? "Cancel Edit" : "Edit Profile"}
                    </button>
                </div>

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
                                <label className="block font-bold text-slate-700 mb-1.5">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
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
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
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
                                    name="phone"
                                    value={formData.phone}
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
                                onClick={() => setIsEditing(false)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-md shadow-teal-600/20"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Age &amp; Gender</p>
                            <p className="font-bold text-slate-800">{currentPatient.age} years old • {currentPatient.gender}</p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Blood Group</p>
                            <p className="font-bold text-teal-700">{currentPatient.bloodGroup || "O+"}</p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Contact Phone</p>
                            <p className="font-bold text-slate-800">{currentPatient.phone}</p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Emergency Phone</p>
                            <p className="font-bold text-slate-800">{currentPatient.emergencyContact || "+91 9876543211"}</p>
                        </div>

                        <div className="sm:col-span-2 bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                            <p className="font-bold text-slate-800">{currentPatient.address}</p>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default PatientProfile;
