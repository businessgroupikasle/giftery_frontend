import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiCreditCard, FiDownload, FiFileText, FiHeadphones, FiHome, FiInfo, FiMail, FiTruck } from 'react-icons/fi';
import PrivateImage from '@components/PrivateImage';
import CustomizationDetails from '@components/customization/CustomizationDetails';
import { ROUTES } from '@constants/routes';
import { formatOrderId } from '@utils/formatters';
import { downloadOrderInvoice } from '../Orders/InvoiceModal';
import styles from './OrderSuccess.module.css';

// The same public contact address the site footer shows.
const SUPPORT_EMAIL = 'giftery2023@gmail.com';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Prefers the totals the server calculated when the order was created. */
const readTotals = (order, items) => {
  const pricing = order.pricing || {};
  return {
    subtotal: pricing.subtotal ?? order.subtotal ?? items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0),
    discount: pricing.discountAmount ?? order.discountAmount ?? 0,
    shipping: pricing.shippingFee ?? order.shippingFee ?? 0,
    tax: pricing.taxAmount ?? order.taxAmount ?? 0,
    taxPercentage: pricing.taxPercentage ?? order.taxPercentage ?? 0,
    total: pricing.totalAmount ?? order.totalAmount ?? 0,
  };
};

export default function OrderSuccess({ order, user }) {
  // The checkout form above this screen is long, so the customer may arrive scrolled down.
  useEffect(() => { window.scrollTo?.({ top: 0 }); }, []);

  const items = Array.isArray(order.items) ? order.items : [];
  const totals = readTotals(order, items);
  const address = order.shippingAddress || {};
  const placedAt = new Date(order.createdAt || Date.now());
  const orderDate = placedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const orderTime = placedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  const orderId = formatOrderId(order.orderId || order.id, { prefix: '', createdAt: order.createdAt });
  const paymentMethod = String(order.paymentMethod || order.payment?.method || 'COD').toUpperCase();
  const rawPaymentStatus = String(order.paymentStatus || order.payment?.status || 'PENDING').toUpperCase();
  const paymentStatus = rawPaymentStatus === 'SUCCEEDED' ? 'PAID' : rawPaymentStatus;
  const deliveringTo = [address.fullName, address.addressLine1 || address.street].filter(Boolean).join(', ');
  const deliveringArea = [address.city, address.pincode || address.zip].filter(Boolean).join(' - ');

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <header className={styles.hero}>
          <span className={styles.checkCircle} aria-hidden="true"><FiCheck /></span>
          <h1>Thank You For Your Order!</h1>
          <p>Your order has been placed successfully.</p>
          <div className={styles.orderIdPill}>
            Order ID: <strong data-testid="success-order-id">{orderId}</strong>
          </div>
        </header>

        <section className={styles.summaryRow} aria-label="Order summary">
          <div className={styles.summaryCell}>
            <FiTruck className={styles.summaryIcon} aria-hidden="true" />
            <div>
              <span className={styles.summaryLabel}>Delivering To:</span>
              <p>{deliveringTo}{deliveringTo && deliveringArea ? ', ' : ''}{deliveringArea}</p>
            </div>
          </div>
          <div className={styles.summaryCell}>
            <FiCreditCard className={styles.summaryIcon} aria-hidden="true" />
            <div>
              <span className={styles.summaryLabel}>Payment:</span>
              <p className={styles.summaryStrong}>{paymentMethod} · {paymentStatus}</p>
            </div>
          </div>
          <div className={styles.summaryCell}>
            <span className={styles.rupeeIcon} aria-hidden="true">₹</span>
            <div>
              <span className={styles.summaryLabel}>{paymentStatus === 'PAID' ? 'Total Paid:' : 'Amount Due:'}</span>
              <p className={styles.summaryTotal} data-testid="success-total">{money(totals.total)}</p>
            </div>
          </div>
        </section>

        <section className={styles.invoice} aria-labelledby="order-invoice-title">
          <div className={styles.invoiceHeader}>
            <h2 id="order-invoice-title"><FiFileText aria-hidden="true" /> Order Invoice</h2>
            <span>Date: {orderDate} | Time: {orderTime}</span>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col" className={styles.indexCell}>#</th>
                  <th scope="col" className={styles.productHead}>Product</th>
                  <th scope="col">Qty</th>
                  <th scope="col">Unit Price</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const quantity = Number(item.quantity || 1);
                  const unitPrice = Number(item.price || 0);
                  return (
                    <tr key={item.id || index}>
                      <td className={styles.indexCell}>{index + 1}</td>
                      <td>
                        <div className={styles.productCell}>
                          <PrivateImage
                            customized={Boolean(item.customization)}
                            assetId={item.customization?.previewAssetId}
                            src={item.image}
                            alt={item.name || 'Product'}
                            className={styles.productImage}
                          />
                          <div className={styles.productInfo}>
                            <strong>{item.name || item.product?.name || 'Gift Item'}</strong>
                            {item.customization
                              ? <CustomizationDetails customization={item.customization} charge={item.customizationCharge} compact />
                              : item.variant && <span>{item.variant}</span>}
                          </div>
                        </div>
                      </td>
                      <td>{quantity}</td>
                      <td>{money(unitPrice)}</td>
                      <td>{money(unitPrice * quantity)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <dl className={styles.totals}>
            <div><dt>Sub Total</dt><dd>{money(totals.subtotal)}</dd></div>
            {totals.discount > 0 && <div><dt>Discount</dt><dd>-{money(totals.discount)}</dd></div>}
            <div><dt>Shipping</dt><dd>{money(totals.shipping)}</dd></div>
            {totals.tax > 0 && <div><dt>GST{totals.taxPercentage ? ` (${totals.taxPercentage}%)` : ''}</dt><dd>{money(totals.tax)}</dd></div>}
            <div className={styles.grandTotal}><dt>Total Amount</dt><dd>{money(totals.total)}</dd></div>
          </dl>
        </section>

        <section className={styles.infoCard}>
          <div className={styles.infoColumn}>
            <h2><FiInfo aria-hidden="true" /> Order Information</h2>
            <dl>
              <div><dt>Order ID</dt><dd>{orderId}</dd></div>
              <div><dt>Order Date</dt><dd>{orderDate}</dd></div>
              <div><dt>Payment Method</dt><dd>{paymentMethod}</dd></div>
              <div><dt>Payment Status</dt><dd>{paymentStatus}</dd></div>
            </dl>
          </div>
          <div className={styles.helpColumn}>
            <FiHeadphones className={styles.helpIcon} aria-hidden="true" />
            <div>
              <strong>Need Help?</strong>
              <p>Contact our support team</p>
              <a href={`mailto:${SUPPORT_EMAIL}`}><FiMail aria-hidden="true" /> {SUPPORT_EMAIL}</a>
            </div>
          </div>
        </section>

        <div className={styles.actions}>
          <button type="button" className={styles.downloadBtn} onClick={() => downloadOrderInvoice(order, user)}>
            <FiDownload aria-hidden="true" /> Download Invoice
          </button>
          <Link to={ROUTES.HOME} className={styles.homeBtn}>
            <FiHome aria-hidden="true" /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
