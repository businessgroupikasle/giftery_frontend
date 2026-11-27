import { useCallback, useEffect, useState } from 'react';
import { FiEye, FiPackage, FiRefreshCw, FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { getSocket } from '@api/socket';
import useDebounce from '@hooks/useDebounce';
import { unwrapApiData } from '@utils/apiResponse';
import { formatDate } from '@utils/formatters';
import styles from '../Dashboard.module.css';

/** Same order and values as BULK_ORDER_STATUSES on the server. */
const STATUSES = ['New', 'Contacted', 'Quoted', 'Converted', 'Closed'];
const STATUS_COLORS = {
  New: { background: '#dbeafe', color: '#1d4ed8' },
  Contacted: { background: '#fef3c7', color: '#92400e' },
  Quoted: { background: '#ede9fe', color: '#6d28d9' },
  Converted: { background: '#dcfce7', color: '#166534' },
  Closed: { background: '#f1f5f9', color: '#475569' },
};
const PAGE_SIZE = 20;
const emptyPage = { data: [], meta: { page: 1, totalPages: 1, total: 0 }, counts: {} };

const Detail = ({ label, children }) => (
  <div style={{ display: 'grid', gap: '0.15rem' }}>
    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</span>
    <span style={{ fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{children || '—'}</span>
  </div>
);

/** Bulk order inquiries sent from product pages, with a simple sales pipeline status. */
const BulkOrdersSection = () => {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(emptyPage);
  const [state, setState] = useState('loading');
  const [selected, setSelected] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setState((current) => (current === 'ready' ? 'refreshing' : 'loading'));
    try {
      const response = await axiosInstance.get(ENDPOINTS.ENQUIRIES.BULK_ORDERS, {
        params: { status: filter === 'ALL' ? undefined : filter, search: debouncedSearch || undefined, page, limit: PAGE_SIZE },
      });
      setResult({ ...emptyPage, ...unwrapApiData(response) });
      setState('ready');
    } catch {
      setState('error');
    }
  }, [filter, debouncedSearch, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filter, debouncedSearch]);

  // A new inquiry from the storefront appears without a manual refresh.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;
    const onCreated = (enquiry) => {
      if (enquiry?.type !== 'BULK_ORDER') return;
      toast.info(`New bulk inquiry: ${enquiry.quantity} × ${enquiry.productName}`);
      load();
    };
    socket.on('enquiry:created', onCreated);
    return () => socket.off('enquiry:created', onCreated);
  }, [load]);

  const updateStatus = async (inquiry, status) => {
    if (status === inquiry.status) return;
    setSavingId(inquiry.id);
    try {
      const response = await axiosInstance.patch(ENDPOINTS.ENQUIRIES.BULK_ORDER_STATUS(inquiry.id), { status });
      const updated = { ...inquiry, ...unwrapApiData(response), status };
      setResult((current) => ({ ...current, data: current.data.map((row) => (row.id === inquiry.id ? updated : row)) }));
      setSelected((current) => (current?.id === inquiry.id ? updated : current));
      toast.success(`${inquiry.id} moved to ${status}.`);
      load();
    } catch (error) {
      toast.error(error?.message || 'The status could not be updated.');
    } finally {
      setSavingId(null);
    }
  };

  const counts = result.counts || {};
  const totalCount = STATUSES.reduce((sum, status) => sum + (counts[status] || 0), 0);

  const statusSelect = (inquiry, extraStyle = {}) => (
    <select
      value={inquiry.status}
      disabled={savingId === inquiry.id}
      aria-label={`Status for bulk inquiry ${inquiry.id}`}
      onChange={(event) => updateStatus(inquiry, event.target.value)}
      style={{ padding: '0.35rem 0.6rem', borderRadius: '20px', border: '1px solid transparent', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', ...(STATUS_COLORS[inquiry.status] || STATUS_COLORS.Closed), ...extraStyle }}
    >
      {STATUSES.map((status) => <option key={status} value={status} style={{ background: '#fff', color: '#1e293b' }}>{status}</option>)}
    </select>
  );

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeaderRow}>
        <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiPackage style={{ color: '#d99b26' }} />
          <span>Bulk Order Inquiries ({totalCount})</span>
        </h3>
        <button type="button" onClick={load} disabled={state === 'loading' || state === 'refreshing'} title="Refresh" aria-label="Refresh bulk inquiries" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
          <FiRefreshCw aria-hidden="true" /> Refresh
        </button>
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
              {status === 'ALL' ? 'All' : status} ({status === 'ALL' ? totalCount : counts[status] || 0})
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <FiSearch style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ID, customer, company, product or SKU"
            aria-label="Search bulk inquiries"
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.4rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {state === 'loading' && <p style={{ color: '#64748b' }}>Loading bulk inquiries…</p>}
      {state === 'error' && <p role="alert" style={{ color: '#b91c1c' }}>Bulk inquiries could not be loaded. <button type="button" onClick={load}>Retry</button></p>}
      {state === 'ready' && result.data.length === 0 && (
        <p style={{ color: '#64748b' }}>{search || filter !== 'ALL' ? 'No bulk inquiries match this view.' : 'No bulk order inquiries yet. They appear here when a customer sends one from a product page.'}</p>
      )}

      {result.data.length > 0 && state !== 'loading' && (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Inquiry</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Customer</th>
                <th>Company</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>
                    <div className={styles.orderIdText}>{inquiry.id}</div>
                    <small style={{ color: '#64748b' }}>{inquiry.createdAt ? formatDate(inquiry.createdAt) : ''}</small>
                  </td>
                  <td>
                    <strong>{inquiry.productName}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {inquiry.productSku || '—'}</div>
                  </td>
                  <td><strong>{Number(inquiry.quantity || 0).toLocaleString('en-IN')}</strong></td>
                  <td>
                    <strong>{inquiry.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a></div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}><a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a></div>
                  </td>
                  <td>{inquiry.company || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                  <td>{statusSelect(inquiry)}</td>
                  <td>
                    <button type="button" className={styles.viewBtn} title="View inquiry" aria-label={`View bulk inquiry ${inquiry.id}`} onClick={() => setSelected(inquiry)}><FiEye aria-hidden="true" /> View</button>
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
        <div role="dialog" aria-modal="true" aria-label={`Bulk inquiry ${selected.id}`} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(15, 23, 42, 0.5)' }} onClick={() => setSelected(null)}>
          <div style={{ width: 'min(520px, 100%)', height: '100%', overflowY: 'auto', padding: '1.25rem', background: '#fff', boxSizing: 'border-box' }} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Bulk inquiry {selected.id}</h3>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.8rem' }}>Received {selected.createdAt ? formatDate(selected.createdAt) : ''}</p>
              </div>
              <button type="button" aria-label="Close details" onClick={() => setSelected(null)} style={{ border: 0, background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#475569' }}><FiX /></button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '1rem 0', padding: '0.75rem', borderRadius: '10px', background: '#f8fafc' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Status</span>
              {statusSelect(selected)}
            </div>

            <div style={{ display: 'grid', gap: '0.9rem' }}>
              <Detail label="Product">
                {selected.product?.slug && selected.product?.isActive
                  ? <a href={`/product/${selected.product.slug}`} target="_blank" rel="noreferrer">{selected.productName}</a>
                  : selected.productName}
              </Detail>
              <Detail label="SKU">{selected.productSku}</Detail>
              <Detail label="Required quantity">{Number(selected.quantity || 0).toLocaleString('en-IN')}</Detail>
              <Detail label="Customer">{selected.name}</Detail>
              <Detail label="Email"><a href={`mailto:${selected.email}`}>{selected.email}</a></Detail>
              <Detail label="Phone"><a href={`tel:${selected.phone}`}>{selected.phone}</a></Detail>
              <Detail label="Company / organization">{selected.company}</Detail>
              <Detail label="Additional requirements">{selected.requirements}</Detail>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOrdersSection;
