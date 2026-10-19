import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addAppointment } from "../../redux/slices/appointmentSlice";
import { addNotification } from "../../redux/slices/notificationSlice";
import dummyDoctors from "../../data/dummyDoctors.json";
import patients from "../../data/dummyPatients.json";
import Layout from "../../components/Layout";
import { useToast } from "../../components/Toast";

function BookAppointment() {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const toast = useToast();
    const auth = useSelector((state) => state.auth);
    const reduxDoctors = useSelector((state) => state.doctors?.doctors || dummyDoctors);
    const appointments = useSelector((state) => state.appointment?.appointments || []);

    const reduxPatients = useSelector((state) => state.patient?.patients || patients);

    const currentPatient = reduxPatients.find(
        (p) => p.userId === auth?.user?.id || p.email?.toLowerCase() === auth?.user?.email?.toLowerCase() || p.id === auth?.user?.id
    ) || {
        id: auth?.user?.id || 4,
        userId: auth?.user?.id || 4,
        name: auth?.user?.name || "Patient",
        email: auth?.user?.email || "patient@healthcare.com"
    };

    const doctor = reduxDoctors.find((d) => d.id === parseInt(doctorId, 10)) || reduxDoctors[0];

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedTime, setSelectedTime] = useState("");
    const [reason, setReason] = useState("");

    const getDayNameFromDate = (dateString) => {
        if (!dateString) return "";
        const parts = dateString.split("-");
        if (parts.length === 3) {
            const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            return dateObj.toLocaleDateString("en-US", { weekday: "long" });
        }
        return new Date(dateString).toLocaleDateString("en-US", { weekday: "long" });
    };

    const selectedDayName = getDayNameFromDate(selectedDate);

    const getAvailableSlotsForDate = () => {
        if (!doctor.availability || doctor.availability.length === 0) {
            return ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"];
        }
        const daySchedule = doctor.availability.find(
            (a) => a.day.toLowerCase() === selectedDayName.toLowerCase()
        );
        if (!daySchedule || !daySchedule.slots || daySchedule.slots.length === 0) {
            return [];
        }
        return daySchedule.slots;
    };

    const availableSlots = getAvailableSlotsForDate();

    const getAvailableDaysList = () => {
        if (!doctor.availability || doctor.availability.length === 0) return "All Days";
        return doctor.availability
            .filter((a) => a.slots && a.slots.length > 0)
            .map((a) => a.day)
            .join(", ");
    };

    const getSlotBookingCount = (slotTime) => {
        return appointments.filter(
            (a) =>
                a.doctorId === doctor.id &&
                a.date === selectedDate &&
                a.time === slotTime &&
                a.status !== "cancelled"
        ).length;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime) {
            toast.warning("Please select a consultation date and available time slot.");
            return;
        }

        if (availableSlots.length === 0) {
            toast.error(`${doctor.name} is off-duty on ${selectedDayName}s. Please pick another date.`);
            return;
        }

        const count = getSlotBookingCount(selectedTime);
        if (count >= 4) {
            toast.error("This time slot has reached its maximum capacity of 4 patients. Please choose another.", "Slot Full");
            return;
        }

        const newAppointment = {
            id: Date.now(),
            patientId: currentPatient.id,
            patientName: currentPatient.name || auth?.user?.name || "Patient",
            patientEmail: currentPatient.email || auth?.user?.email || "",
            doctorId: doctor.id,
            date: selectedDate,
            time: selectedTime,
            status: "pending",
            reason: reason || "General Consultation",
            notes: reason || "Submitted for Admin confirmation",
            createdAt: new Date().toISOString().split("T")[0]
        };

        dispatch(addAppointment(newAppointment));
        dispatch(addNotification({
            title: "Appointment Request Submitted",
            message: `Your appointment request with ${doctor.name} for ${selectedDate} at ${selectedTime} has been submitted and is pending Admin confirmation.`,
            type: "appointment",
            userId: currentPatient.id,
            userEmail: currentPatient.email || auth?.user?.email
        }));
        toast.success(`Appointment requested with ${doctor.name} for ${selectedTime} on ${selectedDate}. Pending Admin approval.`, "Request Submitted");
        navigate("/patient/my-appointments");
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-teal-300 font-extrabold text-2xl flex items-center justify-center border-2 border-white shadow shrink-0">
                            {doctor.name.replace(/^Dr\.?\s*/i, "").charAt(0)}
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">
                                Direct Consultation Booking
                            </span>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                                {doctor.name}
                            </h1>
                            <p className="text-xs text-slate-500 font-semibold">
                                {doctor.specialization} • Fee: ₹{doctor.fee || 500} • {doctor.location || "Kerala"}
                            </p>
                            <p className="text-[11px] text-teal-600 font-bold mt-1">
                                📅 Available Consultation Days: <span className="text-slate-800">{getAvailableDaysList()}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition"
                    >
                        ← Back to Search
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
                    <div>
                        <label className="block font-bold text-slate-700 mb-2">
                            1. Select Consultation Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setSelectedTime("");
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 focus:bg-white transition text-slate-800 font-semibold"
                            required
                        />
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                            Selected day: <strong className="text-slate-800">{selectedDayName}</strong>
                        </p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block font-bold text-slate-700">
                                2. Available Time Slots for {doctor.name} ({selectedDayName})
                            </label>
                            <span className="text-[11px] font-semibold text-slate-400">
                                Selected Date: {selectedDate}
                            </span>
                        </div>

                        {availableSlots.length === 0 ? (
                            <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl text-center space-y-1">
                                <p className="text-xs font-bold text-rose-700">
                                    🚫 {doctor.name} is Off-Duty on {selectedDayName}s
                                </p>
                                <p className="text-[11px] text-rose-600">
                                    Doctor's working days are: <strong className="text-slate-900">{getAvailableDaysList()}</strong>. Please choose another date.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {availableSlots.map((slot) => {
                                    const bookedCount = getSlotBookingCount(slot);
                                    const isFull = bookedCount >= 4;
                                    const isSelected = selectedTime === slot;

                                    return (
                                        <button
                                            type="button"
                                            key={slot}
                                            disabled={isFull}
                                            onClick={() => setSelectedTime(slot)}
                                            className={`py-3 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border ${
                                                isFull
                                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                                                    : isSelected
                                                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20"
                                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50 hover:border-teal-300"
                                            }`}
                                        >
                                            <span>🕒 {slot}</span>
                                            <span
                                                className={`text-[10px] font-extrabold ${
                                                    isFull
                                                        ? "text-rose-500"
                                                        : isSelected
                                                        ? "text-teal-100"
                                                        : bookedCount > 2
                                                        ? "text-amber-600"
                                                        : "text-emerald-600"
                                                }`}
                                            >
                                                {isFull ? "No slot available" : `${bookedCount}/4 booked`}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 mb-2">
                            3. Chief Complaint / Reason for Visit
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows="3"
                            placeholder="Describe symptoms or clinical checkup reasons..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 focus:bg-white transition text-slate-800"
                        ></textarea>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-800 space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                            <span>ℹ️</span> Admin Approval Notice
                        </p>
                        <p>
                            Appointments are submitted to the Hospital Administration for schedule verification before being confirmed.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] text-slate-400 font-semibold uppercase">Total Fee</p>
                            <p className="text-xl font-extrabold text-slate-900">₹{doctor.fee || 500}</p>
                        </div>
                        <button
                            type="submit"
                            disabled={!selectedTime || availableSlots.length === 0}
                            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition shadow-md ${
                                selectedTime && availableSlots.length > 0
                                    ? "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20"
                                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                            }`}
                        >
                            Request Appointment (Admin Verification)
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}

export default BookAppointment;