// client/src/components/Api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', 
  headers: { 'Content-Type': 'application/json' }
});

export const getHealth = () => api.get('/health');

export const authLogin  = (payload) => api.post('/auth/login', payload);
export const authSignup = (payload) => api.post('/auth/signup', payload);
export const authForgot = (payload) => api.post('/auth/forgot', payload);
export const addVehicle = (payload) => api.post('/vehicles', payload);
export const fetchCustomerVehicles = (customer_id) => api.get(`/vehicles/by-customer/${customer_id}`);
export const getServices = () => api.get('/services');
export const getAvailability = (service_id, date) => api.get('/appointments/availability', { params: { service_id, date } });
export const createAppointment = (body) => api.post('/appointments', body);

// Manager appointment endpoints
export const getAppointmentsGroupedByDate = () => api.get('/appointments/grouped-by-date');
export const getAppointmentsByDate = (date) => api.get('/appointments/by-date', { params: { date } });
export const getAppointmentById = (id) => api.get(`/appointments/${id}`);
export const getAvailableTechnicians = (appointmentId) => api.get(`/appointments/${appointmentId}/available-technicians`);
export const reassignTechnician = (appointmentId, technicianId) => api.patch(`/appointments/${appointmentId}/reassign`, { technician_id: technicianId });


export default api;

