import api from './api';

export const homepageService = {
  getHomepageData: async () => {
    return await api.get('/homepage');
  },
};

export default homepageService;
