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
import Messages from "../pages/patient/Messages";

import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import DoctorAppointments from "../pages/doctor/DoctorAppointments";
import DoctorSchedule from "../pages/doctor/DoctorSchedule";
import DoctorProfile from "../pages/doctor/DoctorProfile";
import IssueCertificate from "../pages/doctor/IssueCertificate";
import PatientRecordView from "../pages/doctor/PatientRecordView";
import DoctorMessages from "../pages/doctor/DoctorMessages";

import AdminDashboard from "../pages/admin/AdminDashboard";
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
            <Route path="/doctor/issue-certificate" element={<ProtectedRoute allowedRoles={["doctor"]}><IssueCertificate /></ProtectedRoute>} />
            <Route path="/doctor/patient-records" element={<ProtectedRoute allowedRoles={["doctor"]}><PatientRecordView /></ProtectedRoute>} />
            <Route path="/doctor/messages" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorMessages /></ProtectedRoute>} />

            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><ManageUsers /></ProtectedRoute>} />
            <Route path="/admin/schedules" element={<ProtectedRoute allowedRoles={["admin"]}><ManageSchedules /></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAppointments /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReports /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoutes;