import api from './api';

export const profileApi = {
  getProfile: async (page = 1, limit = 10) => {
    const res = await api.get(`/profile?page=${page}&limit=${limit}`);
    return res.data;
  }
};

export default profileApi;
