import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateDoctorProfile } from "../../redux/slices/doctorSlice";
import { login } from "../../redux/slices/authSlice";
import dummyDoctors from "../../data/dummyDoctors.json";
import Layout from "../../components/Layout";
import { useToast } from "../../components/Toast";

function DoctorProfile() {
    const auth = useSelector((state) => state.auth);
    const reduxDoctors = useSelector((state) => state.doctors?.doctors || dummyDoctors);
    const dispatch = useDispatch();
    const toast = useToast();

    const doctorData = reduxDoctors.find((d) => d.userId === auth?.user?.id || d.name === auth?.user?.name || d.id === auth?.user?.id) || {
        id: auth?.user?.id || 1,
        userId: auth?.user?.id || 1,
        name: auth?.user?.name || "Dr. Arjun Menon",
        specialization: "Cardiology",
        location: "Kochi, Kerala",
        experience: "12 years",
        fee: 500,
        phone: "+91 98470 12345",
        email: auth?.user?.email || "arjun.menon@healthcare.com",
        bio: "Senior medical specialist dedicated to evidence-based diagnostics, patient wellness, and preventive care in Kerala."
    };

    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: doctorData.name || auth?.user?.name || "",
        specialization: doctorData.specialization || "General Medicine",
        location: doctorData.location || "Kochi, Kerala",
        experience: doctorData.experience || "5 years",
        fee: doctorData.fee || 500,
        phone: doctorData.phone || "+91 98470 12345",
        email: doctorData.email || auth?.user?.email || "",
        bio: doctorData.bio || "Senior medical specialist dedicated to patient care."
    });

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        dispatch(updateDoctorProfile({
            doctorId: doctorData.id || auth?.user?.id,
            updatedData: profile
        }));

        if (auth?.user) {
            dispatch(login({
                ...auth.user,
                name: profile.name
            }));
        }

        setIsEditing(false);
        toast.success("Doctor professional profile updated successfully.", "Profile Saved");
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-6 gap-4">
                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-900 text-teal-300 font-extrabold text-2xl sm:text-3xl flex items-center justify-center border-2 border-white shadow-md shrink-0">
                            🩺
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                {profile.name}
                            </h1>
                            <p className="text-xs font-bold text-teal-600 mt-0.5">
                                {profile.specialization} • {profile.location} • License #MCI-84910
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="bg-slate-900 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow w-full sm:w-auto"
                    >
                        {isEditing ? "Cancel Edit" : "Edit Credentials"}
                    </button>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Doctor Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Specialization</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={profile.specialization}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Hospital / Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={profile.location}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Years of Experience</label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={profile.experience}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Consultation Fee (₹)</label>
                                <input
                                    type="number"
                                    name="fee"
                                    value={profile.fee}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Contact Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={profile.phone}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-bold text-slate-700 mb-1.5">Professional Bio &amp; Summary</label>
                                <textarea
                                    name="bio"
                                    rows="3"
                                    value={profile.bio}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                ></textarea>
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
                                Save Credentials
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6 text-xs sm:text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Clinical Practice Fee</p>
                                <p className="font-bold text-teal-700 text-base">₹{profile.fee}</p>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
                                <p className="font-bold text-slate-800">{profile.experience}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-2">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Biography &amp; Clinical Background</p>
                            <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default DoctorProfile;
