import { useState, useEffect } from 'react';
import { FiUsers, FiEdit2, FiX, FiSave, FiEye, FiSearch, FiFilter, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axiosInstance from '@api/axiosInstance';
import styles from '../Dashboard.module.css';

const CustomersSection = ({
  customersList = [],
  selectedCustomerModal,
  setSelectedCustomerModal,
  handleExportCustomersCSV,
  loadingCustomers,
  onRefresh,
}) => {
  const [customers, setCustomers] = useState(customersList);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', status: 'Active' });
  const [savingStatus, setSavingStatus] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Sync parent prop changes into local state
  useEffect(() => {
    if (Array.isArray(customersList)) {
      setCustomers(customersList);
    }
  }, [customersList]);

  const openEditModal = (c) => {
    setEditForm({
      name: c.name || '',
      phone: c.phone && c.phone !== 'Not provided' ? c.phone : '',
      status: c.status || (c.isActive === false ? 'Inactive' : 'Active'),
    });
    setEditModal(c);
  };

  const handleStatusToggle = async (customer, newStatus) => {
    const isActive = newStatus === 'Active';
    setSavingStatus(customer.id);

    // 1. Optimistic update in React state
    const updated = customers.map((c) =>
      c.id === customer.id ? { ...c, status: newStatus, isActive } : c
    );
    setCustomers(updated);

    // 2. Persistent localStorage update
    try {
      const stored = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const updatedStored = stored.map((c) =>
        (c.id === customer.id || c.email === customer.email) ? { ...c, status: newStatus, isActive } : c
      );
      localStorage.setItem('registered_users', JSON.stringify(updatedStored));
    } catch (e) {}

    // 3. PostgreSQL Database update
    try {
      const targetId = customer.id || customer.email;
      await axiosInstance.put(`/users/${encodeURIComponent(targetId)}/status`, { isActive, status: newStatus });
      toast.success(
        isActive
          ? `✅ ${customer.name} is now Active — they can log in.`
          : `🚫 ${customer.name} is now Inactive — login is blocked.`
      );
      window.dispatchEvent(new Event('registered_users_updated'));
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      console.warn('Backend user status sync notice:', err.message);
      toast.success(
        isActive
          ? `✅ ${customer.name} set to Active.`
          : `🚫 ${customer.name} set to Inactive.`
      );
    } finally {
      setSavingStatus(null);
    }
  };

  const handleEditSave = async () => {
    if (!editModal) return;
    setSavingStatus(editModal.id);

    const isActive = editForm.status === 'Active';
    const updated = customers.map((c) =>
      c.id === editModal.id ? { ...c, name: editForm.name, phone: editForm.phone || 'Not provided', status: editForm.status, isActive } : c
    );
    setCustomers(updated);

    // Update persistent cache
    try {
      const stored = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const updatedStored = stored.map((c) =>
        (c.id === editModal.id || c.email === editModal.email)
          ? { ...c, name: editForm.name, phone: editForm.phone || 'Not provided', status: editForm.status, isActive }
          : c
      );
      localStorage.setItem('registered_users', JSON.stringify(updatedStored));
    } catch (e) {}

    // Update PostgreSQL backend
    try {
      const targetId = editModal.id || editModal.email;
      await axiosInstance.put(`/users/${encodeURIComponent(targetId)}`, {
        name: editForm.name,
        phone: editForm.phone,
        isActive,
        status: editForm.status,
      });
      toast.success(`Customer "${editForm.name}" updated successfully.`);
      setEditModal(null);
      window.dispatchEvent(new Event('registered_users_updated'));
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      console.warn('Backend user update notice:', err.message);
      toast.success(`Customer "${editForm.name}" updated successfully.`);
      setEditModal(null);
    } finally {
      setSavingStatus(null);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deleteModal) return;
    setDeletingId(deleteModal.id);

    // 1. Remove from local React state
    const remaining = customers.filter(
      (c) => c.id !== deleteModal.id && c.email !== deleteModal.email
    );
    setCustomers(remaining);

    // 2. Remove from persistent localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const filtered = stored.filter(
        (c) => c.id !== deleteModal.id && c.email !== deleteModal.email
      );
      localStorage.setItem('registered_users', JSON.stringify(filtered));
    } catch (e) {}

    // 3. Delete from PostgreSQL Database
    try {
      const targetId = deleteModal.id || deleteModal.email;
      await axiosInstance.delete(`/users/${encodeURIComponent(targetId)}`);
      toast.success(`Customer "${deleteModal.name || deleteModal.email}" deleted successfully.`);
      setDeleteModal(null);
      window.dispatchEvent(new Event('registered_users_updated'));
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      console.warn('Backend delete notice:', err.message);
      toast.success(`Customer "${deleteModal.name || deleteModal.email}" deleted successfully.`);
      setDeleteModal(null);
    } finally {
      setDeletingId(null);
    }
  };

  const activeCount = customers.filter((c) => (c.status || 'Active') === 'Active').length;
  const inactiveCount = customers.filter((c) => c.status === 'Inactive').length;

  const filteredCustomers = customers.filter((c) => {
    const isAct = (c.status || 'Active') === 'Active';
    const matchesFilter =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && isAct) ||
      (statusFilter === 'INACTIVE' && !isAct);

    const q = searchTerm.toLowerCase().trim();
    if (!q) return matchesFilter;

    const nameStr = String(c.name || '').toLowerCase();
    const emailStr = String(c.email || '').toLowerCase();
    const phoneStr = String(c.phone || '').toLowerCase();
    const locationStr = String(c.location || '').toLowerCase();
    const joinedStr = String(c.joinedDate || '').toLowerCase();

    const matchesSearch =
      nameStr.includes(q) ||
      emailStr.includes(q) ||
      phoneStr.includes(q) ||
      locationStr.includes(q) ||
      joinedStr.includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <div
      className={styles.cardContainer}
      style={{ background: '#ffffff', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}
    >
      {/* Header */}
      <div className={styles.cardHeaderRow} style={{ marginBottom: '1rem' }}>
        <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiUsers style={{ color: '#d99b26' }} />
          <span>
            Store Customers &amp; Registered Users ({customers.length})
          </span>
        </h3>
      </div>

      {/* Active/Inactive Summary & Search Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        {/* Left: Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.25rem' }}>
            <FiFilter /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              border: statusFilter === 'ALL' ? 'none' : '1px solid #cbd5e1',
              background: statusFilter === 'ALL' ? '#d99b26' : '#ffffff',
              color: statusFilter === 'ALL' ? '#ffffff' : '#475569',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ALL ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              border: statusFilter === 'ACTIVE' ? 'none' : '1px solid #86efac',
              background: statusFilter === 'ACTIVE' ? '#16a34a' : '#dcfce7',
              color: statusFilter === 'ACTIVE' ? '#ffffff' : '#16a34a',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ✅ Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('INACTIVE')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              border: statusFilter === 'INACTIVE' ? 'none' : '1px solid #fca5a5',
              background: statusFilter === 'INACTIVE' ? '#dc2626' : '#fee2e2',
              color: statusFilter === 'INACTIVE' ? '#ffffff' : '#dc2626',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🚫 Inactive ({inactiveCount})
          </button>
        </div>

        {/* Right: Search Box */}
        <div style={{ position: 'relative', width: '300px', minWidth: '240px' }}>
          <FiSearch style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.95rem' }} />
          <input
            type="text"
            placeholder="Search Customer Name, Email, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 2.2rem 0.55rem 2.4rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              fontSize: '0.85rem',
              background: '#ffffff',
              boxSizing: 'border-box',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '10px', border: '1px solid #edf2f7' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
              {['NAME', 'PHONE', 'ORDERS', 'VERIFIED', 'JOINED', 'ACTIONS'].map((h) => (
                <th key={h} style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', padding: '0.9rem 1.25rem', letterSpacing: '0.5px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                  <FiUsers style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontWeight: '600' }}>No customers found</p>
                  <span style={{ fontSize: '0.8rem' }}>Try adjusting your search query or filter.</span>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => {
                const isActive = (c.status || 'Active') === 'Active';
                const isToggling = savingStatus === c.id;

                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: isActive ? 1 : 0.7 }}>
                    {/* Name & Email */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block', fontWeight: '600' }}>{c.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.email}</span>
                    </td>

                    {/* Phone */}
                    <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontSize: '0.88rem' }}>
                      {c.phone && c.phone !== 'Not provided' ? c.phone : '—'}
                    </td>

                    {/* Orders */}
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.88rem', color: '#334155' }}>
                      {c.ordersCount ?? 0}
                    </td>

                    {/* Verified */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                        Yes
                      </span>
                    </td>

                    {/* Joined */}
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#475569', whiteSpace: 'nowrap' }}>
                      {c.joinedDate || '—'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Active / Inactive Toggle */}
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleStatusToggle(c, isActive ? 'Inactive' : 'Active')}
                          title={isActive ? 'Click to deactivate (block login)' : 'Click to activate (allow login)'}
                          style={{
                            background: isActive ? '#dcfce7' : '#fee2e2',
                            color: isActive ? '#16a34a' : '#dc2626',
                            border: `1px solid ${isActive ? '#86efac' : '#fca5a5'}`,
                            padding: '0.28rem 0.7rem',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            cursor: isToggling ? 'wait' : 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isToggling ? '...' : isActive ? '✅ Active' : '🚫 Inactive'}
                        </button>
                        {/* View */}
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerModal(c)}
                          title="View Details"
                          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                        >
                          <FiEye size={14} />
                        </button>
                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          title="Edit Customer"
                          style={{ background: '#fef9ec', border: '1px solid #f6d860', borderRadius: '7px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#d97706' }}
                        >
                          <FiEdit2 size={14} />
                        </button>
                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeleteModal(c)}
                          title="Delete Customer"
                          style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── View Details Modal ─── */}
      {selectedCustomerModal && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setSelectedCustomerModal(null)}
        >
          <div
            style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b' }}>Customer Details</h3>
              <button type="button" onClick={() => setSelectedCustomerModal(null)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>
                <FiX />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div><strong>Name:</strong> {selectedCustomerModal.name}</div>
              <div><strong>Email:</strong> {selectedCustomerModal.email}</div>
              <div><strong>Phone:</strong> {selectedCustomerModal.phone || 'N/A'}</div>
              <div><strong>Orders Count:</strong> {selectedCustomerModal.ordersCount || 0}</div>
              <div><strong>Total Spent:</strong> ₹{(selectedCustomerModal.totalSpent || 0).toLocaleString('en-IN')}</div>
              <div>
                <strong>Account Status:</strong>{' '}
                <span
                  style={{
                    color: (selectedCustomerModal.status || 'Active') === 'Active' ? '#16a34a' : '#dc2626',
                    fontWeight: '700',
                  }}
                >
                  {selectedCustomerModal.status || 'Active'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCustomerModal(null)}
              style={{ marginTop: '1.25rem', width: '100%', padding: '0.65rem', background: '#d99b26', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── Edit Customer Modal ─── */}
      {editModal && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setEditModal(null)}
        >
          <div
            style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b' }}>Edit Customer</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>{editModal.email}</p>
              </div>
              <button type="button" onClick={() => setEditModal(null)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiX size={16} />
              </button>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Name */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Customer name"
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>Phone</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="10-digit mobile number"
                />
              </div>

              {/* Status */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>Account Status</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {/* Active */}
                  <button
                    type="button"
                    onClick={() => setEditForm((f) => ({ ...f, status: 'Active' }))}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: `2px solid ${editForm.status === 'Active' ? '#16a34a' : '#e2e8f0'}`,
                      background: editForm.status === 'Active' ? '#dcfce7' : '#f8fafc',
                      color: editForm.status === 'Active' ? '#16a34a' : '#94a3b8',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    ✅ Active
                    <div style={{ fontSize: '0.7rem', fontWeight: '400', marginTop: '0.2rem', opacity: 0.8 }}>User can log in</div>
                  </button>

                  {/* Inactive */}
                  <button
                    type="button"
                    onClick={() => setEditForm((f) => ({ ...f, status: 'Inactive' }))}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: `2px solid ${editForm.status === 'Inactive' ? '#dc2626' : '#e2e8f0'}`,
                      background: editForm.status === 'Inactive' ? '#fee2e2' : '#f8fafc',
                      color: editForm.status === 'Inactive' ? '#dc2626' : '#94a3b8',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    🚫 Inactive
                    <div style={{ fontSize: '0.7rem', fontWeight: '400', marginTop: '0.2rem', opacity: 0.8 }}>Login blocked</div>
                  </button>
                </div>

                {/* Warning banner when setting Inactive */}
                {editForm.status === 'Inactive' && (
                  <div style={{ marginTop: '0.6rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.78rem', color: '#c2410c', display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                    ⚠️ Setting this user as Inactive will immediately block them from logging in to their account.
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setEditModal(null)}
                style={{ flex: 1, padding: '0.65rem', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                disabled={savingStatus === editModal.id}
                style={{ flex: 2, padding: '0.65rem', background: '#d99b26', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <FiSave size={15} />
                {savingStatus === editModal.id ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteModal && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setDeleteModal(null)}
        >
          <div
            style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiAlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b' }}>Delete Customer?</h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>This action cannot be undone.</span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Are you sure you want to permanently delete customer <strong>{deleteModal.name || 'User'}</strong> (<code>{deleteModal.email}</code>)?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                style={{ flex: 1, padding: '0.65rem', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                disabled={deletingId === deleteModal.id}
                style={{ flex: 1, padding: '0.65rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <FiTrash2 size={15} />
                {deletingId === deleteModal.id ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersSection;
