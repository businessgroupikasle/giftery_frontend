import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX } from 'react-icons/fi';
import { getStoredCoupons } from '../../../constants/coupons';
import { filterByDateRange } from '../../../utils/formatters';
import { couponService } from '../../../services/couponService';
import styles from '../Dashboard.module.css';

const VALIDITY_STYLES = {
  Valid: { background: '#dcfce7', color: '#15803d' },
  Upcoming: { background: '#dbeafe', color: '#1d4ed8' },
  Expired: { background: '#fee2e2', color: '#b91c1c' },
};

const formatCouponDate = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const CouponsSection = ({ initialCoupons, dateFilter, isDateFilterActive = false }) => {
  const [coupons, setCoupons] = useState(() => initialCoupons || []);

  // Header date filter narrows the list by each coupon's createdAt date
  const visibleCoupons = isDateFilterActive && dateFilter
    ? filterByDateRange(coupons, dateFilter, 'createdAt')
    : coupons;

  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [form, setForm] = useState({
    code: '',
    discountType: 'percent', // 'percent' | 'fixed'
    discountValue: '',
    category: 'All Products',
    status: 'Active',
    startDate: '',
    expiryDate: '',
  });

  useEffect(() => {
    let mounted = true;
    const loadCoupons = async () => {
      try {
        let serverCoupons = await couponService.listAdmin();
        const localCoupons = getStoredCoupons();
        for (const coupon of localCoupons) {
          if (serverCoupons.some((item) => item.code === coupon.code)) continue;
          const discountValue = Number(String(coupon.discount || '').replace(/[^0-9.]/g, ''));
          try {
            await couponService.create({
              code: coupon.code,
              discountType: String(coupon.discount || '').includes('%') ? 'percent' : 'fixed',
              discountValue,
              category: coupon.category,
              status: coupon.status,
            });
          } catch (error) {
            if (error.status !== 409) throw error;
          }
        }
        if (localCoupons.length > 0) {
          localStorage.removeItem('admin_coupons');
          serverCoupons = await couponService.listAdmin();
        }
        if (mounted) setCoupons(serverCoupons);
      } catch (error) {
        if (mounted) toast.error(error.message || 'Unable to load coupons');
      }
    };
    loadCoupons();
    return () => { mounted = false; };
  }, []);

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setForm({
      code: '',
      discountType: 'percent',
      discountValue: '',
      category: 'All Products',
      status: 'Active',
      startDate: '',
      expiryDate: '',
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
      startDate: c.startDate || '',
      expiryDate: c.expiryDate || '',
    });
    setShowModal(true);
  };

  const [deletingCoupon, setDeletingCoupon] = useState(null);

  const handleDeleteCoupon = (id, code) => {
    setDeletingCoupon({ id, code });
  };

  const confirmDeleteCoupon = async () => {
    if (!deletingCoupon) return;
    const { id, code } = deletingCoupon;
    setDeletingCoupon(null);
    try {
      await couponService.remove(id);
      setCoupons((current) => current.filter((coupon) => coupon.id !== id));
      window.dispatchEvent(new Event('admin_coupons_updated'));
      toast.success(`Coupon "${code}" deleted permanently`);
    } catch (error) {
      toast.error(error.message || 'Unable to delete coupon');
    }
  };

  const handleToggleStatus = async (id) => {
    const coupon = coupons.find((item) => item.id === id);
    if (!coupon) return;
    const nextStatus = coupon.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const updated = await couponService.update(id, { ...coupon, status: nextStatus });
      setCoupons((current) => current.map((item) => item.id === id ? updated : item));
      window.dispatchEvent(new Event('admin_coupons_updated'));
      toast.info(`Coupon "${coupon.code}" is now ${nextStatus}`);
    } catch (error) {
      toast.error(error.message || 'Unable to update coupon status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = form.code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Please enter a coupon code');
      return;
    }
    if (cleanCode.length < 3 || cleanCode.length > 16) {
      toast.error('Coupon code must be between 3 and 16 characters');
      return;
    }
    if (!/^[A-Z0-9_-]+$/.test(cleanCode)) {
      toast.error('Coupon code can only contain letters, numbers, hyphens, and underscores');
      return;
    }
    if (/^\d+$/.test(cleanCode)) {
      toast.error('Coupon code must contain letters (cannot be only numbers, e.g. FESTIVE20, SAVE100)');
      return;
    }

    const numVal = parseFloat(form.discountValue);
    if (!form.discountValue || isNaN(numVal) || numVal <= 0) {
      toast.error('Please enter a valid positive discount value');
      return;
    }

    if (form.discountType === 'percent') {
      if (numVal < 1 || numVal > 100) {
        toast.error('Percentage discount must be between 1% and 100%');
        return;
      }
    } else {
      if (numVal <= 0) {
        toast.error('Fixed discount amount must be greater than ₹0');
        return;
      }
    }

    if (form.startDate && form.expiryDate && form.expiryDate < form.startDate) {
      toast.error('Expiry date cannot be before the start date');
      return;
    }

    const formattedCode = cleanCode;
    const cleanNum = Number(numVal.toFixed(2));
    const payload = {
      code: formattedCode,
      discountType: form.discountType,
      discountValue: cleanNum,
      category: form.category.trim() || 'All Products',
      status: form.status,
      startDate: form.startDate || null,
      expiryDate: form.expiryDate || null,
    };

    if (!editingCoupon && coupons.some((c) => c.code.toUpperCase() === formattedCode)) {
      toast.error(`Coupon code "${formattedCode}" already exists`);
      return;
    }

    try {
      if (editingCoupon) {
        const updated = await couponService.update(editingCoupon.id, payload);
        setCoupons((current) => current.map((coupon) => coupon.id === editingCoupon.id ? updated : coupon));
        toast.success(`Coupon "${formattedCode}" updated successfully`);
      } else {
        const created = await couponService.create(payload);
        setCoupons((current) => [created, ...current]);
        toast.success(`Coupon "${formattedCode}" added successfully`);
      }
      window.dispatchEvent(new Event('admin_coupons_updated'));
      setShowModal(false);
    } catch (error) {
      toast.error(error.message || 'Unable to save coupon');
    }
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

      <table className={`${styles.ordersTable} ${styles.dashboardDataTable}`}>
        <thead>
          <tr>
            <th>Coupon Code</th>
            <th>Discount Value</th>
            <th>Applies To</th>
            <th>Start Date</th>
            <th>Expiry Date</th>
            <th>Validity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
            {visibleCoupons.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  {coupons.length === 0 ? (
                    <>
                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#64748b' }}>No promotional coupons created yet</p>
                      <span style={{ fontSize: '0.85rem' }}>Click "+ Create Coupon" above to add your first discount code.</span>
                    </>
                  ) : (
                    <>
                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#64748b' }}>No coupons found for {dateFilter}</p>
                      <span style={{ fontSize: '0.85rem' }}>Try a different date range from the Filter menu.</span>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              visibleCoupons.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className={styles.couponCodeBadge}>{c.code}</span>
                  </td>
                  <td>
                    <strong>{c.discount}</strong>
                  </td>
                  <td>{c.category}</td>
                  <td>{formatCouponDate(c.startDate) || '—'}</td>
                  <td>{formatCouponDate(c.expiryDate) || 'No expiry'}</td>
                  <td>
                    <span
                      className={styles.pillStatus}
                      style={VALIDITY_STYLES[c.validity] || VALIDITY_STYLES.Valid}
                      title={c.validity === 'Expired' ? 'This coupon has expired and cannot be applied' : undefined}
                    >
                      {c.validity || 'Valid'}
                    </span>
                  </td>
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
                aria-label="Close modal"
                title="Close"
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0';
                  e.currentTarget.style.color = '#000000';
                  e.currentTarget.style.borderColor = '#94a3b8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#0f172a';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                  Coupon Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. FESTIVE20, SAVE500"
                  value={form.code}
                  maxLength={16}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', textTransform: 'uppercase', fontFamily: 'monospace' }}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem', display: 'block' }}>
                  Enter 3–16 alphanumeric characters. Must include letters (e.g. FESTIVE20).
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                    Discount Type *
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                    Discount Value {form.discountType === 'percent' ? '(%) *' : '(₹) *'}
                  </label>
                  <input
                    type="number"
                    step={form.discountType === 'percent' ? '0.1' : '1'}
                    min="1"
                    max={form.discountType === 'percent' ? '100' : undefined}
                    placeholder={form.discountType === 'percent' ? 'e.g. 15 (1% to 100%)' : 'e.g. 150 (₹)'}
                    value={form.discountValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (form.discountType === 'percent' && Number(val) > 100) {
                        toast.warning('Percentage discount cannot exceed 100%');
                        setForm({ ...form, discountValue: '100' });
                        return;
                      }
                      setForm({ ...form, discountValue: val });
                    }}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem', display: 'block' }}>
                    {form.discountType === 'percent'
                      ? 'Valid percentage: 1% to 100%'
                      : 'Enter fixed discount amount in ₹ (e.g. 50, 100, 250)'}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                  Applies To / Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                  required
                >
                  <option value="All Products">All Products</option>
                  <option value="Corporate Gifts">Corporate Gifts</option>
                  <option value="Personalized Gifts">Personalized Gifts</option>
                  <option value="Toys & Games">Toys & Games</option>
                  <option value="Luxury Hampers">Luxury Hampers</option>
                  <option value="Office Essentials">Office Essentials</option>
                </select>
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem', display: 'block' }}>
                  Select the product collection or department this coupon targets.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    max={form.expiryDate || undefined}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    min={form.startDate || undefined}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <span style={{ gridColumn: '1 / -1', fontSize: '0.72rem', color: '#64748b', marginTop: '-0.4rem' }}>
                  Optional. Leave blank for no start or expiry limit. The expiry date itself is still valid.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                  Status *
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                  required
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
