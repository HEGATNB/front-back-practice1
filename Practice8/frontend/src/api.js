import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор для добавления токена к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Current token:', token ? 'Present' : 'Not present');

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log(`Adding Authorization header for request to ${config.url}`);
  } else {
    console.warn('No token found in localStorage');
  }

  console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`, config.data);
  return config;
});

// Интерсептор для обработки ответов
api.interceptors.response.use(
  (response) => {
    console.log('Response success:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      console.error('Authentication error - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Не делаем автоматический редирект здесь, чтобы избежать цикла
    }

    return Promise.reject(error);
  }
);

export const auth = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  },
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  },
  getMe: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const products = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export default api;