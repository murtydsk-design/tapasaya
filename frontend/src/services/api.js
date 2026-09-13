import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || '/api';
if (rawBaseUrl.startsWith('http') && !rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = `${rawBaseUrl.replace(/\/+$/, '')}/api`;
}
const API_BASE_URL = rawBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('tapasya_token') || localStorage.getItem('tapasya_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    // If unauthenticated (401) and not currently on auth routes, emit token expiration
    if (error.response?.status === 401 && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
      sessionStorage.removeItem('tapasya_token');
      localStorage.removeItem('tapasya_token');
    }

    return Promise.reject({
      status: error.response?.status || 500,
      message,
      data: error.response?.data
    });
  }
);

export default api;
