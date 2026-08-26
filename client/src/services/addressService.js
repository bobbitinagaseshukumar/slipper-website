import api from './api';

export const addressService = {
  getAddresses: async () => {
    return await api.get('/addresses');
  },

  createAddress: async (addressData) => {
    return await api.post('/addresses', addressData);
  },

  updateAddress: async (id, addressData) => {
    return await api.patch(`/addresses/${id}`, addressData);
  },

  deleteAddress: async (id) => {
    return await api.delete(`/addresses/${id}`);
  },

  setDefaultAddress: async (id) => {
    return await api.patch(`/addresses/${id}/default`);
  },
};

export default addressService;
