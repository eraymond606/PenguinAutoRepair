// client/src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// import your new pages
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerifyCode from "./pages/VerifyCode/VerifyCode";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Vehicles from "./pages/Vehicles/Vehicles";
import Schedule from "./pages/Schedule/Schedule";
import AppointmentConfirmed from "./pages/AppointmentConfirmed/AppointmentConfirmed";
import StaffLogin from "./pages/StaffLogin/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard/StaffDashboard";
import StaffAppointments from "./pages/Staff/StaffAppointments";

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* New auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/vehicles" element={<Vehicles />} />

          {/* Scheduling flow */}
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/appointment-confirmed" element={<AppointmentConfirmed />} />

          {/* Staff routes */}
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/appointments" element={<StaffAppointments />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}
