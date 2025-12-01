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
export const createService = (payload) => api.post('/services', payload);
export const updateService = (id, payload) => api.put(`/services/${id}`, payload);
export const deleteService = (id) => api.delete(`/services/${id}`);
export const getAvailability = (service_id, date) => api.get('/appointments/availability', { params: { service_id, date } });
export const createAppointment = (body) => api.post('/appointments', body);

// Manager appointment endpoints
export const getAppointmentsGroupedByDate = () => api.get('/appointments/grouped-by-date');
export const getAppointmentsByDate = (date) => api.get('/appointments/by-date', { params: { date } });
export const getAppointmentById = (id) => api.get(`/appointments/${id}`);
export const getAvailableTechnicians = (appointmentId) => api.get(`/appointments/${appointmentId}/available-technicians`);
export const reassignTechnician = (appointmentId, technicianId) => api.patch(`/appointments/${appointmentId}/reassign`, { technician_id: technicianId });

// Technician/Employee endpoints
export const getTechnicians = () => api.get('/technicians');
export const createTechnician = (payload) => api.post('/technicians', payload);
export const updateTechnician = (id, payload) => api.put(`/technicians/${id}`, payload);
export const deleteTechnician = (id) => api.delete(`/technicians/${id}`);
export const getTechnicianAppointments = (id) => api.get(`/technicians/${id}/appointments`);

// Customers endpoints
export const getCustomers = () => api.get('/customers');
export const updateCustomer = (id, payload) => api.put(`/customers/${id}`, payload);

// Invoices endpoint
export const getInvoices = () => api.get('/invoices');
export const getInvoiceDetails = (id) => api.get(`/invoices/${id}/details`);

// Transactions endpoints
export const getTransactions = () => api.get('/transactions');
export const createTransaction = (payload) => api.post('/transactions', payload);
export const updateTransaction = (id, payload) => api.put(`/transactions/${id}`, payload);

// Parts endpoints
export const getParts = () => api.get('/parts');
export const createPart = (payload) => api.post('/parts', payload);
export const updatePart = (id, payload) => api.put(`/parts/${id}`, payload);
export const deletePart = (id) => api.delete(`/parts/${id}`);

// Repair endpoints
export const getRepairByAppointment = (appointmentId) => api.get(`/repairs/by-appointment/${appointmentId}`);
export const updateRepairStatus = (repairId, status) => api.patch(`/repairs/${repairId}/status`, { status });
export const getRepairParts = (repairId) => api.get(`/repairs/${repairId}/parts`);
export const addRepairPart = (repairId, payload) => api.post(`/repairs/${repairId}/parts`, payload);

export default api;

