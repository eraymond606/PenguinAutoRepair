// client/src/components/Api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', 
  headers: { 'Content-Type': 'application/json' }
});

export const getHealth = () => api.get('/health');
export default api;
export const lookupCustomer = (payload) => api.post('/customers/lookup', payload);

