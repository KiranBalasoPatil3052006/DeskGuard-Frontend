import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCog, FaChartLine, FaBell, FaShieldAlt, FaSave, FaUser, FaCamera, FaPlus, FaTrash, FaSlidersH, FaLock, FaKey, FaHistory, FaSearch, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { getAlertRules, updateAlertRule } from '../../services/alerts';
import { 
  getSmtpConfig, updateSmtpConfig, testSmtpConnection, 
  getEmailRecipients, addEmailRecipient, updateEmailRecipient, removeEmailRecipient, 
  getNotificationRules, updateNotificationRules, getEmailLogs 
} from '../../services/settings';
import { getProfile, updateProfile, changePassword } from '../../services/profile';
import { getUser } from '../../services/auth';
import { getSecuritySettings, updateSecuritySettings, getLoginHistory, getSecurityAuditLogs } from '../../services/security';
import api from '../../services/api';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [alertRules, setAlertRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesSaving, setRulesSaving] = useState(false);
  const [rulesMessage, setRulesMessage] = useState('');

  const getPref = (key, def) => {
    try { const v = localStorage.getItem(`settings_${key}`); return v !== null ? JSON.parse(v) : def; }
    catch { return def; }
  };
  const setPref = (key, val) => localStorage.setItem(`settings_${key}`, JSON.stringify(val));

  // --- Profile State ---
  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // --- Notifications & SMTP State ---
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: 587,
    username: '',
    password: '',
    isPasswordSet: false,
    enable_ssl: true,
    encryption_type: 'TLS',
    from_email: '',
    from_name: 'DeskGuard Monitoring System',
    timeout_seconds: 15,
    retry_count: 3,
    retry_delay_seconds: 5
  });
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpMessage, setSmtpMessage] = useState({ type: '', text: '' });
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  const [recipients, setRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSuccess, setNotifSuccess] = useState(true);

  const [notificationRules, setNotificationRules] = useState([]);
  const [rulesNotifLoading, setRulesNotifLoading] = useState(false);
  const [rulesNotifSaving, setRulesNotifSaving] = useState(false);
  const [rulesNotifMessage, setRulesNotifMessage] = useState({ type: '', text: '' });

  const [emailLogs, setEmailLogs] = useState([]);
  const [emailLogsLoading, setEmailLogsLoading] = useState(false);
  const [emailLogsPage, setEmailLogsPage] = useState(1);
  const [emailLogsTotalPages, setEmailLogsTotalPages] = useState(1);

  // --- General Settings State (localStorage) ---
  const [theme, setTheme] = useState(() => getPref('theme', 'light'));
  const [language, setLanguage] = useState(() => getPref('language', 'en'));
  const [dateFormat, setDateFormat] = useState(() => getPref('dateFormat', '12h'));
  const [timezone, setTimezone] = useState(() => getPref('timezone', 'utc'));

  // --- Monitoring State (localStorage) ---
  const [refreshInterval, setRefreshInterval] = useState(() => getPref('refreshInterval', '5'));
  const [cpuThreshold, setCpuThreshold] = useState(() => getPref('cpuThreshold', 90));
  const [ramThreshold, setRamThreshold] = useState(() => getPref('ramThreshold', 85));
  const [diskThreshold, setDiskThreshold] = useState(() => getPref('diskThreshold', 95));
  const [alertFrequency, setAlertFrequency] = useState(() => getPref('alertFrequency', 'immediate'));
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(() => getPref('emailAlertsEnabled', true));
  const [inAppAlerts, setInAppAlerts] = useState(() => getPref('inAppAlerts', true));

  // --- Security Settings State ---
  const [secSettings, setSecSettings] = useState({
    min_password_length: 6,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_special_chars: true,
    idle_session_timeout_minutes: 30,
    max_failed_login_attempts: 5,
    account_lockout_duration_minutes: 30,
  });
  const [secLoading, setSecLoading] = useState(false);
  const [secSaving, setSecSaving] = useState(false);
  const [secMessage, setSecMessage] = useState({ type: '', text: '' });

  // --- Login History State ---
  const [loginHistory, setLoginHistory] = useState([]);
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);
  const [loginHistoryPage, setLoginHistoryPage] = useState(1);
  const [loginHistoryTotalPages, setLoginHistoryTotalPages] = useState(1);
  const [loginHistorySearch, setLoginHistorySearch] = useState('');
  const [loginHistoryStatus, setLoginHistoryStatus] = useState('all');

  // --- Security Audit Logs State ---
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [auditLogsPage, setAuditLogsPage] = useState(1);
  const [auditLogsTotalPages, setAuditLogsTotalPages] = useState(1);
  const [auditLogsSearch, setAuditLogsSearch] = useState('');

  useEffect(() => { setPref('theme', theme); }, [theme]);
  useEffect(() => { setPref('language', language); }, [language]);
  useEffect(() => { setPref('dateFormat', dateFormat); }, [dateFormat]);
  useEffect(() => { setPref('timezone', timezone); }, [timezone]);
  useEffect(() => { setPref('refreshInterval', refreshInterval); }, [refreshInterval]);
  useEffect(() => { setPref('cpuThreshold', cpuThreshold); }, [cpuThreshold]);
  useEffect(() => { setPref('ramThreshold', ramThreshold); }, [ramThreshold]);
  useEffect(() => { setPref('diskThreshold', diskThreshold); }, [diskThreshold]);
  useEffect(() => { setPref('alertFrequency', alertFrequency); }, [alertFrequency]);
  useEffect(() => { setPref('emailAlertsEnabled', emailAlertsEnabled); }, [emailAlertsEnabled]);
  useEffect(() => { setPref('inAppAlerts', inAppAlerts); }, [inAppAlerts]);

  useEffect(() => {
    if (activeTab === 'thresholds') fetchRules();
    if (activeTab === 'profile') fetchUser();
    if (activeTab === 'notifications') {
      fetchSmtpConfig();
      fetchRecipients();
      fetchNotificationRulesList();
      fetchEmailLogsList(1);
    }
    if (activeTab === 'security') {
      fetchSecSettings();
      fetchLoginHistoryList(1, loginHistorySearch, loginHistoryStatus);
      fetchSecurityAuditLogsList(1, auditLogsSearch);
    }
  }, [activeTab]);

  const fetchSecSettings = async () => {
    setSecLoading(true);
    try {
      const res = await getSecuritySettings();
      if (res?.data) setSecSettings(res.data);
    } catch (err) {
      console.error('Failed to load security settings:', err);
      setSecMessage({ type: 'danger', text: err?.message || 'Failed to load security settings.' });
    } finally {
      setSecLoading(false);
    }
  };

  const handleSaveSecSettings = async (e) => {
    e.preventDefault();
    setSecSaving(true);
    setSecMessage({ type: '', text: '' });
    try {
      const res = await updateSecuritySettings(secSettings);
      if (res?.data) setSecSettings(res.data);
      setSecMessage({ type: 'success', text: 'Security settings updated successfully!' });
    } catch (err) {
      console.error('Failed to save security settings:', err);
      setSecMessage({ type: 'danger', text: err?.response?.data?.message || err?.message || 'Failed to update security settings.' });
    } finally {
      setSecSaving(false);
    }
  };

  const fetchLoginHistoryList = async (page = 1, search = '', status = 'all') => {
    setLoginHistoryLoading(true);
    try {
      const res = await getLoginHistory({ page, per_page: 10, search, status });
      const paginated = res?.data || res;
      setLoginHistory(paginated.data || []);
      setLoginHistoryTotalPages(paginated.total_pages || 1);
      setLoginHistoryPage(page);
    } catch (err) {
      console.error('Failed to fetch login history:', err);
    } finally {
      setLoginHistoryLoading(false);
    }
  };

  const fetchSecurityAuditLogsList = async (page = 1, search = '') => {
    setAuditLogsLoading(true);
    try {
      const res = await getSecurityAuditLogs({ page, per_page: 10, search });
      const paginated = res?.data || res;
      setAuditLogs(paginated.data || []);
      setAuditLogsTotalPages(paginated.total_pages || 1);
      setAuditLogsPage(page);
    } catch (err) {
      console.error('Failed to fetch security audit logs:', err);
    } finally {
      setAuditLogsLoading(false);
    }
  };

  // --- Profile Handlers ---
  const fetchUser = async () => {
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });
    try {
      const res = await getProfile();
      const userData = res.data || res;
      setUser(userData);
      setOriginalUser(userData);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      try {
        const fallbackRes = await getUser();
        const fbData = fallbackRes.data || fallbackRes;
        setUser(fbData);
        setOriginalUser(fbData);
      } catch (_) {
        setProfileMessage({ type: 'danger', text: err?.message || 'Failed to load user profile.' });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setProfileSaving(true);
    setProfileMessage({ type: '', text: '' });
    try {
      const res = await updateProfile({
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        phone: user.phone,
      });
      const updatedData = res.data || res;
      setUser(updatedData);
      setOriginalUser(updatedData);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMessage({ type: 'danger', text: err?.message || err?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
    setTimeout(() => setProfileMessage({ type: '', text: '' }), 5000);
  };

  const handleCancelProfileEdit = () => {
    if (originalUser) {
      setUser({ ...originalUser });
    }
    setProfileMessage({ type: '', text: '' });
  };

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPasswordMessage({ type: 'warning', text: 'Please fill in all password fields.' });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordMessage({ type: 'danger', text: 'New password and confirm password do not match.' });
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      await changePassword({
        current_password: passwords.current,
        new_password: passwords.new,
        confirm_password: passwords.confirm,
      });
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setPasswordMessage({ type: 'danger', text: err?.message || err?.data?.message || 'Failed to update password.' });
    } finally {
      setPasswordSaving(false);
    }
    setTimeout(() => setPasswordMessage({ type: '', text: '' }), 5000);
  };

  // --- SMTP Handlers ---
  const fetchSmtpConfig = async () => {
    setSmtpLoading(true);
    setSmtpMessage({ type: '', text: '' });
    try {
      const res = await getSmtpConfig();
      if (res?.data) {
        const d = res.data;
        setSmtpConfig({
          host: d.host || '',
          port: d.port || 587,
          username: d.username || '',
          password: '',
          isPasswordSet: d.isPasswordSet || false,
          enable_ssl: d.enableSsl !== undefined ? d.enableSsl : true,
          encryption_type: d.encryptionType || 'TLS',
          from_email: d.fromEmail || '',
          from_name: d.fromName || 'DeskGuard Monitoring System',
          timeout_seconds: d.timeoutSeconds || 15,
          retry_count: d.retryCount || 3,
          retry_delay_seconds: d.retryDelaySeconds || 5
        });
      }
    } catch (err) {
      console.error('Failed to load SMTP config:', err);
      setSmtpMessage({ type: 'danger', text: err?.message || 'Failed to load SMTP configuration.' });
    } finally {
      setSmtpLoading(false);
    }
  };

  const handleSaveSmtpConfig = async (e) => {
    if (e) e.preventDefault();
    setSmtpSaving(true);
    setSmtpMessage({ type: '', text: '' });
    try {
      const res = await updateSmtpConfig({
        host: smtpConfig.host,
        port: Number(smtpConfig.port),
        username: smtpConfig.username,
        password: smtpConfig.password || null,
        enableSsl: smtpConfig.enable_ssl,
        encryptionType: smtpConfig.encryption_type,
        fromEmail: smtpConfig.from_email,
        fromName: smtpConfig.from_name,
        timeoutSeconds: Number(smtpConfig.timeout_seconds),
        retryCount: Number(smtpConfig.retry_count),
        retryDelaySeconds: Number(smtpConfig.retry_delay_seconds)
      });
      if (res?.data) {
        setSmtpConfig(prev => ({ ...prev, password: '', isPasswordSet: true }));
      }
      setSmtpMessage({ type: 'success', text: 'SMTP server configuration saved successfully!' });
    } catch (err) {
      console.error('Failed to save SMTP config:', err);
      const data = err?.response?.data;
      const errorMsg = data?.message || (data?.errors ? Object.values(data.errors).flat().join(', ') : err?.message) || 'Failed to save SMTP configuration.';
      setSmtpMessage({ type: 'danger', text: errorMsg });
    } finally {
      setSmtpSaving(false);
    }
    setTimeout(() => setSmtpMessage({ type: '', text: '' }), 5000);
  };

  const handleTestSmtpConnection = async () => {
    if (!smtpConfig.host || !smtpConfig.from_email) {
      setSmtpMessage({ type: 'warning', text: 'SMTP Host and From Email are required to test connection.' });
      return;
    }
    setSmtpTesting(true);
    setSmtpMessage({ type: '', text: '' });
    try {
      const res = await testSmtpConnection({
        host: smtpConfig.host,
        port: Number(smtpConfig.port),
        username: smtpConfig.username,
        password: smtpConfig.password || null,
        enableSsl: smtpConfig.enable_ssl,
        encryptionType: smtpConfig.encryption_type,
        fromEmail: smtpConfig.from_email,
        fromName: smtpConfig.from_name
      });
      setSmtpMessage({ type: 'success', text: res?.message || 'SMTP connection test succeeded! Authentication verified.' });
    } catch (err) {
      console.error('SMTP test failed:', err);
      const data = err?.response?.data;
      const errorMsg = data?.message || (data?.errors ? Object.values(data.errors).flat().join(', ') : err?.message) || 'SMTP connection test failed. Verify host, port, and credentials.';
      setSmtpMessage({ type: 'danger', text: errorMsg });
    } finally {
      setSmtpTesting(false);
    }
  };

  // --- Recipient Handlers ---
  const fetchRecipients = async () => {
    setRecipientsLoading(true);
    setNotifMessage('');
    try {
      const res = await getEmailRecipients();
      setRecipients(res.data || []);
    } catch (err) {
      console.error('Failed to load recipients:', err);
      setNotifMessage('Failed to load email recipients.');
      setNotifSuccess(false);
    } finally {
      setRecipientsLoading(false);
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail) return;
    setNotifMessage('');
    try {
      const res = await addEmailRecipient({
        email: newEmail,
        name: newName,
        department: newDepartment,
        is_active: true
      });
      const added = res.data || { id: Date.now(), email: newEmail, name: newName, department: newDepartment, is_active: true };
      setRecipients(prev => [added, ...prev]);
      setNewEmail('');
      setNewName('');
      setNewDepartment('');
      setNotifSuccess(true);
      setNotifMessage('Email recipient added successfully.');
    } catch (err) {
      console.error('Failed to add recipient:', err);
      setNotifSuccess(false);
      const data = err?.response?.data;
      const errorMsg = data?.message || (data?.errors ? Object.values(data.errors).flat().join(', ') : err?.message) || 'Failed to add recipient.';
      setNotifMessage(errorMsg);
    }
    setTimeout(() => setNotifMessage(''), 3000);
  };

  const handleRemoveRecipient = async (id) => {
    setNotifMessage('');
    try {
      await removeEmailRecipient(id);
      setRecipients(prev => prev.filter(r => r.id !== id));
      setNotifSuccess(true);
      setNotifMessage('Recipient removed successfully.');
    } catch (err) {
      console.error('Failed to remove recipient:', err);
      setNotifSuccess(false);
      const data = err?.response?.data;
      const errorMsg = data?.message || (data?.errors ? Object.values(data.errors).flat().join(', ') : err?.message) || 'Failed to remove recipient.';
      setNotifMessage(errorMsg);
    }
    setTimeout(() => setNotifMessage(''), 3000);
  };

  const handleToggleRecipient = async (recip) => {
    try {
      await updateEmailRecipient(recip.id, { is_active: !recip.is_active });
      setRecipients(prev => prev.map(r => r.id === recip.id ? { ...r, is_active: !r.is_active } : r));
    } catch (err) {
      console.error('Failed to toggle recipient:', err);
    }
  };

  // --- Notification Rules Handlers ---
  const fetchNotificationRulesList = async () => {
    setRulesNotifLoading(true);
    try {
      const res = await getNotificationRules();
      if (res?.data) setNotificationRules(res.data);
    } catch (err) {
      console.error('Failed to load notification rules:', err);
    } finally {
      setRulesNotifLoading(false);
    }
  };

  const handleToggleRule = (eventType) => {
    setNotificationRules(prev => prev.map(r => r.event_type === eventType ? { ...r, send_email: !r.send_email } : r));
  };

  const handleSaveNotificationRules = async () => {
    setRulesNotifSaving(true);
    setRulesNotifMessage({ type: '', text: '' });
    try {
      await updateNotificationRules(notificationRules);
      setRulesNotifMessage({ type: 'success', text: 'Notification event rules saved successfully!' });
    } catch (err) {
      console.error('Failed to save notification rules:', err);
      const data = err?.response?.data;
      const errorMsg = data?.message || (data?.errors ? Object.values(data.errors).flat().join(', ') : err?.message) || 'Failed to save notification rules.';
      setRulesNotifMessage({ type: 'danger', text: errorMsg });
    } finally {
      setRulesNotifSaving(false);
    }
    setTimeout(() => setRulesNotifMessage({ type: '', text: '' }), 4000);
  };

  // --- Email Logs Handlers ---
  const fetchEmailLogsList = async (page = 1) => {
    setEmailLogsLoading(true);
    try {
      const res = await getEmailLogs(page, 10);
      const paginated = res?.data || res;
      setEmailLogs(paginated.data || []);
      setEmailLogsTotalPages(paginated.total_pages || 1);
      setEmailLogsPage(page);
    } catch (err) {
      console.error('Failed to load email logs:', err);
    } finally {
      setEmailLogsLoading(false);
    }
  };

  // --- Alert Rules ---
  const fetchRules = async () => {
    setRulesLoading(true);
    try {
      const res = await getAlertRules();
      setAlertRules(res.data || []);
    } catch (err) {
      console.error('Failed to load alert rules:', err);
    } finally {
      setRulesLoading(false);
    }
  };

  const handleRuleToggle = async (rule) => {
    try {
      await updateAlertRule(rule.id, { is_enabled: !rule.is_enabled });
      setAlertRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_enabled: !r.is_enabled } : r));
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  const handleRuleSave = async (rule) => {
    setRulesSaving(true);
    setRulesMessage('');
    try {
      await updateAlertRule(rule.id, {
        value: rule.value,
        severity: rule.severity,
        is_enabled: rule.is_enabled,
        consecutive_count: rule.consecutive_count,
        cooldown_minutes: rule.cooldown_minutes,
      });
      setRulesMessage('Rule updated successfully.');
      setTimeout(() => setRulesMessage(''), 3000);
    } catch (err) {
      setRulesMessage('Failed to update rule.');
      console.error('Failed to update rule:', err);
    } finally {
      setRulesSaving(false);
    }
  };

  const handleRuleChange = (id, field, value) => {
    setAlertRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>System Settings</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--dg-text-muted)', margin: 0 }}>Configure DeskGuard agent thresholds, profile details, and preferences.</p>
        </div>
        <div>
          <button 
            className="btn btn-primary d-flex align-items-center gap-2" 
            onClick={() => { 
              Object.entries({ theme, language, dateFormat, timezone, refreshInterval, cpuThreshold, ramThreshold, diskThreshold, alertFrequency, emailAlertsEnabled, inAppAlerts }).forEach(([k, v]) => setPref(k, v)); 
              alert('Settings saved locally.'); 
            }}
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            <FaSave size={12} />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Horizontal Tabs Navigation */}
      <div className="pill-group flex-wrap mb-4">
        <button 
          className={`pill-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser className="me-1.5" /> Profile & Account
        </button>
        <button 
          className={`pill-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <FaBell className="me-1.5" /> Notifications & Alerts
        </button>
        <button 
          className={`pill-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <FaCog className="me-1.5" /> General Settings
        </button>
        <button 
          className={`pill-btn ${activeTab === 'thresholds' ? 'active' : ''}`}
          onClick={() => setActiveTab('thresholds')}
        >
          <FaSlidersH className="me-1.5" /> Alert Thresholds
        </button>
        <button 
          className={`pill-btn ${activeTab === 'monitoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitoring')}
        >
          <FaChartLine className="me-1.5" /> Monitoring Preferences
        </button>
        <button 
          className={`pill-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <FaShieldAlt className="me-1.5" /> Security Settings
        </button>
      </div>

      {/* Settings Content Area */}
      <div className="card mb-4">
        <div className="card-body">
            
            {/* Profile & Account Settings */}
            {activeTab === 'profile' && (
              <div className="fade show active">
                <h5 className="fw-bold text-dark mb-4 border-bottom pb-3">Profile & Account</h5>
                
                {profileMessage.text && (
                  <div className={`alert alert-${profileMessage.type} py-2.5 mb-4 small d-flex align-items-center`} style={{ borderRadius: '10px' }}>
                    <span className="fw-semibold">{profileMessage.text}</span>
                  </div>
                )}
                
                {profileLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading profile...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row g-4">
                    {/* Left Column: Personal Profile Details */}
                    <div className="col-12 col-xl-6">
                      <h6 className="fw-bold mb-3 text-dark">Profile Photo</h6>
                      <div className="d-flex align-items-center mb-4">
                        <div className="position-relative">
                          {user?.avatar ? (
                            <img src={user.avatar} alt="avatar" className="rounded-circle" style={{ width: '90px', height: '90px', objectFit: 'cover', border: '2px solid #E2E8F0' }} />
                          ) : (
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-primary fs-2" style={{ width: '90px', height: '90px', border: '2px solid #E2E8F0' }}>
                              <FaUser />
                            </div>
                          )}
                          <button className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', padding: '0' }} title="Change Avatar">
                            <FaCamera style={{ fontSize: '0.8rem' }} />
                          </button>
                        </div>
                        <div className="ms-4">
                          <button className="btn btn-outline-secondary btn-sm fw-bold px-3 mb-1" style={{ borderRadius: '8px', fontSize: '0.8rem' }} disabled>
                            Upload Photo (Future Extension)
                          </button>
                          <div className="small text-muted" style={{ fontSize: '0.72rem' }}>Avatar upload placeholder</div>
                        </div>
                      </div>
                      
                      <form onSubmit={handleSaveProfile}>
                        <h6 className="fw-bold mb-3 text-dark">Personal Information</h6>
                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Full Name <span className="text-danger">*</span></label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={user?.name || ''} 
                            onChange={e => setUser({...user, name: e.target.value})} 
                            required 
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Email Address <span className="text-danger">*</span></label>
                          <input 
                            type="email" 
                            className="form-control" 
                            value={user?.email || ''} 
                            onChange={e => setUser({...user, email: e.target.value})} 
                            required 
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Mobile Number</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. +919876543210"
                            value={user?.mobile_number || ''} 
                            onChange={e => setUser({...user, mobile_number: e.target.value})} 
                          />
                        </div>
                        <div className="mb-4">
                          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Landline Phone</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. 022-12345678"
                            value={user?.phone || ''} 
                            onChange={e => setUser({...user, phone: e.target.value})} 
                          />
                        </div>

                        <div className="d-flex gap-2">
                          <button 
                            type="submit" 
                            className="btn btn-primary d-flex align-items-center gap-2 fw-bold px-4 py-2" 
                            style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                            disabled={profileSaving}
                          >
                            <FaSave size={13} />
                            <span>{profileSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary fw-semibold px-3 py-2" 
                            style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                            onClick={handleCancelProfileEdit}
                            disabled={profileSaving}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                    
                    {/* Right Column: Read-Only System Metadata & Change Password */}
                    <div className="col-12 col-xl-6">
                      <h6 className="fw-bold mb-3 text-dark">System Account Credentials</h6>
                      
                      <div className="p-3 bg-light border mb-4" style={{ borderRadius: '12px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                          <span className="text-muted small fw-semibold">Employee ID:</span>
                          <code className="font-mono text-primary fw-bold" style={{ fontSize: '0.85rem' }}>{user?.employee_id || '—'}</code>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                          <span className="text-muted small fw-semibold">Assigned Role:</span>
                          <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-2.5 py-1" style={{ fontSize: '0.75rem' }}>
                            {user?.role || user?.roles?.[0]?.name || 'User'}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                          <span className="text-muted small fw-semibold">Account Status:</span>
                          <span className={`badge ${user?.is_active !== false ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary'} fw-bold px-2.5 py-1`} style={{ fontSize: '0.75rem' }}>
                            {user?.is_active !== false ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                          <span className="text-muted small fw-semibold">Created Date:</span>
                          <span className="fw-semibold text-dark" style={{ fontSize: '0.82rem' }}>
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted small fw-semibold">Last Login:</span>
                          <span className="fw-semibold text-dark" style={{ fontSize: '0.82rem' }}>
                            {user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Just Now'}
                          </span>
                        </div>
                      </div>

                      <h6 className="fw-bold mb-3 text-dark">Change Password</h6>
                      {passwordMessage.text && (
                        <div className={`alert alert-${passwordMessage.type} py-2.5 mb-3 small d-flex align-items-center`} style={{ borderRadius: '10px' }}>
                          <span className="fw-semibold">{passwordMessage.text}</span>
                        </div>
                      )}
                      
                      <form onSubmit={handleChangePassword}>
                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Current Password <span className="text-danger">*</span></label>
                          <input 
                            type="password" 
                            className="form-control" 
                            value={passwords.current} 
                            onChange={e => setPasswords({...passwords, current: e.target.value})} 
                            required 
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>New Password <span className="text-danger">*</span></label>
                          <input 
                            type="password" 
                            className="form-control" 
                            value={passwords.new} 
                            onChange={e => setPasswords({...passwords, new: e.target.value})} 
                            required 
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Confirm New Password <span className="text-danger">*</span></label>
                          <input 
                            type="password" 
                            className="form-control" 
                            value={passwords.confirm} 
                            onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                            required 
                          />
                        </div>

                        {/* Complexity rules notice */}
                        <div className="p-2.5 bg-light border mb-3 rounded" style={{ fontSize: '0.72rem', color: 'var(--dg-text-muted)' }}>
                          <strong>Password Requirements:</strong> Minimum 6 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
                        </div>

                        <button 
                          type="submit" 
                          className="btn btn-primary w-100 fw-bold py-2 mt-1" 
                          style={{ borderRadius: '10px', fontSize: '0.85rem' }} 
                          disabled={passwordSaving}
                        >
                          {passwordSaving ? 'Updating Password...' : 'Update Password'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notification Settings (SMTP Only) */}
            {activeTab === 'notifications' && (
              <div className="fade show active">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">Notification Settings (SMTP Only)</h5>
                    <p className="text-muted small mb-0">Configure enterprise SMTP server parameters, manage recipient email addresses, set event notification rules, and monitor email delivery logs.</p>
                  </div>
                </div>

                {/* Section 1: SMTP Server Configuration */}
                <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '14px', background: 'var(--dg-white)' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <div className="summary-icon-wrapper icon-blue" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                        <FaKey />
                      </div>
                      <div>
                        <h6 className="fw-bold text-dark mb-0">SMTP Server Configuration</h6>
                        <small className="text-muted">Configure your corporate outgoing mail server (Office 365, Gmail, custom SMTP).</small>
                      </div>
                    </div>

                    {smtpMessage.text && (
                      <div className={`alert alert-${smtpMessage.type} py-2.5 mb-3 small d-flex align-items-center`} style={{ borderRadius: '10px' }}>
                        <span className="fw-semibold">{smtpMessage.text}</span>
                      </div>
                    )}

                    {smtpLoading ? (
                      <div className="py-4 text-center">
                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                      </div>
                    ) : (
                      <form onSubmit={handleSaveSmtpConfig}>
                        <div className="row g-3 mb-3">
                          <div className="col-12 col-md-8">
                            <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>SMTP Host Server <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. smtp.office365.com or smtp.gmail.com"
                              value={smtpConfig.host}
                              onChange={e => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-12 col-md-4">
                            <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Port <span className="text-danger">*</span></label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="587"
                              value={smtpConfig.port}
                              onChange={e => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-12 col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>SMTP Username / Email</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="alerts@company.com"
                              value={smtpConfig.username}
                              onChange={e => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                            />
                          </div>
                          <div className="col-12 col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                              SMTP Password {smtpConfig.isPasswordSet && <span className="badge bg-success bg-opacity-10 text-success ms-2">Encrypted & Stored</span>}
                            </label>
                            <div className="input-group">
                              <input
                                type={showSmtpPassword ? 'text' : 'password'}
                                className="form-control"
                                placeholder={smtpConfig.isPasswordSet ? '•••••••••••• (Leave blank to keep unchanged)' : 'Enter SMTP password'}
                                value={smtpConfig.password}
                                onChange={e => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                              >
                                {showSmtpPassword ? 'Hide' : 'Show'}
                              </button>
                            </div>
                          </div>
                          <div className="col-12 col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>From Email Address <span className="text-danger">*</span></label>
                            <input
                              type="email"
                              className="form-control"
                              placeholder="alerts@company.com"
                              value={smtpConfig.from_email}
                              onChange={e => setSmtpConfig({ ...smtpConfig, from_email: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-12 col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>From Display Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="DeskGuard Monitoring System"
                              value={smtpConfig.from_name}
                              onChange={e => setSmtpConfig({ ...smtpConfig, from_name: e.target.value })}
                            />
                          </div>
                          <div className="col-12 col-md-4">
                            <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Encryption Protocol</label>
                            <select
                              className="form-select"
                              value={smtpConfig.encryption_type}
                              onChange={e => setSmtpConfig({ ...smtpConfig, encryption_type: e.target.value, enable_ssl: e.target.value !== 'None' })}
                            >
                              <option value="TLS">STARTTLS (Port 587)</option>
                              <option value="SSL">SSL / TLS (Port 465)</option>
                              <option value="None">None (Unencrypted)</option>
                            </select>
                          </div>
                          <div className="col-12 col-md-4">
                            <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Timeout (Seconds)</label>
                            <input
                              type="number"
                              className="form-control"
                              value={smtpConfig.timeout_seconds}
                              onChange={e => setSmtpConfig({ ...smtpConfig, timeout_seconds: e.target.value })}
                            />
                          </div>
                          <div className="col-12 col-md-4">
                            <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Retry Count</label>
                            <input
                              type="number"
                              className="form-control"
                              value={smtpConfig.retry_count}
                              onChange={e => setSmtpConfig({ ...smtpConfig, retry_count: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            type="submit"
                            className="btn btn-primary fw-bold px-4 py-2"
                            style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                            disabled={smtpSaving}
                          >
                            <FaSave className="me-1.5" />
                            <span>{smtpSaving ? 'Saving SMTP Config...' : 'Save SMTP Configuration'}</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary fw-semibold px-4 py-2"
                            style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                            onClick={handleTestSmtpConnection}
                            disabled={smtpTesting || !smtpConfig.host}
                          >
                            <FaCheckCircle className="me-1.5 text-success" />
                            <span>{smtpTesting ? 'Testing Handshake...' : 'Test SMTP Connection'}</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* Section 2: Email Recipients Manager */}
                <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '14px', background: 'var(--dg-white)' }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="summary-icon-wrapper icon-orange" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                          <FaUser />
                        </div>
                        <div>
                          <h6 className="fw-bold text-dark mb-0">Email Recipients Manager</h6>
                          <small className="text-muted">Manage recipient emails that receive real-time incident dispatches.</small>
                        </div>
                      </div>
                    </div>

                    {notifMessage && (
                      <div className={`alert ${notifSuccess ? 'alert-success' : 'alert-danger'} py-2 mb-3 small`} style={{ borderRadius: '10px' }}>
                        {notifMessage}
                      </div>
                    )}

                    <div className="row g-2 mb-4 p-3 bg-light border" style={{ borderRadius: '12px' }}>
                      <div className="col-12 col-md-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Name (e.g. John Doe)"
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Email (e.g. john@company.com)"
                          value={newEmail}
                          onChange={e => setNewEmail(e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Department (e.g. IT Support)"
                          value={newDepartment}
                          onChange={e => setNewDepartment(e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-2">
                        <button
                          className="btn btn-primary w-100 fw-bold d-flex align-items-center justify-content-center gap-1.5"
                          onClick={handleAddEmail}
                          disabled={!newEmail}
                          style={{ borderRadius: '8px' }}
                        >
                          <FaPlus size={11} /> <span>Add</span>
                        </button>
                      </div>
                    </div>

                    {recipientsLoading ? (
                      <div className="py-3 text-center">
                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th>Status</th>
                              <th>Name</th>
                              <th>Email Address</th>
                              <th>Department</th>
                              <th className="text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recipients.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-4 text-muted">No email recipients configured yet.</td>
                              </tr>
                            ) : (
                              recipients.map(r => (
                                <tr key={r.id}>
                                  <td>
                                    <div className="form-check form-switch mb-0">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        checked={r.is_active}
                                        onChange={() => handleToggleRecipient(r)}
                                        style={{ cursor: 'pointer' }}
                                      />
                                    </div>
                                  </td>
                                  <td className="fw-semibold text-dark">{r.name || '—'}</td>
                                  <td className="fw-mono text-primary">{r.email}</td>
                                  <td className="text-muted">{r.department || 'General'}</td>
                                  <td className="text-end">
                                    <button className="btn btn-link text-danger p-1" onClick={() => handleRemoveRecipient(r.id)}>
                                      <FaTrash size={12} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Notification Event Rules */}
                <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '14px', background: 'var(--dg-white)' }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="summary-icon-wrapper icon-red" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                          <FaBell />
                        </div>
                        <div>
                          <h6 className="fw-bold text-dark mb-0">Notification Event Rules</h6>
                          <small className="text-muted">Select which telemetry alert and security categories generate email notifications.</small>
                        </div>
                      </div>
                      <button
                        className="btn btn-primary btn-sm fw-bold px-3 py-1.5"
                        onClick={handleSaveNotificationRules}
                        disabled={rulesNotifSaving}
                        style={{ borderRadius: '8px' }}
                      >
                        {rulesNotifSaving ? 'Saving Rules...' : 'Save Notification Rules'}
                      </button>
                    </div>

                    {rulesNotifMessage.text && (
                      <div className={`alert alert-${rulesNotifMessage.type} py-2 mb-3 small`} style={{ borderRadius: '10px' }}>
                        {rulesNotifMessage.text}
                      </div>
                    )}

                    {rulesNotifLoading ? (
                      <div className="py-3 text-center">
                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                      </div>
                    ) : (
                      <div className="row g-4">
                        {['Critical Alerts', 'Security Events', 'Change Detection Events'].map(cat => {
                          const catRules = notificationRules.filter(r => r.category === cat);
                          return (
                            <div className="col-12 col-md-4" key={cat}>
                              <div className="p-3 bg-light border" style={{ borderRadius: '12px', height: '100%' }}>
                                <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.85rem' }}>{cat}</h6>
                                <div className="d-flex flex-column gap-2">
                                  {catRules.map(rule => (
                                    <div className="form-check" key={rule.event_type}>
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`rule_${rule.event_type}`}
                                        checked={rule.send_email}
                                        onChange={() => handleToggleRule(rule.event_type)}
                                        style={{ cursor: 'pointer' }}
                                      />
                                      <label className="form-check-label fw-semibold cursor-pointer" htmlFor={`rule_${rule.event_type}`} style={{ fontSize: '0.8rem', color: 'var(--dg-text-primary)' }}>
                                        {rule.display_name}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 4: Email Delivery Logs */}
                <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '14px', background: 'var(--dg-white)' }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="summary-icon-wrapper icon-blue" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                          <FaHistory />
                        </div>
                        <div>
                          <h6 className="fw-bold text-dark mb-0">Email Delivery Audit Logs</h6>
                          <small className="text-muted">Inspect real-time SMTP dispatch status, sent timestamps, and failure error traces.</small>
                        </div>
                      </div>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => fetchEmailLogsList(emailLogsPage)}
                        disabled={emailLogsLoading}
                        style={{ borderRadius: '8px' }}
                      >
                        Refresh Logs
                      </button>
                    </div>

                    {emailLogsLoading ? (
                      <div className="py-4 text-center">
                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.8rem' }}>
                          <thead>
                            <tr>
                              <th>Status</th>
                              <th>Recipient</th>
                              <th>Subject</th>
                              <th>Sent At</th>
                              <th>Retries</th>
                              <th>Details / Error Trace</th>
                            </tr>
                          </thead>
                          <tbody>
                            {emailLogs.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">No email delivery logs recorded yet.</td>
                              </tr>
                            ) : (
                              emailLogs.map(log => (
                                <tr key={log.id}>
                                  <td>
                                    <span className={`badge ${log.status === 'sent' ? 'bg-success' : log.status === 'queued' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                      {log.status}
                                    </span>
                                  </td>
                                  <td className="fw-mono fw-semibold text-dark">{log.recipientEmail}</td>
                                  <td>{log.subject}</td>
                                  <td className="text-muted">{log.sentAt ? new Date(log.sentAt).toLocaleString() : '—'}</td>
                                  <td className="fw-bold">{log.retryCount}</td>
                                  <td className="text-muted text-truncate" style={{ maxWidth: '240px' }}>
                                    {log.failureReason || '250 OK - Sent'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="fade show active">
                <h5 className="fw-bold text-dark mb-4 border-bottom pb-3">General Settings</h5>
                <p className="text-muted small mb-4">These configuration parameters are persisted locally on your web browser cache.</p>
                <div className="row g-4">
                  <div className="col-12 col-lg-6">
                    <label className="form-label">Language Selection</label>
                    <select className="form-select" value={language} onChange={e => setLanguage(e.target.value)}>
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                  <div className="col-12 col-lg-6">
                    <label className="form-label">Date & Time Format</label>
                    <select className="form-select" value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                      <option value="12h">MM/DD/YYYY - 12 Hour (AM/PM)</option>
                      <option value="24h">YYYY-MM-DD - 24 Hour</option>
                    </select>
                  </div>
                  <div className="col-12 col-lg-6">
                    <label className="form-label">Time Zone</label>
                    <select className="form-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
                      <option value="utc">UTC (Universal Coordinated Time)</option>
                      <option value="est">EST (Eastern Standard Time)</option>
                      <option value="pst">PST (Pacific Standard Time)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Alert Thresholds */}
            {activeTab === 'thresholds' && (
              <div className="fade show active">
                <h5 className="fw-bold text-dark mb-4 border-bottom pb-3">Alert Thresholds</h5>
                <div className="text-center py-5">
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎛️</div>
                  <p className="text-muted mb-4 max-width-600 mx-auto" style={{ fontSize: '0.88rem', lineHeight: '1.4' }}>
                    Alert thresholds are dynamically configured through centralized monitoring profiles. 
                    Manage profiles to modify warnings when CPU/RAM usage spikes across host systems.
                  </p>
                  <button className="btn btn-primary px-4 py-2.5 fw-bold" style={{ borderRadius: '10px' }}
                     onClick={() => navigate('/settings/alert-thresholds')}>
                    Manage Alert Profiles
                  </button>
                </div>
              </div>
            )}

            {/* Monitoring Settings */}
            {activeTab === 'monitoring' && (
              <div className="fade show active">
                <h5 className="fw-bold text-dark mb-4 border-bottom pb-3">Monitoring Preferences</h5>
                <p className="text-muted small mb-4">Select system polling periods and global threshold fallbacks.</p>
                <div className="row g-4">
                  <div className="col-12">
                    <label className="form-label">Live Data Refresh Interval</label>
                    <select className="form-select w-50" value={refreshInterval} onChange={e => setRefreshInterval(e.target.value)}>
                      <option value="5">Every 5 Seconds (Real-time)</option>
                      <option value="15">Every 15 Seconds</option>
                      <option value="60">Every 1 Minute</option>
                    </select>
                    <div className="form-text small text-muted mt-1.5">How often the Live charts query server updates.</div>
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">Fallback CPU Limit (%)</label>
                    <input type="number" className="form-control" value={cpuThreshold} onChange={e => setCpuThreshold(Number(e.target.value))} min="50" max="100" />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">Fallback RAM Limit (%)</label>
                    <input type="number" className="form-control" value={ramThreshold} onChange={e => setRamThreshold(Number(e.target.value))} min="50" max="100" />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">Fallback Disk Limit (%)</label>
                    <input type="number" className="form-control" value={diskThreshold} onChange={e => setDiskThreshold(Number(e.target.value))} min="50" max="100" />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Alert Notification Frequency</label>
                    <select className="form-select w-50" value={alertFrequency} onChange={e => setAlertFrequency(e.target.value)}>
                      <option value="immediate">Immediate (On occurrence)</option>
                      <option value="5min">Batch every 5 minutes</option>
                      <option value="hourly">Hourly digest</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="fade show active">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">Security & Access Control</h5>
                    <p className="text-muted small mb-0">Configure authentication policies, idle session timeouts, lockout protection rules, and inspect security audit trails.</p>
                  </div>
                  <button 
                    className="btn btn-primary d-flex align-items-center gap-2 px-3.5 py-2 fw-bold" 
                    onClick={handleSaveSecSettings} 
                    disabled={secSaving}
                    style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                  >
                    <FaSave /> <span>{secSaving ? 'Saving...' : 'Save Security Policy'}</span>
                  </button>
                </div>

                {secMessage.text && (
                  <div className={`alert ${secMessage.type === 'success' ? 'alert-success' : 'alert-danger'} py-2.5 mb-4 small`} style={{ borderRadius: '10px' }}>
                    {secMessage.text}
                  </div>
                )}

                {secLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading security settings...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* SECTION 1: Password Policy */}
                    <div className="card border mb-4 shadow-sm" style={{ borderRadius: '14px' }}>
                      <div className="card-header bg-light py-3 px-4 d-flex align-items-center gap-2 border-bottom">
                        <FaKey className="text-primary" />
                        <h6 className="fw-bold mb-0 text-dark">1. Password Policy & Complexity Requirements</h6>
                      </div>
                      <div className="card-body p-4">
                        <div className="row g-4">
                          <div className="col-12 col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Minimum Password Length</label>
                            <input 
                              type="number" 
                              className="form-control" 
                              value={secSettings.min_password_length} 
                              onChange={e => setSecSettings({ ...secSettings, min_password_length: parseInt(e.target.value) || 6 })} 
                              min="6" 
                              max="64"
                              style={{ borderRadius: '8px' }}
                            />
                            <div className="form-text small text-muted">Enforced during account creation, user registration, and password resets (6 to 64 chars).</div>
                          </div>

                          <div className="col-12 col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Character Complexity Rules</label>
                            <div className="d-flex flex-column gap-2 mt-1">
                              <div className="form-check form-switch">
                                <input 
                                  className="form-check-input" 
                                  type="checkbox" 
                                  id="reqUpper" 
                                  checked={secSettings.require_uppercase} 
                                  onChange={e => setSecSettings({ ...secSettings, require_uppercase: e.target.checked })} 
                                />
                                <label className="form-check-label small fw-semibold cursor-pointer" htmlFor="reqUpper">Require at least one uppercase letter (A-Z)</label>
                              </div>
                              <div className="form-check form-switch">
                                <input 
                                  className="form-check-input" 
                                  type="checkbox" 
                                  id="reqLower" 
                                  checked={secSettings.require_lowercase} 
                                  onChange={e => setSecSettings({ ...secSettings, require_lowercase: e.target.checked })} 
                                />
                                <label className="form-check-label small fw-semibold cursor-pointer" htmlFor="reqLower">Require at least one lowercase letter (a-z)</label>
                              </div>
                              <div className="form-check form-switch">
                                <input 
                                  className="form-check-input" 
                                  type="checkbox" 
                                  id="reqNum" 
                                  checked={secSettings.require_numbers} 
                                  onChange={e => setSecSettings({ ...secSettings, require_numbers: e.target.checked })} 
                                />
                                <label className="form-check-label small fw-semibold cursor-pointer" htmlFor="reqNum">Require at least one numeric digit (0-9)</label>
                              </div>
                              <div className="form-check form-switch">
                                <input 
                                  className="form-check-input" 
                                  type="checkbox" 
                                  id="reqSpec" 
                                  checked={secSettings.require_special_chars} 
                                  onChange={e => setSecSettings({ ...secSettings, require_special_chars: e.target.checked })} 
                                />
                                <label className="form-check-label small fw-semibold cursor-pointer" htmlFor="reqSpec">Require at least one special character (!@#$%^&*)</label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Session Management */}
                    <div className="card border mb-4 shadow-sm" style={{ borderRadius: '14px' }}>
                      <div className="card-header bg-light py-3 px-4 d-flex align-items-center gap-2 border-bottom">
                        <FaClock className="text-primary" />
                        <h6 className="fw-bold mb-0 text-dark">2. Session Management & Idle Timeout</h6>
                      </div>
                      <div className="card-body p-4">
                        <div className="row g-4">
                          <div className="col-12 col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Idle Session Timeout</label>
                            <select 
                              className="form-select" 
                              value={secSettings.idle_session_timeout_minutes} 
                              onChange={e => setSecSettings({ ...secSettings, idle_session_timeout_minutes: parseInt(e.target.value) })}
                              style={{ borderRadius: '8px' }}
                            >
                              <option value={15}>15 Minutes</option>
                              <option value={30}>30 Minutes (Recommended)</option>
                              <option value={60}>1 Hour</option>
                              <option value={120}>2 Hours</option>
                              <option value={0}>Never (Disable Idle Timeout)</option>
                            </select>
                            <div className="form-text small text-muted">Displays warning modal 2 minutes prior to session expiration. Reset by mouse or keyboard activity.</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Login Protection */}
                    <div className="card border mb-4 shadow-sm" style={{ borderRadius: '14px' }}>
                      <div className="card-header bg-light py-3 px-4 d-flex align-items-center gap-2 border-bottom">
                        <FaLock className="text-primary" />
                        <h6 className="fw-bold mb-0 text-dark">3. Login Protection & Failed Attempt Lockout</h6>
                      </div>
                      <div className="card-body p-4">
                        <div className="row g-4">
                          <div className="col-12 col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Maximum Failed Login Attempts</label>
                            <select 
                              className="form-select" 
                              value={secSettings.max_failed_login_attempts} 
                              onChange={e => setSecSettings({ ...secSettings, max_failed_login_attempts: parseInt(e.target.value) })}
                              style={{ borderRadius: '8px' }}
                            >
                              <option value={3}>3 Failed Attempts</option>
                              <option value={5}>5 Failed Attempts (Standard)</option>
                              <option value={10}>10 Failed Attempts</option>
                              <option value={0}>Unlimited (Disable Lockout)</option>
                            </select>
                            <div className="form-text small text-muted">Consecutive failed login attempts before temporarily locking user account access.</div>
                          </div>

                          <div className="col-12 col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Account Lock Duration</label>
                            <select 
                              className="form-select" 
                              value={secSettings.account_lockout_duration_minutes} 
                              onChange={e => setSecSettings({ ...secSettings, account_lockout_duration_minutes: parseInt(e.target.value) })}
                              style={{ borderRadius: '8px' }}
                            >
                              <option value={15}>15 Minutes</option>
                              <option value={30}>30 Minutes</option>
                              <option value={60}>60 Minutes</option>
                            </select>
                            <div className="form-text small text-muted">Duration in minutes for which account login remains blocked after threshold is reached.</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: Security Audit Logs */}
                    <div className="card border mb-4 shadow-sm" style={{ borderRadius: '14px' }}>
                      <div className="card-header bg-light py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
                        <div className="d-flex align-items-center gap-2">
                          <FaShieldAlt className="text-primary" />
                          <h6 className="fw-bold mb-0 text-dark">4. Security Audit Logs</h6>
                        </div>
                        <div className="position-relative" style={{ width: '220px' }}>
                          <input 
                            type="text" 
                            className="form-control form-control-sm ps-4" 
                            placeholder="Search audit logs..." 
                            value={auditLogsSearch} 
                            onChange={e => {
                              setAuditLogsSearch(e.target.value);
                              fetchSecurityAuditLogsList(1, e.target.value);
                            }} 
                            style={{ borderRadius: '8px' }}
                          />
                          <FaSearch className="position-absolute text-muted" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem' }} />
                        </div>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.82rem' }}>
                            <thead className="bg-light">
                              <tr className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th className="px-4 py-2.5">Timestamp</th>
                                <th className="px-3 py-2.5">Event Action</th>
                                <th className="px-3 py-2.5">Performed By</th>
                                <th className="px-3 py-2.5">Target / Description</th>
                                <th className="px-3 py-2.5">IP Address</th>
                              </tr>
                            </thead>
                            <tbody>
                              {auditLogsLoading ? (
                                <tr>
                                  <td colSpan="5" className="text-center py-4">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                  </td>
                                </tr>
                              ) : auditLogs.length === 0 ? (
                                <tr>
                                  <td colSpan="5" className="text-center py-4 text-muted">No security audit logs found.</td>
                                </tr>
                              ) : (
                                auditLogs.map(log => (
                                  <tr key={log.id}>
                                    <td className="px-4 py-2.5 text-muted">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="px-3 py-2.5">
                                      <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-2 py-1" style={{ fontSize: '0.72rem' }}>
                                        {log.event_type}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5 fw-semibold text-dark">{log.performed_by}</td>
                                    <td className="px-3 py-2.5 text-muted" style={{ maxWidth: '300px' }}>{log.description || '-'}</td>
                                    <td className="px-3 py-2.5 text-muted">{log.ip_address || '127.0.0.1'}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                        {auditLogsTotalPages > 1 && (
                          <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                            <small className="text-muted">Page {auditLogsPage} of {auditLogsTotalPages}</small>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-secondary" disabled={auditLogsPage <= 1} onClick={() => fetchSecurityAuditLogsList(auditLogsPage - 1, auditLogsSearch)}>Prev</button>
                              <button className="btn btn-outline-secondary" disabled={auditLogsPage >= auditLogsTotalPages} onClick={() => fetchSecurityAuditLogsList(auditLogsPage + 1, auditLogsSearch)}>Next</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 5: Login History */}
                    <div className="card border mb-4 shadow-sm" style={{ borderRadius: '14px' }}>
                      <div className="card-header bg-light py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
                        <div className="d-flex align-items-center gap-2">
                          <FaHistory className="text-primary" />
                          <h6 className="fw-bold mb-0 text-dark">5. Web Administrator Login History</h6>
                        </div>
                        <div className="d-flex gap-2">
                          <select 
                            className="form-select form-select-sm" 
                            value={loginHistoryStatus} 
                            onChange={e => {
                              setLoginHistoryStatus(e.target.value);
                              fetchLoginHistoryList(1, loginHistorySearch, e.target.value);
                            }}
                            style={{ width: '130px', borderRadius: '8px' }}
                          >
                            <option value="all">All Statuses</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                          </select>
                          <div className="position-relative" style={{ width: '200px' }}>
                            <input 
                              type="text" 
                              className="form-control form-control-sm ps-4" 
                              placeholder="Search history..." 
                              value={loginHistorySearch} 
                              onChange={e => {
                                setLoginHistorySearch(e.target.value);
                                fetchLoginHistoryList(1, e.target.value, loginHistoryStatus);
                              }} 
                              style={{ borderRadius: '8px' }}
                            />
                            <FaSearch className="position-absolute text-muted" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem' }} />
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.82rem' }}>
                            <thead className="bg-light">
                              <tr className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th className="px-4 py-2.5">User Email</th>
                                <th className="px-3 py-2.5">Login Time</th>
                                <th className="px-3 py-2.5">Browser & OS</th>
                                <th className="px-3 py-2.5">IP Address</th>
                                <th className="px-3 py-2.5">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loginHistoryLoading ? (
                                <tr>
                                  <td colSpan="5" className="text-center py-4">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                  </td>
                                </tr>
                              ) : loginHistory.length === 0 ? (
                                <tr>
                                  <td colSpan="5" className="text-center py-4 text-muted">No login history records found.</td>
                                </tr>
                              ) : (
                                loginHistory.map(item => (
                                  <tr key={item.id}>
                                    <td className="px-4 py-2.5 fw-semibold text-dark">{item.email}</td>
                                    <td className="px-3 py-2.5 text-muted">{new Date(item.login_time).toLocaleString()}</td>
                                    <td className="px-3 py-2.5 text-muted">
                                      {item.browser || 'Browser'} on {item.operating_system || 'OS'}
                                    </td>
                                    <td className="px-3 py-2.5 text-muted">{item.ip_address || '127.0.0.1'}</td>
                                    <td className="px-3 py-2.5">
                                      {item.status === 'Success' ? (
                                        <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1" style={{ fontSize: '0.72rem' }}>
                                          <FaCheckCircle className="me-1" /> Success
                                        </span>
                                      ) : (
                                        <span className="badge bg-danger bg-opacity-10 text-danger fw-bold px-2 py-1" style={{ fontSize: '0.72rem' }}>
                                          <FaTimesCircle className="me-1" /> {item.failure_reason || 'Failed'}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                        {loginHistoryTotalPages > 1 && (
                          <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                            <small className="text-muted">Page {loginHistoryPage} of {loginHistoryTotalPages}</small>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-secondary" disabled={loginHistoryPage <= 1} onClick={() => fetchLoginHistoryList(loginHistoryPage - 1, loginHistorySearch, loginHistoryStatus)}>Prev</button>
                              <button className="btn btn-outline-secondary" disabled={loginHistoryPage >= loginHistoryTotalPages} onClick={() => fetchLoginHistoryList(loginHistoryPage + 1, loginHistorySearch, loginHistoryStatus)}>Next</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
  );
};

export default Settings;
