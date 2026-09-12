import api from './api';

export const authApi = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (e) {
      // Return success even if offline during logout
      return { success: true };
    }
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  googleLogin: async (credential) => {
    const response = await api.post('/auth/google', { credential });
    return response.data;
  }
};

export default authApi;
