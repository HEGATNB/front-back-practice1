import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  console.log('Current user from localStorage:', userStr);

  if (userStr && userStr !== 'undefined') {
    try {
      const user = JSON.parse(userStr);
      if (user && user.id) {
        config.headers['user-id'] = user.id;
        console.log(`Adding user-id header: ${user.id} for request to ${config.url}`);
      } else {
        console.warn('User object has no id:', user);
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
  } else {
    console.warn('No user found in localStorage');
  }

  console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`, config.data);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('Response success:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      console.error('Authentication error - user may need to login again');
    }

    return Promise.reject(error);
  }
);

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const products = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export default api;