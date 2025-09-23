// client/src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const isAuthed = Boolean(token);

  return isAuthed ? children : <Navigate to="/Admin" replace />;
};

export default ProtectedRoute;
