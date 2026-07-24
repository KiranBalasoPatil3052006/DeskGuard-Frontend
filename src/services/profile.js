import api from './api';

/** Get current user profile */
export function getProfile() {
  return api.get('/profile');
}

/** Update user profile (name, email, mobile_number, phone) */
export function updateProfile(data) {
  return api.put('/profile', data);
}

/** Change password securely */
export function changePassword(data) {
  return api.patch('/profile/password', data);
}
