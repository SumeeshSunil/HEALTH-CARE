import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import doctors from "../../data/dummyDoctors.json";
import Layout from "../../components/Layout";

function DoctorSearch() {
    const [searchText, setSearchText] = useState("");
    const [selectedSpecialization, setSelectedSpecialization] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const searchRef = useRef(null);
    const navigate = useNavigate();

    const specializations = [...new Set(doctors.map((d) => d.specialization))];

    const filteredSpecializations = specializations.filter((spec) =>
        spec.toLowerCase().includes(searchText.toLowerCase())
    );

    const filteredDoctors = selectedSpecialization
        ? doctors.filter((d) => d.specialization === selectedSpecialization)
        : doctors.filter(
              (d) =>
                  d.name.toLowerCase().includes(searchText.toLowerCase()) ||
                  d.specialization.toLowerCase().includes(searchText.toLowerCase())
          );

    const handleSelectSpecialization = (spec) => {
        setSelectedSpecialization(spec);
        setSearchText(spec);
        setShowSuggestions(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-xl">
                    <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                        Find Specialists
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                        Find & Book Top Doctors
                    </h1>
                    <p className="text-slate-300 mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed">
                        Search through certified medical practitioners across clinical disciplines.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                    <div ref={searchRef} className="relative flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by doctor name or specialty..."
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    setShowSuggestions(true);
                                    if (!e.target.value) setSelectedSpecialization("");
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:border-teal-500 focus:bg-white transition text-xs sm:text-sm text-slate-800"
                            />
                            <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {showSuggestions && filteredSpecializations.length > 0 && (
                            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-30 max-h-48 overflow-y-auto">
                                {filteredSpecializations.map((spec) => (
                                    <div
                                        key={spec}
                                        onClick={() => handleSelectSpecialization(spec)}
                                        className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 cursor-pointer border-b border-slate-100 last:border-0"
                                    >
                                        🏥 {spec}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedSpecialization && (
                        <button
                            onClick={() => {
                                setSelectedSpecialization("");
                                setSearchText("");
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                        >
                            Clear Filter ✕
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                        Popular:
                    </span>
                    {specializations.map((spec) => (
                        <button
                            key={spec}
                            onClick={() => handleSelectSpecialization(spec)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
                                selectedSpecialization === spec
                                    ? "bg-teal-600 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {spec}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredDoctors.map((doc) => (
                    <div
                        key={doc.id}
                        className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-900 text-teal-300 font-extrabold text-xl flex items-center justify-center border-2 border-white shadow shrink-0">
                                    {doc.name.replace(/^Dr\.?\s*/i, "").charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-extrabold text-slate-900 text-base truncate">
                                        {doc.name}
                                    </h3>
                                    <p className="text-xs font-bold text-teal-600 mt-0.5">
                                        {doc.specialization}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        🎓 {doc.experience || "10+ Years Experience"} • 📍 {doc.location || "Kerala"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 text-xs border-t border-b border-slate-100 py-3 my-3 text-slate-600">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Consultation Fee</span>
                                    <span className="font-extrabold text-slate-900">₹{doc.fee || 500}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Availability</span>
                                    <span className="font-semibold text-emerald-600">Mon - Fri</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(`/patient/book-appointment/${doc.id}`)}
                            className="w-full bg-slate-900 hover:bg-teal-600 text-white py-2.5 rounded-xl text-xs font-bold transition shadow"
                        >
                            Book Consultation →
                        </button>
                    </div>
                ))}
            </div>
        </Layout>
    );
}

export default DoctorSearch;
