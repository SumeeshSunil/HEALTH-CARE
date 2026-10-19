import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Layout from "../../components/Layout";
import dummyDoctors from "../../data/dummyDoctors.json";
import { updateDoctorSchedule } from "../../redux/slices/doctorSlice";
import { useToast } from "../../components/Toast";

function DoctorSchedule() {
    const dispatch = useDispatch();
    const toast = useToast();
    const auth = useSelector((state) => state.auth);
    const reduxDoctors = useSelector((state) => state.doctors?.doctors || dummyDoctors);

    const doctorObj = reduxDoctors.find(
        (d) => d.name === auth?.user?.name || d.userId === auth?.user?.id
    ) || reduxDoctors[0];

    const defaultSchedule = [
        { day: "Monday", slots: ["09:00 AM", "10:30 AM", "01:00 PM", "03:00 PM"], active: true },
        { day: "Tuesday", slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"], active: true },
        { day: "Wednesday", slots: ["09:00 AM", "10:30 AM", "01:00 PM"], active: true },
        { day: "Thursday", slots: ["10:00 AM", "01:00 PM", "03:30 PM"], active: true },
        { day: "Friday", slots: ["09:00 AM", "11:30 AM", "02:30 PM"], active: true },
        { day: "Saturday", slots: ["10:00 AM", "12:00 PM"], active: false },
        { day: "Sunday", slots: [], active: false }
    ];

    const getInitialSchedule = () => {
        if (!doctorObj.availability) return defaultSchedule;
        return defaultSchedule.map((d) => {
            const found = doctorObj.availability.find((a) => a.day === d.day);
            if (found) {
                return { day: d.day, slots: found.slots, active: found.slots.length > 0 };
            }
            return { day: d.day, slots: d.slots, active: false };
        });
    };

    const [scheduleSlots, setScheduleSlots] = useState(getInitialSchedule());

    const toggleDayActive = (index) => {
        const updated = [...scheduleSlots];
        updated[index].active = !updated[index].active;
        setScheduleSlots(updated);

        const newAvailability = updated
            .filter((s) => s.active && s.slots.length > 0)
            .map((s) => ({ day: s.day, slots: s.slots }));

        dispatch(updateDoctorSchedule({
            doctorId: doctorObj.id,
            availability: newAvailability
        }));

        toast.info(
            `${updated[index].day} status set to ${updated[index].active ? "Available" : "Off Duty"}.`,
            "Schedule Updated"
        );
    };

    return (
        <Layout>
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                    Schedule Management
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    Weekly Consultation Hours
                </h1>
                <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed max-w-xl">
                    Configure your daily consultation slots and online availability for patient appointments.
                </p>
            </div>

            <div className="space-y-4">
                {scheduleSlots.map((daySlot, idx) => (
                    <div
                        key={daySlot.day}
                        className={`bg-white rounded-2xl p-5 sm:p-6 shadow-sm border transition ${
                            daySlot.active ? "border-slate-200/80" : "border-slate-200 bg-slate-50/50 opacity-60"
                        }`}
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-extrabold text-slate-900">{daySlot.day}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    daySlot.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-200 text-slate-600"
                                }`}>
                                    {daySlot.active ? "Available for Patients" : "Off Duty"}
                                </span>
                            </div>

                            <button
                                onClick={() => toggleDayActive(idx)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                                    daySlot.active
                                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                        : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                                }`}
                            >
                                {daySlot.active ? "Set Off Duty" : "Enable Day"}
                            </button>
                        </div>

                        {daySlot.active && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                                {daySlot.slots.length > 0 ? (
                                    daySlot.slots.map((slot, sIdx) => (
                                        <span
                                            key={sIdx}
                                            className="bg-slate-100 text-slate-800 font-semibold px-3 py-1.5 rounded-xl text-xs border border-slate-200"
                                        >
                                            🕒 {slot}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-400 italic">No custom slots added for this day.</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Layout>
    );
}

export default DoctorSchedule;
