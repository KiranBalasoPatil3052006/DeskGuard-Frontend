import api from './api';

export const getCustomers = async (params = {}) => {
  try {
    const res = await api.get('/Customer', { params });
    return res.data;
  } catch (err) {
    console.error('getCustomers error:', err);
    throw err;
  }
};

export const getCustomerById = async (id) => {
  try {
    const res = await api.get(`/Customer/${id}`);
    return res.data;
  } catch (err) {
    console.error('getCustomerById error:', err);
    throw err;
  }
};

export const getCustomerMachines = async (id) => {
  try {
    const res = await api.get(`/Customer/${id}/machines`);
    return res.data;
  } catch (err) {
    console.error('getCustomerMachines error:', err);
    throw err;
  }
};
