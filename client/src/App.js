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

const MobileForgot = () => <div className="mobile-frame"><h2>Reset Password (coming soon)</h2></div>;

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
          <Route path="/mobile/forgot" element={<MobileForgot />} />
          <Route path="/mobile/new-vehicle" element={<MobileNewVehicle />} />
          <Route path="/mobile/schedule" element={<MobileScheduleService />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}




