import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Флаг для предотвращения бесконечного цикла при обновлении токена
let isRefreshing = false;
// Очередь запросов, ожидающих обновления токена
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  console.log('Current access token:', token ? 'Present' : 'Not present');

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log(`Adding Authorization header for request to ${config.url}`);
  } else {
    console.warn('No token found in localStorage');
  }

  console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`, config.data);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('Response success:', response.status, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error('Response error:', error.response?.status, error.response?.data);

    if (error.response?.status === 403 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        console.log('Attempting to refresh token...');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        console.log('Token refreshed successfully');

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        processQueue(refreshError, null);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
      console.error('Authentication error');
    }

    return Promise.reject(error);
  }
);

export const auth = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    if (response.data.accessToken && response.data.refreshToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  },
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    if (response.data.accessToken && response.data.refreshToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  },
  refresh: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response;
  },
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  getMe: () => api.get('/auth/me')
};

export const products = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export default api;