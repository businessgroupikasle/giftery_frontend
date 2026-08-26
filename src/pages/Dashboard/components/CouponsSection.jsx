import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styles from '../Dashboard.module.css';

const DEFAULT_COUPONS = [];

const CouponsSection = ({ initialCoupons }) => {
  const [coupons, setCoupons] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_coupons');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return initialCoupons || [];
  });

  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [form, setForm] = useState({
    code: '',
    discountType: 'percent', // 'percent' | 'fixed'
    discountValue: '',
    category: 'All Products',
    status: 'Active',
  });

  // Save to localStorage & notify
  const updateCouponsState = (newList) => {
    setCoupons(newList);
    try {
      localStorage.setItem('admin_coupons', JSON.stringify(newList));
      window.dispatchEvent(new Event('admin_coupons_updated'));
    } catch (e) {}
  };

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setForm({
      code: '',
      discountType: 'percent',
      discountValue: '',
      category: 'All Products',
      status: 'Active',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (c) => {
    setEditingCoupon(c);
    const isPercent = c.discount.includes('%');
    const numericVal = c.discount.replace(/[^0-9.]/g, '');
    setForm({
      code: c.code,
      discountType: isPercent ? 'percent' : 'fixed',
      discountValue: numericVal,
      category: c.category || 'All Products',
      status: c.status || 'Active',
    });
    setShowModal(true);
  };

  const [deletingCoupon, setDeletingCoupon] = useState(null);

  const handleDeleteCoupon = (id, code) => {
    setDeletingCoupon({ id, code });
  };

  const confirmDeleteCoupon = () => {
    if (!deletingCoupon) return;
    const { id, code } = deletingCoupon;
    setDeletingCoupon(null);
    const updated = coupons.filter((c) => c.id !== id);
    updateCouponsState(updated);
    toast.success(`Coupon "${code}" deleted successfully`);
  };

  const handleToggleStatus = (id) => {
    const updated = coupons.map((c) => {
      if (c.id === id) {
        const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
        toast.info(`Coupon "${c.code}" is now ${nextStatus}`);
        return { ...c, status: nextStatus };
      }
      return c;
    });
    updateCouponsState(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    if (!form.discountValue || isNaN(form.discountValue) || Number(form.discountValue) <= 0) {
      toast.error('Please enter a valid positive discount value');
      return;
    }

    const formattedCode = form.code.trim().toUpperCase();
    const formattedDiscount =
      form.discountType === 'percent'
        ? `${form.discountValue}% OFF`
        : `₹${form.discountValue} OFF`;

    if (editingCoupon) {
      const updated = coupons.map((c) =>
        c.id === editingCoupon.id
          ? {
              ...c,
              code: formattedCode,
              discount: formattedDiscount,
              category: form.category.trim() || 'All Products',
              status: form.status,
            }
          : c
      );
      updateCouponsState(updated);
      toast.success(`Coupon "${formattedCode}" updated successfully`);
    } else {
      // Check duplicate code
      if (coupons.some((c) => c.code.toUpperCase() === formattedCode)) {
        toast.error(`Coupon code "${formattedCode}" already exists`);
        return;
      }
      const newCoupon = {
        id: 'c-' + Date.now(),
        code: formattedCode,
        discount: formattedDiscount,
        category: form.category.trim() || 'All Products',
        status: form.status,
      };
      updateCouponsState([newCoupon, ...coupons]);
      toast.success(`Coupon "${formattedCode}" added successfully`);
    }

    setShowModal(false);
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeaderRow}>
        <h3 className={styles.cardTitle}>Coupons & Promotional Discount Offers</h3>
        <button
          type="button"
          className={styles.viewAllBtn}
          style={{ background: '#d99b26', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700', padding: '0.6rem 1.2rem', borderRadius: '8px' }}
          onClick={handleOpenAddModal}
        >
          + Add New Coupon
        </button>
      </div>

      <table className={styles.ordersTable}>
        <thead>
          <tr>
            <th>Coupon Code</th>
            <th>Discount Value</th>
            <th>Applies To</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#64748b' }}>No promotional coupons created yet</p>
                  <span style={{ fontSize: '0.85rem' }}>Click "+ Create Coupon" above to add your first discount code.</span>
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className={styles.couponCodeBadge}>{c.code}</span>
                  </td>
                  <td>
                    <strong>{c.discount}</strong>
                  </td>
                  <td>{c.category}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(c.id)}
                      className={`${styles.badgePill} ${c.status === 'Active' ? styles.badgeActive : styles.badgeInactive}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Click to toggle status"
                    >
                      {c.status}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(c)}
                        className={styles.viewAllBtn}
                        style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#334155' }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className={styles.viewAllBtn}
                        style={{ border: '1px solid #fecaca', background: '#fff5f5', color: '#ef4444' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
      </table>

      {/* Add / Edit Coupon Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '480px',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
                {editingCoupon ? 'Edit Coupon Code' : 'Add New Coupon Code'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                  Coupon Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. FESTIVE20 or SAVE500"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', textTransform: 'uppercase', fontFamily: 'monospace' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                    Discount Type *
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    placeholder={form.discountType === 'percent' ? 'e.g. 20 (for 20%)' : 'e.g. 100 (for ₹100)'}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    min="1"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                  Applies To / Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. All Products, Corporate Gifts"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.6rem 1.2rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.4rem', background: '#d99b26', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', color: '#ffffff' }}
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Coupon Confirmation Modal Popup */}
      {deletingCoupon && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setDeletingCoupon(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              padding: '1.85rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                margin: '0 auto 1.2rem auto',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
              }}
            >
              ⚠️
            </div>

            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
              Delete Coupon Code?
            </h3>

            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
              Delete coupon <strong style={{ color: '#0f172a' }}>"{deletingCoupon.code}"</strong>? Customers will no longer be able to apply this discount.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeletingCoupon(null)}
                style={{
                  padding: '0.65rem 1.4rem',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteCoupon}
                style={{
                  padding: '0.65rem 1.6rem',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsSection;
