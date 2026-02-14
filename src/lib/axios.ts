import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from Redux store
    const state = store.getState();
    const token = state.auth.accessToken || localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        url: response.config.url,
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Response Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message,
      });
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      console.warn('🔒 Unauthorized access - clearing auth');
      store.dispatch(logout());
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
      localStorage.removeItem('rememberMe');
      
      // Redirect to login (you might want to use router here)
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      console.warn('🚫 Forbidden access');
    }

    if (error.response?.status === 404) {
      console.warn('🔍 Resource not found');
    }

    if (error.response?.status >= 500) {
      console.error('🔥 Server error');
    }

    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error - check your connection');
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API calls
export const apiHelpers = {
  // GET request
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.get(url, config).then(response => response.data);
  },

  // POST request
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.post(url, data, config).then(response => response.data);
  },

  // PUT request
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.put(url, data, config).then(response => response.data);
  },

  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.patch(url, data, config).then(response => response.data);
  },

  // DELETE request
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.delete(url, config).then(response => response.data);
  },

  // Upload file
  upload: <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> => {
    const method = config?.method || 'POST';
    const requestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    };
    
    // Use the appropriate HTTP method
    switch (method.toUpperCase()) {
      case 'PATCH':
        return api.patch(url, formData, requestConfig).then(response => response.data);
      case 'PUT':
        return api.put(url, formData, requestConfig).then(response => response.data);
      case 'POST':
      default:
        return api.post(url, formData, requestConfig).then(response => response.data);
    }
  },
};

// Export the configured axios instance
export default api;

// Export types for TypeScript
export type { AxiosRequestConfig, AxiosResponse, AxiosError };
