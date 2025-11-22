// client/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import MobileHome from './components/MobileHome';
import MobileLogin from './components/MobileLogin';
import MobileSignup from './components/MobileSignup';
import MobileCustomerResults from './components/MobileCustomerResults';
import MobileNewVehicle from './components/MobileNewVehicle';
import MobileScheduleService from './components/MobileScheduleService';
import MobileScheduleDate from './components/MobileScheduleDate';
import MobileConfirmAppointment from './components/MobileConfirmAppointment';
import MobileAppointmentConfirmed from './components/MobileAppointmentConfirmed';
import MobileManagerAppointments from './components/MobileManagerAppointments';
import MobileManagerAppointmentDetail from './components/MobileManagerAppointmentDetail';
import MobileForgotPassword from './components/MobileForgotPassword';
import MobileVerifyEmail from './components/MobileVerifyEmail';
import MobileResetPassword from './components/MobileResetPassword';
import MobileEmployeeLogin from './components/MobileEmployeeLogin';
import MobileEmployeeDashboard from './components/MobileEmployeeDashboard';
import MobileEmployeeForgotPassword from './components/MobileEmployeeForgotPassword';
import MobileEmployeeVerifyEmail from './components/MobileEmployeeVerifyEmail';
import MobileEmployeeResetPassword from './components/MobileEmployeeResetPassword';

export default function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mobile" element={<MobileHome />} />
          <Route path="/mobile/login" element={<MobileLogin />} />
          <Route path="/mobile/customer-results" element={<MobileCustomerResults />} />
          <Route path="/mobile/signup" element={<MobileSignup />} />
          <Route path="/mobile/forgot" element={<MobileForgotPassword />} />
          <Route path="/mobile/forgot/verify" element={<MobileVerifyEmail />} />
          <Route path="/mobile/forgot/reset" element={<MobileResetPassword />} />
          <Route path="/mobile/new-vehicle" element={<MobileNewVehicle />} />
          <Route path="/mobile/schedule" element={<MobileScheduleService />} />
          <Route path="/mobile/schedule/date" element={<MobileScheduleDate />} />
          <Route path="/mobile/confirm" element={<MobileConfirmAppointment />} />
          <Route path="/mobile/appointment-confirmed" element={<MobileAppointmentConfirmed />} />
          <Route path="/mobile/manager/appointments" element={<MobileManagerAppointments />} />
          <Route path="/mobile/manager/appointment/:id" element={<MobileManagerAppointmentDetail />} />
          <Route path="/mobile/employee/login" element={<MobileEmployeeLogin />} />
          <Route path="/mobile/employee/dashboard" element={<MobileEmployeeDashboard />} />
          <Route path="/mobile/employee/forgot" element={<MobileEmployeeForgotPassword />} />
          <Route path="/mobile/employee/forgot/verify" element={<MobileEmployeeVerifyEmail />} />
          <Route path="/mobile/employee/forgot/reset" element={<MobileEmployeeResetPassword />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}




