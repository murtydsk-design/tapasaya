import api from './api';

export const profileApi = {
  getProfile: async (page = 1, limit = 10) => {
    const res = await api.get(`/profile?page=${page}&limit=${limit}`);
    return res.data;
  },

  updateAvatar: async (avatar_type, avatar_id) => {
    if (avatar_type instanceof FormData) {
      const res = await api.patch('/profile/avatar', avatar_type, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    }
    const res = await api.patch('/profile/avatar', { avatar_type, avatar_id });
    return res.data;
  },

  uploadAvatarFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.patch('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  }
};

export default profileApi;
