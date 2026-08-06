import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styles from '../Dashboard.module.css';

const DEFAULT_COUPONS = [
  { id: 'c-1', code: 'LUXURY20', discount: '20% OFF', category: 'Corporate Gifts', status: 'Active' },
  { id: 'c-2', code: 'WELCOME10', discount: '₹100 OFF', category: 'First Purchase', status: 'Active' },
  { id: 'c-3', code: 'GIFTERY10', discount: '10% OFF', category: 'All Products', status: 'Active' },
  { id: 'c-4', code: 'SAVE10', discount: '₹50 OFF', category: 'Special Offer', status: 'Active' },
];

const CouponsSection = ({ initialCoupons }) => {
  const [coupons, setCoupons] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_coupons');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return initialCoupons && initialCoupons.length > 0 ? initialCoupons : DEFAULT_COUPONS;
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

  const handleDeleteCoupon = (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${code}"?`)) return;
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
          {coupons.map((c) => (
            <tr key={c.id}>
              <td>
                <strong
                  style={{
                    background: '#f1f5f9',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    color: '#d99b26',
                    letterSpacing: '0.5px',
                    fontFamily: 'monospace',
                    fontSize: '0.95rem',
                    border: '1px dashed #d99b26',
                  }}
                >
                  {c.code}
                </strong>
              </td>
              <td>
                <strong style={{ color: '#0f172a' }}>{c.discount}</strong>
              </td>
              <td>{c.category}</td>
              <td>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(c.id)}
                  className={`${styles.pillStatus} ${c.status === 'Active' ? styles.pillDelivered : styles.pillCancelled}`}
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
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      color: '#334155',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCoupon(c.id, c.code)}
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      color: '#dc2626',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {coupons.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                No active coupon codes found. Click "+ Add New Coupon" to create one.
              </td>
            </tr>
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
    </div>
  );
};

export default CouponsSection;
