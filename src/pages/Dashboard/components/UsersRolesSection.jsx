import { useEffect } from 'react';
import { FiShield, FiUserCheck, FiUserX, FiUserMinus, FiTrash2, FiKey, FiX } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

export const ROLE_DEFAULT_PERMISSIONS = {
  SUPER_ADMIN: [
    'Dashboard',
    'Products',
    'Categories',
    'Orders',
    'Quotes',
    'Customers',
    'Enquiries',
    'Coupons',
    'Users & Roles',
    'Settings',
  ],
  STORE_ADMIN: [
    'Dashboard',
    'Products',
    'Categories',
    'Orders',
    'Quotes',
    'Customers',
    'Enquiries',
    'Coupons',
  ],
  ORDER_MANAGER: [
    'Dashboard',
    'Products',
    'Categories',
    'Orders',
    'Quotes',
  ],
  SUPPORT_AGENT: [
    'Dashboard',
    'Quotes',
    'Customers',
    'Enquiries',
  ],
};

export const ALL_SYSTEM_MODULES = [
  'Dashboard',
  'Products',
  'Categories',
  'Orders',
  'Quotes',
  'Customers',
  'Enquiries',
  'Coupons',
  'Users & Roles',
  'Settings',
];

const UsersRolesSection = ({
  adminUsers = [],
  initialAdminRoles = [],
  showAddRoleModal = false,
  setShowAddRoleModal = () => {},
  roleForm = {},
  setRoleForm = () => {},
  handleAddAdminUserSubmit = () => {},
  handleDeleteAdminUser = () => {},
  handleToggleAdminStatus = () => {},
  handleRevokeAdminAccess = () => {},
  handlePermissionCheckboxToggle = () => {},
}) => {
  // Lock background scroll when Add Admin User modal is open (KAN-58)
  useEffect(() => {
    if (showAddRoleModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showAddRoleModal]);

  // Modal reset & open helper (KAN-57)
  const handleOpenAddModal = () => {
    setRoleForm({
      name: '',
      email: '',
      phone: '',
      role: 'STORE_ADMIN',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.STORE_ADMIN],
    });
    setShowAddRoleModal(true);
  };

  // Modal close & reset helper (KAN-57)
  const handleCloseModal = () => {
    setShowAddRoleModal(false);
    setRoleForm({
      name: '',
      email: '',
      phone: '',
      role: 'STORE_ADMIN',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.STORE_ADMIN],
    });
  };

  // Role select change handler with auto-assigned predefined permissions (KAN-59, KAN-60)
  const handleRoleSelectChange = (newRole) => {
    const predefined = ROLE_DEFAULT_PERMISSIONS[newRole] || [];
    setRoleForm((prev) => ({
      ...prev,
      role: newRole,
      permissions: [...predefined],
    }));
  };

  // Re-grant access to revoked user
  const handleReassignUser = (adm) => {
    const defaultPerms = ROLE_DEFAULT_PERMISSIONS[adm.role] || ROLE_DEFAULT_PERMISSIONS.STORE_ADMIN;
    setRoleForm({
      name: adm.name || '',
      email: adm.email || '',
      phone: adm.phone || '',
      role: adm.role || 'STORE_ADMIN',
      permissions: [...defaultPerms],
    });
    setShowAddRoleModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Add Role Button */}
      <div className={styles.cardContainer}>
        <div className={styles.cardHeaderRow}>
          <div>
            <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiShield style={{ color: '#d99b26' }} />
              <span>Users & Roles Access Control</span>
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Define project-based admin roles, assign module permissions, and manage system access.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            style={{
              padding: '0.65rem 1.25rem',
              background: 'linear-gradient(135deg, #d99b26, #b8832a)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(217, 155, 38, 0.3)',
            }}
          >
            <span>+ Add Admin User / Assign Role</span>
          </button>
        </div>

        {/* 4 Roles Overview Cards (KAN-59, KAN-60) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
          {initialAdminRoles.map((r) => {
            const moduleCount = ROLE_DEFAULT_PERMISSIONS[r.name]?.length || r.permissions?.length || 0;
            return (
              <div key={r.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ background: `${r.badgeColor}15`, color: r.badgeColor, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {r.name}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
                    {moduleCount} Modules
                  </span>
                </div>
                <h4 style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{r.title}</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>{r.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Users & Permissions Table */}
      <div className={styles.cardContainer}>
        <div className={styles.cardHeaderRow}>
          <h3 className={styles.cardTitle}>Admin Team Members & Active Permissions ({adminUsers.length})</h3>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Admin User</th>
                <th>Assigned Role</th>
                <th>Module Access Permissions</th>
                <th>Last Activity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((adm) => (
                <tr key={adm.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #d99b26, #b8832a)', color: '#fff', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                        {adm.name ? adm.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block' }}>{adm.name}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{adm.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ background: adm.role === 'SUPER_ADMIN' ? '#fef3c7' : '#eff6ff', color: adm.role === 'SUPER_ADMIN' ? '#b45309' : '#1d4ed8', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                      {adm.role}
                    </span>
                  </td>
                  <td style={{ maxWidth: '320px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {adm.permissions && adm.permissions.length > 0 ? (
                        adm.permissions.map((p, idx) => (
                          <span key={idx} style={{ background: '#f1f5f9', color: '#334155', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '600' }}>
                            {p}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>
                          No Active Modules (Access Revoked)
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {adm.lastLogin || 'Active Recently'}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background:
                          adm.status === 'Active'
                            ? '#dcfce7'
                            : adm.status === 'Revoked'
                            ? '#fee2e2'
                            : '#fef3c7',
                        color:
                          adm.status === 'Active'
                            ? '#15803d'
                            : adm.status === 'Revoked'
                            ? '#dc2626'
                            : '#d97706',
                        border: `1px solid ${
                          adm.status === 'Active'
                            ? '#86efac'
                            : adm.status === 'Revoked'
                            ? '#fca5a5'
                            : '#fde68a'
                        }`,
                      }}
                    >
                      {adm.status === 'Active' ? '● Active' : adm.status === 'Revoked' ? ' Revoked' : '○ Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {adm.role !== 'SUPER_ADMIN' ? (
                        <>
                          {/* KAN-56: Activate / Deactivate Action */}
                          {adm.status !== 'Revoked' ? (
                            <button
                              type="button"
                              onClick={() => handleToggleAdminStatus(adm.id)}
                              style={{
                                padding: '0.3rem 0.65rem',
                                background: adm.status === 'Active' ? '#fef3c7' : '#dcfce7',
                                color: adm.status === 'Active' ? '#d97706' : '#15803d',
                                border: '1px solid transparent',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                              title={
                                adm.status === 'Active'
                                  ? 'Temporarily disable login while retaining role & permissions'
                                  : 'Reactivate inactive user and restore assigned permissions'
                              }
                            >
                              {adm.status === 'Active' ? (
                                <>
                                  <FiUserX size={12} /> Deactivate
                                </>
                              ) : (
                                <>
                                  <FiUserCheck size={12} /> Activate
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleReassignUser(adm)}
                              style={{
                                padding: '0.3rem 0.65rem',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                              title="Assign fresh role and module permissions to revoked user"
                            >
                              <FiKey size={12} /> Assign Role
                            </button>
                          )}

                          {/* KAN-56: Revoke Access Action (Retains Record) */}
                          {adm.status !== 'Revoked' && (
                            <button
                              type="button"
                              onClick={() => handleRevokeAdminAccess(adm.id)}
                              style={{
                                padding: '0.3rem 0.65rem',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                              title="Permanently remove all module permissions without deleting user record"
                            >
                              <FiUserMinus size={12} /> Revoke Access
                            </button>
                          )}

                          {/* Delete Record Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAdminUser(adm.id)}
                            style={{
                              padding: '0.3rem 0.55rem',
                              background: '#f8fafc',
                              color: '#64748b',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                            title="Permanently delete user record"
                          >
                            <FiTrash2 size={12} /> Delete
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          Master Admin
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin User Modal (KAN-57, KAN-59, KAN-60) */}
      {showAddRoleModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              border: '1px solid #e2e8f0',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b', fontWeight: 700 }}>
                + Add Admin User & Define Role Access
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                <FiX aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleAddAdminUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Babu"
                  value={roleForm.name || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^[a-zA-Z\s.'-]*$/.test(val)) {
                      setRoleForm({ ...roleForm, name: val });
                    }
                  }}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                  Alphabetic characters and spaces only (numbers not allowed)
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@giftery.com"
                  value={roleForm.email || ''}
                  onChange={(e) => setRoleForm({ ...roleForm, email: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Select System Role *
                </label>
                <select
                  value={roleForm.role || 'STORE_ADMIN'}
                  onChange={(e) => handleRoleSelectChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full System Master Access — 10 Modules)</option>
                  <option value="STORE_ADMIN">STORE_ADMIN (Store Manager — 8 Modules)</option>
                  <option value="ORDER_MANAGER">ORDER_MANAGER (Orders & Inventory — 5 Modules)</option>
                  <option value="SUPPORT_AGENT">SUPPORT_AGENT (Customer Enquiries & Support — 4 Modules)</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>
                    Select Module Access Permissions
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                    {(roleForm.permissions || []).length} of {ALL_SYSTEM_MODULES.length} Selected
                  </span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                    background: '#f8fafc',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {ALL_SYSTEM_MODULES.map((perm) => (
                    <label
                      key={perm}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.82rem',
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={(roleForm.permissions || []).includes(perm)}
                        onChange={() => handlePermissionCheckboxToggle(perm)}
                      />
                      <span>{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#d99b26',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Save & Assign Role Access
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersRolesSection;
