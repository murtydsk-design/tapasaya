import api from './api';

export const profileApi = {
  getProfile: async (page = 1, limit = 10) => {
    const res = await api.get(`/profile?page=${page}&limit=${limit}`);
    return res.data;
  },

  updateAvatar: async (avatar_type, avatar_id) => {
    const res = await api.patch('/profile/avatar', { avatar_type, avatar_id });
    return res.data;
  }
};

export default profileApi;
