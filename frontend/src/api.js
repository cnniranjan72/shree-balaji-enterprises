import axios from 'axios';
import { showApiError } from './utils/apiErrorHandler';

// Use environment variable for API URL with fallback for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

export const purchaseSuppliersAPI = {
  getAll: async (search = '') => {
    try {
      return await api.get(`/purchase-suppliers?search=${search}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/purchase-suppliers/${id}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      return await api.post('/purchase-suppliers', data);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      return await api.put(`/purchase-suppliers/${id}`, data);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/purchase-suppliers/${id}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
};

export const purchaseProductsAPI = {
  getAll: async (search = '') => {
    try {
      return await api.get(`/purchase-products?search=${search}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/purchase-products/${id}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      return await api.post('/purchase-products', data);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      return await api.put(`/purchase-products/${id}`, data);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/purchase-products/${id}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
};

export const purchasesAPI = {
  getAll: async () => {
    try {
      return await api.get('/purchases');
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/purchases/${id}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  getByBill: async (billNumber) => {
    try {
      return await api.get(`/purchases/bill/${billNumber}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      return await api.post('/purchases', data);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      return await api.put(`/purchases/${id}`, data);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  updatePayment: async (id, amountPaid) => {
    try {
      return await api.patch(`/purchases/${id}/payment`, { amount_paid: amountPaid });
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/purchases/${id}`);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
};

export const purchaseExportAPI = {
  monthly: async (month, year) => {
    try {
      return await api.get(`/purchase-export/monthly?month=${month}&year=${year}`, {
        responseType: 'blob',
      });
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
  all: async () => {
    try {
      return await api.get('/purchase-export/all', {
        responseType: 'blob',
      });
    } catch (error) {
      showApiError(error);
      throw error;
    }
  },
};

export default api;
