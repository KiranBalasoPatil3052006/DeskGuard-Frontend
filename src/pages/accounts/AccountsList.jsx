import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff, FaSearch, FaTimes, FaSave, FaSpinner, FaKey, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { getAccounts, createAccount, updateAccount, resetAccountPassword, deleteAccount, disableAccount, enableAccount, generateEmployeeId } from '../../services/accounts';

const AccountsList = () => {
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    password: '',
    confirm_password: '',
    employee_id: '',
    role: 'Admin',
    status: 'active'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetForm, setResetForm] = useState({ new_password: '', confirm_password: '', must_change_password: true });
  const [resetting, setResetting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder
      };
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await getAccounts(params);
      const d = res.data || res;
      setAccounts(d.data || []);
      setTotal(d.total || 0);
      setTotalPages(d.total_pages || 0);
    } catch (err) {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, roleFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  useEffect(() => {
    if (!isEditing && showFormModal) {
      generateEmployeeId().then(res => {
        const d = res.data || res;
        setForm(prev => ({ ...prev, employee_id: d.employee_id || '' }));
      }).catch(() => {});
    }
  }, [isEditing, showFormModal]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResetFormChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setResetForm({ ...resetForm, [e.target.name]: value });
  };

  const clearForm = () => {
    setForm({
      full_name: '',
      email: '',
      mobile_number: '',
      password: '',
      confirm_password: '',
      employee_id: '',
      role: 'Admin',
      status: 'active'
    });
    setIsEditing(false);
    setEditingId(null);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (isEditing && editingId) {
        const payload = {
          full_name: form.full_name,
          email: form.email,
          mobile_number: form.mobile_number,
          employee_id: form.employee_id,
          role: form.role,
          status: form.status
        };
        await updateAccount(editingId, payload);
        setMessage({ type: 'success', text: 'Account updated successfully.' });
      } else {
        await createAccount(form);
        setMessage({ type: 'success', text: 'Account created successfully.' });
      }
      clearForm();
      setShowFormModal(false);
      if (page !== 1) setPage(1); else fetchAccounts();
    } catch (err) {
      const errData = err?.errors || err?.data?.errors || {};
      const firstKey = Object.keys(errData)[0];
      setMessage({ type: 'danger', text: firstKey ? `${errData[firstKey]?.join(', ') || err.message || 'Validation failed.'}` : (err?.message || 'Failed to save account.') });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (account) => {
    setIsEditing(true);
    setEditingId(account.id);
    setForm({
      full_name: account.full_name || '',
      email: account.email || '',
      mobile_number: account.mobile_number || '',
      password: '',
      confirm_password: '',
      employee_id: account.employee_id || '',
      role: account.role || 'Admin',
      status: account.is_active ? 'active' : 'disabled'
    });
    setShowFormModal(true);
  };

  const handleView = (account) => {
    setViewTarget(account);
    setShowViewModal(true);
  };

  const handleResetPasswordClick = (account) => {
    setResetTarget(account);
    setResetForm({ new_password: '', confirm_password: '', must_change_password: true });
    setShowResetPasswordModal(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetting(true);
    try {
      await resetAccountPassword(resetTarget.id, resetForm);
      setShowResetPasswordModal(false);
      setResetTarget(null);
      setMessage({ type: 'success', text: `Password for ${resetTarget.full_name} reset successfully.` });
    } catch (err) {
      setMessage({ type: 'danger', text: err?.message || 'Failed to reset password.' });
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteClick = (account) => {
    setDeleteTarget(account);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAccount(deleteTarget.id);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setMessage({ type: 'success', text: 'Account deleted successfully.' });
      fetchAccounts();
    } catch (err) {
      setMessage({ type: 'danger', text: err?.message || 'Failed to delete account.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (account) => {
    try {
      if (account.is_active) {
        await disableAccount(account.id);
        setMessage({ type: 'info', text: `Account for ${account.full_name} disabled.` });
      } else {
        await enableAccount(account.id);
        setMessage({ type: 'success', text: `Account for ${account.full_name} enabled.` });
      }
      fetchAccounts();
    } catch (err) {
      setMessage({ type: 'danger', text: err?.message || 'Failed to change account status.' });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleSearchClear = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const renderSortIcon = (column) => {
    if (sortBy !== column) return <FaSort className="ms-1 text-muted opacity-50" size={10} />;
    return sortOrder === 'asc' ? <FaSortUp className="ms-1 text-primary" size={10} /> : <FaSortDown className="ms-1 text-primary" size={10} />;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Account Management</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--dg-text-muted)', margin: 0 }}>Create administrator accounts, manage system roles, configure credentials, and inspect logs.</p>
        </div>
        <div>
          <button 
            className="btn btn-primary d-flex align-items-center gap-2" 
            onClick={() => { clearForm(); setShowFormModal(true); }}
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            <FaUserPlus size={12} />
            <span>Create Account</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type} alert-dismissible fade show d-flex align-items-center mb-4`} role="alert">
          <span className="flex-grow-1 fw-semibold small">{message.text}</span>
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}

      {/* Main Accounts Card */}
      <div className="card mb-4">
        <div className="card-body border-bottom border-light">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center">
              <span>Registered Accounts</span>
              <span className="badge bg-primary bg-opacity-10 text-primary ms-2" style={{ fontSize: '0.75rem' }}>{total} Total</span>
            </h6>

            <div className="d-flex gap-2 flex-wrap align-items-center">
              {/* Search */}
              <form onSubmit={handleSearch} className="position-relative" style={{ minWidth: '220px' }}>
                <FaSearch className="position-absolute text-muted" style={{ top: '50%', left: '12px', transform: 'translateY(-50%)', fontSize: '0.82rem' }} />
                <input 
                  type="text" 
                  className="form-control form-control-sm" 
                  placeholder="Search ID, name, email..." 
                  value={searchInput} 
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
                {search && (
                  <button className="btn btn-link position-absolute text-muted p-0 border-0" type="button" onClick={handleSearchClear} style={{ right: '8px', top: '50%', transform: 'translateY(-50%)' }}><FaTimes size={11} /></button>
                )}
              </form>

              {/* Role Select Filter */}
              <select 
                className="form-select form-select-sm" 
                value={roleFilter} 
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                style={{ width: '130px' }}
              >
                <option value="all">All Roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Technician">Technician</option>
              </select>

              {/* Status Select Filter */}
              <select 
                className="form-select form-select-sm" 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                style={{ width: '120px' }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>

              {/* Items Per Page Picker */}
              <select 
                className="form-select form-select-sm" 
                value={perPage} 
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                style={{ width: '100px' }}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><FaSpinner className="text-primary fa-spin" size={32} /></div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FaUserPlus size={44} className="mb-3 text-muted opacity-50" />
              <h6 className="fw-bold text-dark">No Accounts Found</h6>
              {search || roleFilter !== 'all' || statusFilter !== 'all' ? (
                <p className="small mb-0">Adjust your search parameters or drop filters.</p>
              ) : (
                <p className="small mb-0">Use the Create Account button to register administrators.</p>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                  <tr className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F1F5F9' }}>
                    <th className="ps-4 pb-3 border-0 cursor-pointer" onClick={() => handleSort('employee_id')}>
                      Employee ID {renderSortIcon('employee_id')}
                    </th>
                    <th className="pb-3 border-0 cursor-pointer" onClick={() => handleSort('full_name')}>
                      Full Name {renderSortIcon('full_name')}
                    </th>
                    <th className="pb-3 border-0 cursor-pointer" onClick={() => handleSort('email')}>
                      Email & Contact {renderSortIcon('email')}
                    </th>
                    <th className="pb-3 border-0">Role</th>
                    <th className="pb-3 border-0 cursor-pointer" onClick={() => handleSort('status')}>
                      Status {renderSortIcon('status')}
                    </th>
                    <th className="pb-3 border-0 cursor-pointer" onClick={() => handleSort('last_login')}>
                      Last Login {renderSortIcon('last_login')}
                    </th>
                    <th className="pe-4 pb-3 border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(acc => (
                    <tr key={acc.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td className="ps-4 py-3">
                        <code style={{ fontSize: '0.8rem', color: '#6366F1' }}>{acc.employee_id || '—'}</code>
                      </td>
                      <td className="py-3 font-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                        {acc.full_name}
                      </td>
                      <td className="py-3" style={{ fontSize: '0.85rem' }}>
                        <div className="text-dark font-medium">{acc.email}</div>
                        {acc.mobile_number && (
                          <div className="text-muted small mt-0.5" style={{ fontSize: '0.75rem' }}>📱 {acc.mobile_number}</div>
                        )}
                      </td>
                      <td className="py-3">
                        <span 
                          className="badge px-2.5 py-1 fw-bold" 
                          style={{ 
                            fontSize: '0.7rem', 
                            backgroundColor: 
                              acc.role === 'Super Admin' ? '#FEE2E2' : 
                              acc.role === 'Admin' ? '#E0E7FF' : 
                              acc.role === 'Manager' ? '#FEF3C7' : '#F1F5F9', 
                            color: 
                              acc.role === 'Super Admin' ? '#EF4444' : 
                              acc.role === 'Admin' ? '#4F46E5' : 
                              acc.role === 'Manager' ? '#D97706' : '#475569', 
                            borderRadius: '6px' 
                          }}
                        >
                          {acc.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-1.5">
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: acc.is_active ? '#10B981' : '#64748B' }} />
                          <span 
                            className="fw-bold" 
                            style={{ 
                              fontSize: '0.75rem',
                              color: acc.is_active ? '#10B981' : '#64748B'
                            }}
                          >
                            {acc.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-muted" style={{ fontSize: '0.78rem' }}>
                        {formatDateTime(acc.last_login)}
                      </td>
                      <td className="pe-4 py-3 text-end">
                        <div className="d-flex gap-1.5 justify-content-end">
                          <button 
                            className="action-btn" 
                            title="View details" 
                            onClick={() => handleView(acc)}
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="action-btn" 
                            title="Edit profile" 
                            onClick={() => handleEdit(acc)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="action-btn" 
                            title="Reset Password" 
                            onClick={() => handleResetPasswordClick(acc)}
                          >
                            <FaKey />
                          </button>
                          <button 
                            className="action-btn" 
                            title={acc.is_active ? 'Disable account' : 'Enable account'} 
                            onClick={() => handleToggleStatus(acc)}
                          >
                            {acc.is_active ? <FaToggleOff /> : <FaToggleOn />}
                          </button>
                          <button 
                            className="action-btn danger" 
                            title="Delete account" 
                            onClick={() => handleDeleteClick(acc)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="card-footer bg-transparent border-top border-light d-flex flex-column flex-sm-row justify-content-between align-items-center py-3 gap-2">
            <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} accounts
            </span>
            <div className="dg-pagination">
              <button 
                className="page-btn"
                disabled={page <= 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button 
                  key={p} 
                  className={`page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button 
                className="page-btn"
                disabled={page >= totalPages} 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Dialog Modal (Create / Edit Form) */}
      {showFormModal && (
        <div className="modal d-block" onClick={() => { setShowFormModal(false); clearForm(); }}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditing ? 'Edit Account Details' : 'Create New Account'}</h5>
                <button type="button" className="btn-close" onClick={() => { setShowFormModal(false); clearForm(); }} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="d-flex flex-column gap-3">
                    <div>
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Full Name <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="full_name" value={form.full_name} onChange={handleFormChange} placeholder="e.g. John Doe" required />
                    </div>
                    <div>
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Email Address <span className="text-danger">*</span></label>
                      <input type="email" className="form-control" name="email" value={form.email} onChange={handleFormChange} placeholder="e.g. john.doe@deskguard.com" required />
                    </div>
                    <div>
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Mobile Number</label>
                      <input type="text" className="form-control" name="mobile_number" value={form.mobile_number} onChange={handleFormChange} placeholder="e.g. +919876543210" />
                    </div>

                    {!isEditing && (
                      <>
                        <div>
                          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Password <span className="text-danger">*</span></label>
                          <input type="password" className="form-control" name="password" value={form.password} onChange={handleFormChange} placeholder="Min. 6 characters" required={!isEditing} minLength={6} />
                        </div>
                        <div>
                          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Confirm Password <span className="text-danger">*</span></label>
                          <input type="password" className="form-control" name="confirm_password" value={form.confirm_password} onChange={handleFormChange} placeholder="Confirm password" required={!isEditing} />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Employee ID <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <input type="text" className="form-control" name="employee_id" value={form.employee_id} onChange={handleFormChange} placeholder="EMP-000001" required />
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary d-flex align-items-center justify-content-center" 
                          onClick={() => generateEmployeeId().then(res => { const d = res.data || res; setForm(prev => ({ ...prev, employee_id: d.employee_id || '' })); })} 
                          title="Auto-Generate Sequential ID"
                        >
                          <FaSpinner className={saving ? 'spin-icon' : ''} />
                        </button>
                      </div>
                      <div className="form-text small text-muted mt-1" style={{ fontSize: '0.72rem' }}>Sequential zero-padded format (e.g. EMP-000001). Editable before saving.</div>
                    </div>

                    <div>
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Account Role <span className="text-danger">*</span></label>
                      <select className="form-select" name="role" value={form.role} onChange={handleFormChange} required>
                        <option value="Super Admin">Super Admin</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Technician">Technician</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Account Status</label>
                      <select className="form-select" name="status" value={form.status} onChange={handleFormChange}>
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowFormModal(false); clearForm(); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary d-flex align-items-center gap-1.5" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && resetTarget && (
        <div className="modal d-block" onClick={() => !resetting && setShowResetPasswordModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reset Account Password</h5>
                <button type="button" className="btn-close" onClick={() => setShowResetPasswordModal(false)} disabled={resetting} />
              </div>
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="modal-body">
                  <p className="small text-muted mb-3">
                    Resetting password for <strong>{resetTarget.full_name}</strong> ({resetTarget.employee_id || resetTarget.email}).
                  </p>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>New Password <span className="text-danger">*</span></label>
                    <input 
                      type="password" 
                      className="form-control" 
                      name="new_password" 
                      value={resetForm.new_password} 
                      onChange={handleResetFormChange} 
                      placeholder="Min 6 characters" 
                      required 
                      minLength={6} 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Confirm Password <span className="text-danger">*</span></label>
                    <input 
                      type="password" 
                      className="form-control" 
                      name="confirm_password" 
                      value={resetForm.confirm_password} 
                      onChange={handleResetFormChange} 
                      placeholder="Confirm new password" 
                      required 
                    />
                  </div>

                  <div className="form-check mb-2">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      id="mustChangePassCheck" 
                      name="must_change_password" 
                      checked={resetForm.must_change_password} 
                      onChange={handleResetFormChange} 
                    />
                    <label className="form-check-label small text-muted" htmlFor="mustChangePassCheck">
                      Enforce password change on user's next login
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowResetPasswordModal(false)} disabled={resetting}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={resetting}>
                    {resetting ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal Overlay */}
      {showViewModal && viewTarget && (
        <div className="modal d-block" onClick={() => setShowViewModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Account Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)} />
              </div>
              <div className="modal-body">
                <div className="d-flex flex-column gap-3">
                  {[
                    { label: 'Employee ID', value: <code className="font-mono text-primary fw-bold" style={{ fontSize: '0.8rem' }}>{viewTarget.employee_id || '—'}</code> },
                    { label: 'Full Name', value: viewTarget.full_name },
                    { label: 'Email Address', value: viewTarget.email },
                    { label: 'Mobile Number', value: viewTarget.mobile_number || '—' },
                    { label: 'Account Role', value: <span className="badge bg-primary bg-opacity-10 text-primary fw-bold" style={{ fontSize: '0.7rem' }}>{viewTarget.role}</span> },
                    { label: 'Status', value: <span className={`badge ${viewTarget.is_active ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary'} fw-bold`} style={{ fontSize: '0.7rem' }}>{viewTarget.is_active ? 'Active' : 'Disabled'}</span> },
                    { label: 'Created At', value: formatDateTime(viewTarget.created_at) },
                    { label: 'Last Login', value: formatDateTime(viewTarget.last_login) },
                    { label: 'Created By', value: viewTarget.created_by || 'System Admin' },
                  ].map((row, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center py-1" style={{ borderBottom: idx < 8 ? '1px solid var(--dg-border-light)' : 'none' }}>
                      <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500 }}>{row.label}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dg-text-primary)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary w-100" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteModal && deleteTarget && (
        <div className="modal d-block" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Account</h5>
                <button type="button" className="btn-close" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} disabled={deleting} />
              </div>
              <div className="modal-body text-center py-4">
                <FaTrash size={32} className="text-danger mb-3" />
                <h6 className="fw-bold mb-2">Delete this user account?</h6>
                <p className="text-muted small mb-0 px-2">
                  Are you sure you want to soft-delete the account for <strong>{deleteTarget.full_name}</strong> ({deleteTarget.employee_id || deleteTarget.email})?
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} disabled={deleting}>Cancel</button>
                <button type="button" className="btn btn-danger" disabled={deleting} onClick={handleDeleteConfirm}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsList;
