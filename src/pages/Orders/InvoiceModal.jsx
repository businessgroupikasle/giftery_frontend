import { FiDownload, FiPrinter, FiX } from 'react-icons/fi';
import { formatDate, formatOrderId } from '@utils/formatters';
import { readStoreSettings } from '@hooks/useStoreSettings';
import styles from './InvoiceModal.module.css';

const STATUS_COLORS = {
  PENDING: '#b45309', CONFIRMED: '#2563eb', PROCESSING: '#7c3aed',
  SHIPPED: '#0891b2', DELIVERED: '#059669', CANCELLED: '#dc2626', REFUNDED: '#4b5563',
};

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

const getInvoiceData = (order, user) => {
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotalFromItems = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 1);
    const unitPrice = Number(item.price || item.unitPrice || item.product?.price || 0);
    return sum + (quantity * unitPrice);
  }, 0);
  const settings = readStoreSettings();
  const total = Number(order.totalAmount ?? order.total ?? order.grandTotal ?? subtotalFromItems);
  const discount = Number(order.discountAmount ?? order.discount ?? order.couponDiscount ?? 0);
  const subtotal = Number(order.subtotal ?? order.subTotal ?? (subtotalFromItems || total));
  const inferredShipping = Math.max(0, total - subtotal + discount);
  const shipping = Number(order.shippingFee ?? order.shippingAmount ?? order.deliveryCharge ?? inferredShipping);
  const taxPercentage = Number(order.taxPercentage ?? order.taxRate ?? settings.taxPercentage);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number(order.taxAmount ?? order.tax ?? (taxPercentage > 0 ? (taxableAmount * taxPercentage) / 100 : 0));
  const address = order.shippingAddress || order.address || {};
  const invoiceId = formatOrderId(order.id || order.orderId, { prefix: '', createdAt: order.createdAt });
  return {
    items, subtotal, discount, shipping, tax, taxPercentage, total, address, invoiceId, settings,
    status: String(order.status || 'PENDING').toUpperCase(),
    customerName: order.customerName || order.customer || order.user?.name || address.fullName || address.name || user?.name || 'Customer',
    customerEmail: order.customerEmail || order.user?.email || address.email || user?.email || 'Not provided',
    paymentMethod: String(order.paymentMethod || order.payment?.method || 'Not provided').replaceAll('_', ' ').toUpperCase(),
    paymentStatus: String(order.paymentStatus || order.payment?.status || (String(order.status).toUpperCase() === 'DELIVERED' ? 'PAID' : 'PENDING')).toUpperCase(),
    transactionId: order.transactionId || order.paymentId || order.payment?.id || '',
  };
};

const getItemImage = (item) => item.image || item.product?.images?.[0] || item.product?.image || '/placeholder-product.png';

const getItemMeta = (item) => [
  item.sku || item.product?.sku ? 'SKU: ' + (item.sku || item.product?.sku) : 'Product ID: ' + (item.productId || item.id || item.product?.id || 'N/A'),
  item.variant && item.variant !== 'Standard Edition' ? 'Variant: ' + item.variant : '',
  item.isCustomized || item.logo || item.customText ? 'Customized product' : '',
  item.customText ? 'Custom text: ' + item.customText : '',
].filter(Boolean);

const addressLines = (address) => [
  address.addressLine1 || address.address || address.street,
  address.addressLine2,
  [address.city, address.state, address.pincode || address.zip].filter(Boolean).join(', '),
  address.country || 'India',
].filter(Boolean);

