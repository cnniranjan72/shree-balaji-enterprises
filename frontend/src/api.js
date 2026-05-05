import axios from 'axios';
import { showApiError } from './utils/apiErrorHandler';

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
  timeout: 30000, // Increased to 30s to handle Render cold starts
});

export const customersAPI = {
  getAll: async (search = '') => {
    try {
      return await api.get(`/customers?search=${search}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/customers/${id}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      return await api.post('/customers', data);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      return await api.put(`/customers/${id}`, data);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/customers/${id}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
};

export const productsAPI = {
  getAll: async (search = '') => {
    try {
      return await api.get(`/products?search=${search}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/products/${id}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      return await api.post('/products', data);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      return await api.put(`/products/${id}`, data);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/products/${id}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
};

export const salesAPI = {
  getAll: async () => {
    try {
      return await api.get('/sales');
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/sales/${id}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  getByInvoice: async (invoiceNumber) => {
    try {
      return await api.get(`/sales/invoice/${invoiceNumber}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      return await api.post('/sales', data);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      return await api.put(`/sales/${id}`, data);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/sales/${id}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
};

export const exportAPI = {
  monthly: async (month, year) => {
    try {
      return await api.get(`/export/monthly?month=${month}&year=${year}`, {
        responseType: 'blob',
      });
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  all: async () => {
    try {
      return await api.get('/export/all', {
        responseType: 'blob',
      });
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
};

export const businessAPI = {
  getInfo: async () => {
    try {
      return await api.get('/business');
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
};

export default api;
