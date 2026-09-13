import api from './api';

export const questApi = {
  getQuests: async () => {
    const response = await api.get('/quests');
    return response.data;
  },

  getQuest: async (id) => {
    const response = await api.get(`/quests/${id}`);
    return response.data;
  },

  createQuest: async (questData) => {
    const response = await api.post('/quests', questData);
    return response.data;
  },

  updateQuest: async (id, questData) => {
    const response = await api.put(`/quests/${id}`, questData);
    return response.data;
  },

  deleteQuest: async (id) => {
    const response = await api.delete(`/quests/${id}`);
    return response.data;
  },

  completeQuest: async (id) => {
    const response = await api.post(`/quests/${id}/complete`);
    return response.data;
  },

  startTimer: async (id) => {
    const response = await api.post(`/quests/${id}/timer/start`);
    return response.data;
  },

  pauseTimer: async (id) => {
    const response = await api.post(`/quests/${id}/timer/pause`);
    return response.data;
  },

  resumeTimer: async (id) => {
    const response = await api.post(`/quests/${id}/timer/resume`);
    return response.data;
  },

  resetTimer: async (id) => {
    const response = await api.post(`/quests/${id}/timer/reset`);
    return response.data;
  },

  getTimer: async (id) => {
    const response = await api.get(`/quests/${id}/timer`);
    return response.data;
  }
};

export default questApi;
