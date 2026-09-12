import api from './api';

export const rewardApi = {
  getRewards: async () => {
    const response = await api.get('/rewards');
    return response.data;
  },

  getReward: async (id) => {
    const response = await api.get(`/rewards/${id}`);
    return response.data;
  },

  purchaseReward: async (id) => {
    const response = await api.post(`/rewards/${id}/purchase`);
    return response.data;
  }
};

export default rewardApi;
