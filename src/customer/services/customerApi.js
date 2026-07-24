import api from '../../services/api';

/** Get Customer Dashboard Overview */
export function getCustomerDashboard() {
  return api.get('/customer/dashboard');
}

/** Get Customer Systems list (paginated, searchable, filterable, sortable) */
export function getCustomerSystems(params) {
  return api.get('/customer/systems', { params });
}

/** Get Customer Machine Overview details */
export function getCustomerSystemOverview(id) {
  return api.get(`/customer/systems/${id}`);
}

/** Get Customer Alerts (read-only) */
export function getCustomerAlerts(params) {
  return api.get('/customer/alerts', { params });
}

/** Get Customer Profile */
export function getCustomerProfile() {
  return api.get('/customer/profile');
}

/** Get Customer Support Contact Info */
export function getCustomerSupport() {
  return api.get('/customer/support');
}
