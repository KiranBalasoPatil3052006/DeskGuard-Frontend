import api from '../../services/api';

/** Get customer dashboard summary metrics & recent alerts */
export async function getCustomerDashboard() {
  const response = await api.get('/customer-portal/dashboard');
  return response.data?.data || response.data || response;
}

/** Get list of systems registered under customer mobile number */
export async function getCustomerSystems(params = {}) {
  const response = await api.get('/customer-portal/systems', { params });
  return response.data?.data || response.data || response;
}

/** Get detailed overview of a single system */
export async function getMachineOverview(id) {
  const response = await api.get(`/customer-portal/systems/${id}`);
  return response.data?.data || response.data || response;
}

/** Get customer alerts (read-only) */
export async function getCustomerAlerts(params = {}) {
  const response = await api.get('/customer-portal/alerts', { params });
  return response.data?.data || response.data || response;
}

/** Get customer account profile details */
export async function getCustomerProfile() {
  const response = await api.get('/customer-portal/profile');
  return response.data?.data || response.data || response;
}

/** Get AMC support contacts & info */
export async function getCustomerSupport() {
  const response = await api.get('/customer-portal/support');
  return response.data?.data || response.data || response;
}
