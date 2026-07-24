/**
 * Notification & SMTP Settings API Service
 *
 * Provides API calls for managing SMTP configurations, testing SMTP connections,
 * email recipients, notification event rules, and email delivery logs.
 */
import api from './api';

/** Get SMTP Configuration */
export function getSmtpConfig() {
  return api.get('/settings/smtp');
}

/** Update SMTP Configuration */
export function updateSmtpConfig(data) {
  return api.put('/settings/smtp', data);
}

/** Test SMTP Connection */
export function testSmtpConnection(data) {
  return api.post('/settings/smtp/test', data);
}

/** List all email recipients */
export function getEmailRecipients() {
  return api.get('/settings/email-recipients');
}

/** Add a new email recipient */
export function addEmailRecipient(recipientData) {
  return api.post('/settings/email-recipients', recipientData);
}

/** Update an email recipient */
export function updateEmailRecipient(id, data) {
  return api.put(`/settings/email-recipients/${id}`, data);
}

/** Remove an email recipient */
export function removeEmailRecipient(id) {
  return api.delete(`/settings/email-recipients/${id}`);
}

/** Get Notification Event Rules */
export function getNotificationRules() {
  return api.get('/settings/notifications/rules');
}

/** Update Notification Event Rules */
export function updateNotificationRules(rules) {
  return api.put('/settings/notifications/rules', { rules });
}

/** Get Email Delivery Logs */
export function getEmailLogs(page = 1, perPage = 20) {
  return api.get(`/settings/notifications/logs?page=${page}&per_page=${perPage}`);
}

/** Legacy helper */
export function getNotificationSettings() {
  return api.get('/settings/notifications');
}