const buildInvoiceHtml = (order, user) => {
  const data = getInvoiceData(order, user);
  const rows = data.items.map((item, index) => {
    const quantity = Number(item.quantity || 1);
    const price = Number(item.price || item.unitPrice || item.product?.price || 0);
    return `<tr><td>${index + 1}</td><td><strong>${escapeHtml(item.name || item.product?.name || 'Gift Item')}</strong><br><small>${escapeHtml(getItemMeta(item).join(' | '))}</small></td><td class="num">${quantity}</td><td class="num">${escapeHtml(money(price))}</td><td class="num">${escapeHtml(money(price * quantity))}</td></tr>`;
  }).join('');
  const address = addressLines(data.address).map(escapeHtml).join('<br>');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${escapeHtml(data.invoiceId)}</title><style>
    body{font-family:Arial,sans-serif;color:#172033;margin:0;padding:32px;background:#fff} .invoice{max-width:900px;margin:auto}
    header{display:flex;justify-content:space-between;border-bottom:3px solid #d49a2a;padding-bottom:20px} h1{margin:0;font-size:30px}.brand{font-size:24px;font-weight:800}.muted{color:#667085}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:26px 0}.box{border:1px solid #d9dee8;padding:16px}.box h3{font-size:13px;text-transform:uppercase;margin:0 0 10px;color:#667085}
    table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#172033;color:#fff;text-align:left;padding:11px}td{padding:12px 11px;border-bottom:1px solid #e5e7eb}.num{text-align:right}
    .totals{width:360px;margin:22px 0 0 auto}.total-line{display:flex;justify-content:space-between;padding:7px 0}.grand{border-top:2px solid #172033;margin-top:7px;padding-top:12px;font-size:20px;font-weight:800}
    footer{margin-top:38px;border-top:1px solid #d9dee8;padding-top:16px;text-align:center;color:#667085;font-size:12px}@media print{body{padding:0}}
  </style></head><body><main class="invoice"><header><div><div class="brand">${escapeHtml(data.settings.storeName || 'GIFTERY')}</div><div class="muted">${escapeHtml(data.settings.storeTagline || 'Corporate Gifts & Personalised Products')}</div></div><div style="text-align:right"><h1>TAX INVOICE</h1><div><strong>${escapeHtml(data.invoiceId)}</strong></div><div class="muted">${escapeHtml(formatDate(order.createdAt || new Date()))}</div></div></header>
  <section class="grid"><div class="box"><h3>Bill To</h3><strong>${escapeHtml(data.customerName)}</strong><br>${escapeHtml(data.customerEmail)}<br>${escapeHtml(data.address.phone || '')}</div><div class="box"><h3>Ship To</h3><strong>${escapeHtml(data.address.fullName || data.address.name || data.customerName)}</strong><br>${address}</div><div class="box"><h3>Order</h3>Status: ${escapeHtml(data.status)}<br>Payment: ${escapeHtml(data.paymentMethod)}</div><div class="box"><h3>Payment</h3>Status: ${escapeHtml(data.paymentStatus)}${data.transactionId ? `<br>Transaction: ${escapeHtml(data.transactionId)}` : ''}</div></section>
  <table><thead><tr><th>#</th><th>Item</th><th class="num">Qty</th><th class="num">Unit Price</th><th class="num">Amount</th></tr></thead><tbody>${rows || '<tr><td colspan="5">No item details available</td></tr>'}</tbody></table>
  <section class="totals"><div class="total-line"><span>Subtotal</span><strong>${escapeHtml(money(data.subtotal))}</strong></div>${data.discount ? `<div class="total-line"><span>Discount</span><strong>-${escapeHtml(money(data.discount))}</strong></div>` : ''}<div class="total-line"><span>Shipping</span><strong>${data.shipping ? escapeHtml(money(data.shipping)) : 'FREE'}</strong></div>${data.tax ? `<div class="total-line"><span>Included GST (${data.taxPercentage}%)</span><strong>${escapeHtml(money(data.tax))}</strong></div>` : ''}<div class="total-line grand"><span>Total</span><span>${escapeHtml(money(data.total))}</span></div></section>
  <footer>This is a computer-generated invoice. Thank you for shopping with GIFTERY.</footer></main></body></html>`;
};

const InvoiceModal = ({ order, user, onClose }) => {
  if (!order) return null;
  const data = getInvoiceData(order, user);
  const downloadInvoice = () => {
    const blob = new Blob([buildInvoiceHtml(order, user)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${data.invoiceId}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };
  const printInvoice = () => {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;
    printWindow.document.write(buildInvoiceHtml(order, user));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  return <div className={styles.overlay} onClick={onClose} role="presentation">
    <section className={styles.modal} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="invoice-title">
      <div className={styles.toolbar}>
        <button type="button" className={styles.actionBtn} onClick={downloadInvoice}><FiDownload aria-hidden="true" /> Download Invoice</button>
        <button type="button" className={styles.secondaryBtn} onClick={printInvoice}><FiPrinter aria-hidden="true" /> Print</button>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close invoice"><FiX aria-hidden="true" /></button>
      </div>
      <div className={styles.invoice}>
        <header className={styles.header}><div><div className={styles.brand}>{data.settings.storeName || 'GIFTERY'}</div><p>{data.settings.storeTagline || 'Corporate Gifts & Personalised Products'}</p></div><div className={styles.invoiceMeta}><h2 id="invoice-title">Tax Invoice</h2><strong>{data.invoiceId}</strong><span>{formatDate(order.createdAt || new Date())}</span></div></header>
        <div className={styles.summaryStrip}><div><span>Order Status</span><strong style={{ color: STATUS_COLORS[data.status] }}>{data.status}</strong></div><div><span>Payment Method</span><strong>{data.paymentMethod}</strong></div><div><span>Payment Status</span><strong>{data.paymentStatus}</strong></div></div>
        <div className={styles.infoGrid}><div><h3>Bill To</h3><strong>{data.customerName}</strong><span>{data.customerEmail}</span>{data.address.phone && <span>{data.address.phone}</span>}</div><div><h3>Ship To</h3><strong>{data.address.fullName || data.address.name || data.customerName}</strong>{addressLines(data.address).map((line) => <span key={line}>{line}</span>)}</div></div>
        <div className={styles.tableWrap}><table><thead><tr><th>Product Details</th><th>Unit Price</th><th>Qty</th><th>Line Total</th></tr></thead><tbody>{data.items.length ? data.items.map((item, index) => { const qty = Number(item.quantity || 1); const price = Number(item.price || item.unitPrice || item.product?.price || 0); const meta = getItemMeta(item); return <tr key={item.id || index}><td><div className={styles.productCell}><img src={getItemImage(item)} alt="" onError={(event) => { event.currentTarget.src = '/placeholder-product.png'; }} /><div><strong>{item.name || item.product?.name || 'Gift Item'}</strong>{meta.map((detail) => <span key={detail}>{detail}</span>)}</div></div></td><td>{money(price)}</td><td><strong>{qty}</strong></td><td><strong>{money(price * qty)}</strong></td></tr>; }) : <tr><td colSpan="4">No item details available</td></tr>}</tbody></table></div>
        <div className={styles.bottomGrid}><div className={styles.paymentBox}><h3>Payment Details</h3><span>Method: <strong>{data.paymentMethod}</strong></span><span>Status: <strong>{data.paymentStatus}</strong></span>{data.transactionId && <span>Transaction ID: <strong>{data.transactionId}</strong></span>}</div><div className={styles.totals}><div><span>Subtotal</span><strong>{money(data.subtotal)}</strong></div>{data.discount > 0 && <div className={styles.discount}><span>Discount</span><strong>-{money(data.discount)}</strong></div>}<div><span>Shipping</span><strong>{data.shipping > 0 ? money(data.shipping) : 'FREE'}</strong></div>{data.tax > 0 && <div><span>GST ({data.taxPercentage}%)</span><strong>{money(data.tax)}</strong></div>}<div className={styles.grandTotal}><span>Total Amount</span><strong>{money(data.total)}</strong></div></div></div>
        <p className={styles.note}>This is a computer-generated invoice. {data.settings.storeAddress && <span>{data.settings.storeAddress}</span>} {data.settings.supportEmail && <span>{data.settings.supportEmail}</span>}</p>
      </div>
    </section>
  </div>;
};

export default InvoiceModal;
