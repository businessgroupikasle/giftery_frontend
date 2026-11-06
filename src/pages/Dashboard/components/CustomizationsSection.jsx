import { useCallback, useEffect, useState } from 'react';
import { FiEdit3, FiEye, FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PrivateImage from '@components/PrivateImage';
import CustomizationDetails from '@components/customization/CustomizationDetails';
import { customizationService } from '@services/customizationService';
import useDebounce from '@hooks/useDebounce';
import { formatDate, formatOrderId } from '@utils/formatters';
import { REVIEW_STATUS_LABELS } from '@utils/customizationSummary';
import styles from '../Dashboard.module.css';

const STATUSES = Object.keys(REVIEW_STATUS_LABELS);
const PAGE_SIZE = 20;

const emptyPage = { data: [], meta: { page: 1, totalPages: 1, total: 0 }, counts: {} };

/** Staff view of every customized order item, with its uploads, instructions and review status. */
const CustomizationsSection = () => {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(emptyPage);
  const [state, setState] = useState('loading');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const data = await customizationService.listAdminItems({ status: filter, search: debouncedSearch || undefined, page, limit: PAGE_SIZE });
      setResult({ ...emptyPage, ...data });
      setState('ready');
    } catch {
      setState('error');
    }
  }, [filter, debouncedSearch, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filter, debouncedSearch]);

  const open = (item) => {
    setSelected(item);
    setNote(item.customizationStatusNote || '');
  };

  const updateStatus = async (item, status, statusNote) => {
    setSaving(true);
    try {
      const updated = await customizationService.updateReviewStatus(item.id, { status, ...(statusNote !== undefined ? { note: statusNote } : {}) });
      const merged = { ...item, ...updated };
      setResult((current) => ({ ...current, data: current.data.map((entry) => (entry.id === item.id ? merged : entry)) }));
      setSelected((current) => (current?.id === item.id ? merged : current));
      toast.success(`Status updated to ${REVIEW_STATUS_LABELS[status]}.`);
      load();
    } catch (error) {
      toast.error(error.message || 'The status could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  const counts = result.counts || {};
  const totalCount = STATUSES.reduce((sum, status) => sum + (counts[status] || 0), 0);

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeaderRow}>
        <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiEdit3 style={{ color: '#d99b26' }} />
          <span>Customized Products ({totalCount})</span>
        </h3>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', margin: '1.25rem 0 1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', ...STATUSES].map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={filter === status}
              onClick={() => setFilter(status)}
              style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', border: filter === status ? 'none' : '1px solid #cbd5e1', background: filter === status ? '#d99b26' : '#ffffff', color: filter === status ? '#ffffff' : '#475569', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
            >
              {status === 'ALL' ? 'All' : REVIEW_STATUS_LABELS[status]} ({status === 'ALL' ? totalCount : counts[status] || 0})
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <FiSearch style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, customer or product"
            aria-label="Search customized products"
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.4rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {state === 'error' && <p role="alert" style={{ color: '#b91c1c' }}>Customized products could not be loaded. <button type="button" onClick={load}>Retry</button></p>}
      {state !== 'error' && result.data.length === 0 && state === 'ready' && <p style={{ color: '#64748b' }}>No customized products match this view.</p>}

      {result.data.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Preview</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Product / Design</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((item) => (
                <tr key={item.id}>
                  <td><PrivateImage assetId={item.customization?.previewAssetId} customized alt={`${item.name} design`} className={styles.customizationThumb} /></td>
                  <td>
                    <div className={styles.orderIdText}>{formatOrderId(item.order?.id, { prefix: '#', createdAt: item.order?.createdAt })}</div>
                    <small style={{ color: '#64748b' }}>{item.order?.createdAt ? formatDate(item.order.createdAt) : ''}</small>
                  </td>
                  <td>
                    <strong>{item.order?.user?.name || 'Customer'}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.order?.user?.email}</div>
                  </td>
                  <td>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.customization?.name}</div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>
                    <select
                      value={item.customizationStatus}
                      disabled={saving}
                      aria-label={`Customization status for ${item.name}`}
                      onChange={(event) => updateStatus(item, event.target.value)}
                      style={{ padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: 600, background: '#fff' }}
                    >
                      {STATUSES.map((status) => <option key={status} value={status}>{REVIEW_STATUS_LABELS[status]}</option>)}
                    </select>
                  </td>
                  <td>
                    <button type="button" className={styles.viewBtn} title="View customization" aria-label={`View customization for ${item.name}`} onClick={() => open(item)}><FiEye aria-hidden="true" /> View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.meta?.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.6rem', marginTop: '1rem', fontSize: '0.82rem' }}>
          <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
          <span>Page {result.meta.page} of {result.meta.totalPages}</span>
          <button type="button" disabled={page >= result.meta.totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      )}

      {selected && (
        <div role="dialog" aria-modal="true" aria-label="Customization details" style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(15, 23, 42, 0.5)' }} onClick={() => setSelected(null)}>
          <div style={{ width: 'min(560px, 100%)', height: '100%', overflowY: 'auto', padding: '1.25rem', background: '#fff', boxSizing: 'border-box' }} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{selected.name}</h3>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                  Order {formatOrderId(selected.order?.id, { prefix: '#', createdAt: selected.order?.createdAt })} · Qty {selected.quantity} · {selected.order?.user?.name} ({selected.order?.user?.email})
                </p>
              </div>
              <button type="button" aria-label="Close details" onClick={() => setSelected(null)} style={{ border: 0, background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#475569' }}><FiX /></button>
            </div>

            <div style={{ display: 'grid', gap: '0.5rem', margin: '1rem 0', padding: '0.75rem', borderRadius: '10px', background: '#f8fafc' }}>
              <label style={{ display: 'grid', gap: '0.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                Review status
                <select value={selected.customizationStatus} disabled={saving} onChange={(event) => updateStatus(selected, event.target.value, note)} style={{ padding: '0.45rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  {STATUSES.map((status) => <option key={status} value={status}>{REVIEW_STATUS_LABELS[status]}</option>)}
                </select>
              </label>
              <label style={{ display: 'grid', gap: '0.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                Note shown to the customer
                <textarea rows="2" maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} style={{ padding: '0.45rem', borderRadius: '8px', border: '1px solid #cbd5e1', font: 'inherit', fontWeight: 400 }} />
              </label>
              <button type="button" disabled={saving} onClick={() => updateStatus(selected, selected.customizationStatus, note)} style={{ justifySelf: 'start', padding: '0.45rem 0.9rem', border: 0, borderRadius: '8px', background: '#d99b26', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save note</button>
            </div>

            <CustomizationDetails customization={selected.customization} showPreview />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizationsSection;
