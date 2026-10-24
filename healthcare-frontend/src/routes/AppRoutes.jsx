import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Unauthorized from "../pages/auth/Unauthorized";
import DemoHome from "../pages/DemoHome";
import NotFound from "../pages/NotFound";

import PatientDashboard from "../pages/patient/PatientDashboard";
import DoctorSearch from "../pages/patient/DoctorSearch";
import BookAppointment from "../pages/patient/BookAppointment";
import MyAppointments from "../pages/patient/MyAppointments";
import MedicalHistory from "../pages/patient/MedicalHistory";
import PatientBilling from "../pages/patient/PatientBilling";
import PatientProfile from "../pages/patient/PatientProfile";
import Notifications from "../pages/patient/Notifications";
import Messages from "../pages/Messages";
import Department from "../pages/Department";
import Certificates from "../pages/Certificates";

import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import DoctorAppointments from "../pages/doctor/DoctorAppointments";
import DoctorSchedule from "../pages/doctor/DoctorSchedule";
import DoctorProfile from "../pages/doctor/DoctorProfile";
import PatientRecordView from "../pages/doctor/PatientRecordView";

import AdminDashboard from "../pages/admin/AdminDashboard";
import DoctorCreation from "../pages/admin/DoctorCreation";
import DoctorTimings from "../pages/admin/DoctorTimings";
import HospitalSettings from "../pages/admin/HospitalSettings";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageSchedules from "../pages/admin/ManageSchedules";
import AdminReports from "../pages/admin/AdminReports";
import AdminAppointments from "../pages/admin/AdminAppointments";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<DemoHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={["patient"]}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/doctor-search" element={<ProtectedRoute allowedRoles={["patient"]}><DoctorSearch /></ProtectedRoute>} />
            <Route path="/patient/book-appointment/:doctorId" element={<ProtectedRoute allowedRoles={["patient"]}><BookAppointment /></ProtectedRoute>} />
            <Route path="/patient/my-appointments" element={<ProtectedRoute allowedRoles={["patient"]}><MyAppointments /></ProtectedRoute>} />
            <Route path="/patient/medical-history" element={<ProtectedRoute allowedRoles={["patient"]}><MedicalHistory /></ProtectedRoute>} />
            <Route path="/patient/billing" element={<ProtectedRoute allowedRoles={["patient"]}><PatientBilling /></ProtectedRoute>} />
            <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={["patient"]}><PatientProfile /></ProtectedRoute>} />
            <Route path="/patient/notifications" element={<ProtectedRoute allowedRoles={["patient"]}><Notifications /></ProtectedRoute>} />
            <Route path="/patient/messages" element={<ProtectedRoute allowedRoles={["patient"]}><Messages /></ProtectedRoute>} />

            <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorAppointments /></ProtectedRoute>} />
            <Route path="/doctor/schedule" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorSchedule /></ProtectedRoute>} />
            <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorProfile /></ProtectedRoute>} />
            <Route path="/doctor/issue-certificate" element={<ProtectedRoute allowedRoles={["doctor"]}><Certificates /></ProtectedRoute>} />
            <Route path="/doctor/patient-records" element={<ProtectedRoute allowedRoles={["doctor"]}><PatientRecordView /></ProtectedRoute>} />
            <Route path="/doctor/messages" element={<ProtectedRoute allowedRoles={["doctor"]}><Messages /></ProtectedRoute>} />

            <Route path="/patient/lab" element={<ProtectedRoute allowedRoles={["patient"]}><Department key="lab" kind="lab" /></ProtectedRoute>} />
            <Route path="/patient/medicine" element={<ProtectedRoute allowedRoles={["patient"]}><Department key="medicine" kind="medicine" /></ProtectedRoute>} />
            <Route path="/patient/certificates" element={<ProtectedRoute allowedRoles={["patient"]}><Certificates /></ProtectedRoute>} />
            <Route path="/lab/dashboard" element={<ProtectedRoute allowedRoles={["lab", "admin"]}><Department key="lab" kind="lab" /></ProtectedRoute>} />
            <Route path="/pharmacy/dashboard" element={<ProtectedRoute allowedRoles={["pharmacy", "admin"]}><Department key="medicine" kind="medicine" /></ProtectedRoute>} />

            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/hospital" element={<ProtectedRoute allowedRoles={["admin"]}><HospitalSettings /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><ManageUsers /></ProtectedRoute>} />
            <Route path="/admin/doctors/create" element={<ProtectedRoute allowedRoles={["admin"]}><DoctorCreation /></ProtectedRoute>} />
            <Route path="/admin/doctors/timings" element={<ProtectedRoute allowedRoles={["admin"]}><DoctorTimings /></ProtectedRoute>} />
            <Route path="/admin/schedules" element={<ProtectedRoute allowedRoles={["admin"]}><ManageSchedules /></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAppointments /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReports /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoutes;
