import api from './api';

export function loginUser(email, password) {
  return api.post('/auth/login', { email, password });
}

export function logoutUser() {
  return api.post('/auth/logout');
}

export function getUser() {
  return api.get('/auth/user');
}

export function requestCustomerOtp(mobileNumber) {
  return api.post('/auth/customer-request-otp', { mobile_number: mobileNumber });
}

export function verifyCustomerOtp(mobileNumber, otp) {
  return api.post('/auth/customer-verify-otp', { mobile_number: mobileNumber, otp });
}
