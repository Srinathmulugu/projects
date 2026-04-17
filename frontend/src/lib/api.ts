import axios from 'axios';
import { auth } from '@/lib/firebase';
import { getAdminPassword } from '@/lib/adminAuth';

const defaultApiBase = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiBase,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase auth token to each request
api.interceptors.request.use(async (config) => {
  const user = auth?.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof window !== 'undefined') {
    const adminPassword = getAdminPassword();
    if (adminPassword) {
      config.headers['x-admin-password'] = adminPassword;
    }
  }

  return config;
});

export default api;
