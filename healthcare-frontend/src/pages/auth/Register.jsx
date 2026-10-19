import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../redux/slices/authSlice";
import { registerUser } from "../../redux/slices/usersSlice";
import { addPatient } from "../../redux/slices/patientSlice";
import { addDoctor } from "../../redux/slices/doctorSlice";
import { useToast } from "../../components/Toast";

function Register() {
    const [role, setRole] = useState("patient");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [address, setAddress] = useState("");
    const [mobile, setMobile] = useState("");
    const [dob, setDob] = useState("");

    const [specialization, setSpecialization] = useState("");
    const [experience, setExperience] = useState("");
    const [qualification, setQualification] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();

        const userId = Date.now();
        const formattedName = role === "doctor" && !name.toLowerCase().startsWith("dr.")
            ? `Dr. ${name.trim()}`
            : name.trim();

        const newUser = {
            id: userId,
            name: formattedName || "Registered User",
            email: email.trim(),
            password: password,
            role: role,
            ...(role === "patient"
                ? { address, mobile, dob }
                : { specialization, experience, qualification })
        };

        dispatch(registerUser(newUser));

        if (role === "patient") {
            const newPatientObj = {
                id: userId,
                userId: userId,
                name: formattedName,
                email: email.trim(),
                age: 28,
                gender: "Patient",
                phone: mobile || "+91 9876543210",
                address: address || "Kerala",
                bloodGroup: "O+"
            };
            dispatch(addPatient(newPatientObj));
        } else if (role === "doctor") {
            const newDoctorObj = {
                id: userId,
                userId: userId,
                name: formattedName,
                specialization: specialization || "General Medicine",
                location: "Kochi, Kerala",
                experience: experience ? `${experience} years` : "5 years",
                rating: 4.8,
                availability: [
                    { day: "Monday", slots: ["09:00 AM", "10:00 AM", "11:30 AM"] },
                    { day: "Wednesday", slots: ["02:00 PM", "03:00 PM"] },
                    { day: "Friday", slots: ["09:00 AM", "10:00 AM"] }
                ],
                verified: true
            };
            dispatch(addDoctor(newDoctorObj));
        }

        dispatch(login(newUser));

        toast.success(`Account registered successfully as ${role.toUpperCase()}! Welcome ${formattedName}.`, "Registration Successful");

        if (role === "patient") navigate("/patient/dashboard");
        else if (role === "doctor") navigate("/doctor/dashboard");
        else navigate("/admin/dashboard");
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/40 via-slate-900 to-slate-950 pointer-events-none"></div>

            <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative z-10 space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-teal-600 to-teal-400 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-teal-500/20">
                        ✚
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        CREATE <span className="text-teal-600">ACCOUNT</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Register as a Patient or Attending Doctor
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                    <div>
                        <label className="block font-bold text-slate-700 mb-1.5">Register As</label>
                        <div className="grid grid-cols-2 gap-2">
                            {["patient", "doctor"].map((r) => (
                                <button
                                    type="button"
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`py-2.5 rounded-xl text-xs font-extrabold capitalize transition border ${
                                        role === r
                                            ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20"
                                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                    }`}
                                >
                                    {r === "patient" ? "👤 Patient" : "🩺 Doctor"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 mb-1.5">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                            required
                        />
                    </div>

                    {role === "patient" && (
                        <div className="space-y-4 pt-2 border-t border-slate-100">
                            <p className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">Patient Demographic Details</p>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Residential Address</label>
                                <input
                                    type="text"
                                    placeholder="Enter your address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Mobile Number</label>
                                    <input
                                        type="tel"
                                        placeholder="+91 9876543210"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {role === "doctor" && (
                        <div className="space-y-4 pt-2 border-t border-slate-100">
                            <p className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">Medical Professional Credentials</p>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Specialization</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Cardiology, Dermatology"
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Years of Experience</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 10"
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Qualification</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. MBBS, MD"
                                        value={qualification}
                                        onChange={(e) => setQualification(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 rounded-xl transition shadow-lg text-xs tracking-wider uppercase"
                    >
                        Register Account
                    </button>
                </form>

                <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                    Already registered?{" "}
                    <Link to="/login" className="font-bold text-teal-600 hover:underline">
                        Sign in here
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;