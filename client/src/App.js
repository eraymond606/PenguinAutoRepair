// client/src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// import your new pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Schedule from "./pages/Schedule";
import AppointmentConfirmed from "./pages/AppointmentConfirmed";

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

          {/* Scheduling flow */}
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/appointment-confirmed" element={<AppointmentConfirmed />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}
