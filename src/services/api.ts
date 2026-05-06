import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mybank_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Only force-logout if the user was already authenticated (has a token).
    // Do NOT redirect on login/register endpoint failures.
    if (error.response?.status === 401 && localStorage.getItem('mybank_token')) {
      localStorage.removeItem('mybank_token');
      localStorage.removeItem('mybank_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
