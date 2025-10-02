// client/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import MobileHome from './components/MobileHome';
import MobileLookup from './components/MobileLookup';
import MobileCustomerResults from './components/MobileCustomerResults';

export default function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mobile" element={<MobileHome />} />
          <Route path="/mobile/lookup" element={<MobileLookup />} />
          <Route path="/mobile/customer-results" element={<MobileCustomerResults />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}




