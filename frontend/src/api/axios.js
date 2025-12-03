import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }

  console.log('AUTH HEADER SET:', config.headers.authorization);
  console.log('REQUEST URL:', config.url);

  return config;
});

export default api;
