import { FiShield } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const UsersRolesSection = ({
  adminUsers,
  initialAdminRoles,
  showAddRoleModal,
  setShowAddRoleModal,
  roleForm,
  setRoleForm,
  handleAddAdminUserSubmit,
  handleDeleteAdminUser,
  handleToggleAdminStatus,
  handlePermissionCheckboxToggle,
}) => {
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
            onClick={() => setShowAddRoleModal(true)}
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

        {/* 4 Roles Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
          {initialAdminRoles.map((r) => (
            <div key={r.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ background: `${r.badgeColor}15`, color: r.badgeColor, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                  {r.name}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>{r.permissions.length} Modules</span>
              </div>
              <h4 style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{r.title}</h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>{r.description}</p>
            </div>
          ))}
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
                        {adm.name.charAt(0).toUpperCase()}
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
                      {adm.permissions.map((p, idx) => (
                        <span key={idx} style={{ background: '#f1f5f9', color: '#334155', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '600' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {adm.lastLogin}
                  </td>
                  <td>
                    <span className={`${styles.pillStatus} ${adm.status === 'Active' ? styles.pillDelivered : styles.pillCancelled}`}>
                      {adm.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {adm.role !== 'SUPER_ADMIN' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleAdminStatus(adm.id)}
                            style={{ padding: '0.3rem 0.65rem', background: adm.status === 'Active' ? '#fef3c7' : '#dcfce7', color: adm.status === 'Active' ? '#d97706' : '#15803d', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                          >
                            {adm.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAdminUser(adm.id)}
                            style={{ padding: '0.3rem 0.65rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                          >
                            Revoke Access
                          </button>
                        </>
                      )}
                      {adm.role === 'SUPER_ADMIN' && (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Master Admin</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin User Modal */}
      {showAddRoleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowAddRoleModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '540px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid #e2e8f0', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b', fontWeight: 700 }}>+ Add Admin User & Define Role Access</h3>
              <button type="button" onClick={() => setShowAddRoleModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <form onSubmit={handleAddAdminUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Babu"
                  value={roleForm.name}
                  onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@giftery.com"
                  value={roleForm.email}
                  onChange={e => setRoleForm({ ...roleForm, email: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Select System Role *</label>
                <select
                  value={roleForm.role}
                  onChange={e => setRoleForm({ ...roleForm, role: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full System Master Access)</option>
                  <option value="STORE_ADMIN">STORE_ADMIN (Store Manager)</option>
                  <option value="ORDER_MANAGER">ORDER_MANAGER (Orders & Inventory)</option>
                  <option value="SUPPORT_AGENT">SUPPORT_AGENT (Customer Enquiries & Support)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Select Module Access Permissions</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {['Products', 'Categories', 'Orders', 'Quotes', 'Customers', 'Enquiries', 'Coupons', 'Users & Roles', 'Settings'].map((perm) => (
                    <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(perm)}
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
                  style={{ flex: 1, padding: '0.75rem', background: '#d99b26', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Save & Assign Role Access
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  style={{ padding: '0.75rem 1.25rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
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
