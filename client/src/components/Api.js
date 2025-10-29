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
export const getServices = () => api.get('/services');



export default api;

