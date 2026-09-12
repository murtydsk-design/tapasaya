import api from './api';

export const characterApi = {
  getCharacter: async () => {
    const response = await api.get('/character');
    return response.data;
  },

  getProgress: async () => {
    const response = await api.get('/progress');
    return response.data;
  }
};

export default characterApi;
