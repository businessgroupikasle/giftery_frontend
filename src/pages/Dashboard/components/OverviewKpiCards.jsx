import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FiBarChart2,
  FiBox,
  FiCalendar,
  FiEdit3,
  FiFileText,
  FiFolder,
  FiHelpCircle,
  FiPackage,
  FiPercent,
  FiRefreshCw,
  FiShield,
  FiShoppingBag,
  FiUsers,
} from 'react-icons/fi';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { getSocket } from '@api/socket';
import { unwrapApiData } from '@utils/apiResponse';
import { dateRangeToBounds, describeDateRange } from '@utils/dateRange';
import styles from '../Dashboard.module.css';
import local from './OverviewKpiCards.module.css';

const ICON_COLORS = ['bgPurple', 'bgBlue', 'bgOrange', 'bgGreen', 'bgIndigo', 'bgPink'];
const number = (value) => Number(value || 0).toLocaleString('en-IN');
const plural = (count, word) => `${number(count)} ${word}${Number(count) === 1 ? '' : 's'}`;

/**
 * One card per admin sidebar section, in sidebar order. `period` cards count
 * activity inside the selected date filter; the rest are current totals.
 * Each detail is [text, needsAttention].
 */
export const buildKpiCards = (s) => [
  { tab: 'reports', label: 'Total Revenue', icon: FiBarChart2, period: true,
    value: `₹${Number(s.revenue?.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
    details: [['Excludes cancelled & refunded', false]] },
  { tab: 'products', label: 'Products', icon: FiBox, value: number(s.products?.total),
    details: [[`${number(s.products?.lowStock)} low stock`, s.products?.lowStock > 0], [`${number(s.products?.outOfStock)} out of stock`, s.products?.outOfStock > 0]] },
  { tab: 'categories', label: 'Categories', icon: FiFolder, value: number(s.categories?.total),
    details: [['Product categories', false]] },
  { tab: 'orders', label: 'Orders', icon: FiShoppingBag, period: true, value: number(s.orders?.total),
    details: [[`${number(s.orders?.open)} open`, s.orders?.open > 0], [`${number(s.orders?.delivered)} delivered`, false]] },
  { tab: 'customizations', label: 'Customized Products', icon: FiEdit3, period: true, value: number(s.customizations?.total),
    details: [[`${number(s.customizations?.pendingReview)} awaiting review`, s.customizations?.pendingReview > 0]] },
  { tab: 'customers', label: 'Customers', icon: FiUsers, period: true, value: number(s.customers?.total),
    details: [['Registered customers', false]] },
  { tab: 'enquiries', label: 'Enquiries', icon: FiHelpCircle, period: true, value: number(s.enquiries?.total),
    details: [[`${number(s.enquiries?.new)} new`, s.enquiries?.new > 0]] },
  { tab: 'bulk-orders', label: 'Bulk Orders', icon: FiPackage, period: true, value: number(s.bulkOrders?.total),
    details: [[`${number(s.bulkOrders?.new)} new`, s.bulkOrders?.new > 0], [plural(s.bulkOrders?.units, 'unit'), false]] },
  { tab: 'appointments', label: 'Appointments', icon: FiCalendar, period: true, value: number(s.appointments?.total),
    details: [[`${number(s.appointments?.new)} new`, s.appointments?.new > 0]] },
  { tab: 'catalogue-requests', label: 'Catalogue Requests', icon: FiFileText, period: true, value: number(s.catalogueRequests?.total),
    details: [[`${number(s.catalogueRequests?.new)} new`, s.catalogueRequests?.new > 0]] },
  { tab: 'coupons', label: 'Coupons & Offers', icon: FiPercent, value: number(s.coupons?.total),
    details: [[`${number(s.coupons?.live)} live now`, false]] },
  { tab: 'users-roles', label: 'Users & Roles', icon: FiShield, value: number(s.staff?.total),
    details: [[plural(s.staff?.superAdmins, 'super admin'), false], [plural(s.staff?.admins, 'admin'), false]] },
];

const LIVE_EVENTS = ['order:created', 'enquiry:created', 'customer:created'];

/** Live KPI cards for the dashboard overview, read from GET /dashboard/summary. */
const OverviewKpiCards = ({ handleTabChange, dateFilter, refreshKey = 0 }) => {
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('loading');
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setStatus((current) => (current === 'ready' ? 'refreshing' : 'loading'));
    const { from, to } = dateRangeToBounds(dateFilter);
    try {
      const response = await axiosInstance.get(ENDPOINTS.DASHBOARD.SUMMARY, {
        params: { from: from?.toISOString(), to: to?.toISOString() },
      });
      if (id !== requestId.current) return; // a newer filter's request is in flight
      setSummary(unwrapApiData(response));
      setStatus('ready');
    } catch {
      if (id === requestId.current) setStatus('error');
    }
  }, [dateFilter]);

  useEffect(() => { load(); }, [load, refreshKey]);

  // New orders, enquiries and sign-ups update the counts without a manual refresh.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;
    let timer;
    const onEvent = () => {
      clearTimeout(timer);
      timer = setTimeout(load, 400);
    };
    LIVE_EVENTS.forEach((event) => socket.on(event, onEvent));
    return () => {
      clearTimeout(timer);
      LIVE_EVENTS.forEach((event) => socket.off(event, onEvent));
    };
  }, [load]);

  const cards = useMemo(() => buildKpiCards(summary || {}), [summary]);
  const periodLabel = describeDateRange(dateFilter);
  const loading = status === 'loading';

  return (
    <div className={local.wrapper}>
      {status === 'error' && (
        <div className={local.errorBar} role="alert">
          <span>Couldn&apos;t load the live dashboard counts.</span>
          <button type="button" onClick={load}><FiRefreshCw aria-hidden="true" /> Retry</button>
        </div>
      )}
      <div className={`${styles.kpiGrid} ${local.grid}`} aria-busy={loading || status === 'refreshing'}>
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <button
              key={card.tab}
              type="button"
              className={`${styles.kpiCard} ${local.card}`}
              onClick={() => handleTabChange(card.tab)}
              title={`Open ${card.label}`}
            >
              <div className={styles.kpiHeader}>
                <div className={`${styles.kpiIconCircle} ${styles[ICON_COLORS[index % ICON_COLORS.length]]}`}>
                  <Icon aria-hidden="true" />
                </div>
                <span className={styles.kpiTitle}>{card.label}</span>
              </div>
              <h2 className={styles.kpiValue}>{loading || (status === 'error' && !summary) ? '—' : card.value}</h2>
              <div className={local.details}>
                {card.details.map(([text, attention]) => (
                  <span key={text} className={attention ? local.attention : undefined}>{text}</span>
                ))}
              </div>
              <span className={local.scope}>{card.period ? periodLabel : 'Current total'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OverviewKpiCards;
