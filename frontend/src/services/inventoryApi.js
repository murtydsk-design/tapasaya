import api from './api';

export const inventoryApi = {
  getInventory: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },

  equipItem: async (id) => {
    const response = await api.post(`/inventory/${id}/equip`);
    return response.data;
  }
};

export default inventoryApi;
