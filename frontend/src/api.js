import axios from 'axios';

// Use environment variable for API URL with fallback for development
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Debug info for development
if (import.meta.env.DEV) {
  console.log('🔧 Frontend API Configuration:');
  console.log('  API URL:', API_BASE_URL);
  console.log('  Environment:', import.meta.env.MODE);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const customersAPI = {
  getAll: (search = '') => api.get(`/customers/?search=${search}`),
  getById: (id) => api.get(`/customers/${id}/`),
  create: (data) => api.post('/customers/', data),
  update: (id, data) => api.put(`/customers/${id}/`, data),
  delete: (id) => api.delete(`/customers/${id}/`),
};

export const productsAPI = {
  getAll: (search = '') => api.get(`/products/?search=${search}`),
  getById: (id) => api.get(`/products/${id}/`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}/`, data),
  delete: (id) => api.delete(`/products/${id}/`),
};

export const salesAPI = {
  getAll: () => api.get('/sales/'),
  getById: (id) => api.get(`/sales/${id}/`),
  getByInvoice: (invoiceNumber) => api.get(`/sales/invoice/${invoiceNumber}/`),
  create: (data) => api.post('/sales/', data),
  update: (id, data) => api.put(`/sales/${id}/`, data),
  delete: (id) => api.delete(`/sales/${id}/`),
};

export const exportAPI = {
  monthly: (month, year) => {
    return api.get(`/export/monthly?month=${month}&year=${year}`, {
      responseType: 'blob',
    });
  },
  all: () => {
    return api.get('/export/all', {
      responseType: 'blob',
    });
  },
};

export const businessAPI = {
  getInfo: () => api.get('/business'),
};

export default api;
