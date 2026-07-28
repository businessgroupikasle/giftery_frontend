import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import Button from '@components/ui/Button';
import { removeFromCart, updateQuantity, clearCart } from '@store/slices/cartSlice';
import { formatCurrency } from '@utils/formatters';
import { ROUTES } from '@constants/routes';
import styles from './Cart.module.css';

const Cart = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.cart);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!items.length) return (
    <Layout>
      <div className="flex-col-center section text-center" style={{ gap: '1rem' }}>
        <span style={{ fontSize: '4rem' }}>🛒</span>
        <h2>Your cart is empty</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Looks like you haven't added anything yet.</p>
        <Button as={Link} onClick={() => window.location.href = ROUTES.SHOP}>Start Shopping</Button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className={`container section ${styles.page}`}>
        <h1 className={styles.title}>Shopping Cart</h1>
        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.items}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <img src={item.image || '/placeholder.jpg'} alt={item.name} className={styles.itemImage} />
                <div className={styles.itemInfo}>
                  <Link to={ROUTES.PRODUCT.replace(':slug', item.slug)} className={styles.itemName}>{item.name}</Link>
                  <span className={styles.itemPrice}>{formatCurrency(item.price)}</span>
                </div>
                <div className={styles.qtyControls}>
                  <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))} disabled={item.quantity <= 1} aria-label="Decrease quantity">−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} aria-label="Increase quantity">+</button>
                </div>
                <span className={styles.lineTotal}>{formatCurrency(item.price * item.quantity)}</span>
                <button className={styles.remove} onClick={() => dispatch(removeFromCart(item.id))} aria-label={`Remove ${item.name}`}>🗑️</button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <div className={styles.summaryRow}><span>Subtotal</span><span>{formatCurrency(total)}</span></div>
            <div className={styles.summaryRow}><span>Shipping</span><span className="text-success">Free</span></div>
            <div className={`${styles.summaryRow} ${styles.total}`}><span>Total</span><span>{formatCurrency(total)}</span></div>
            <Link to={ROUTES.CHECKOUT} style={{ display: 'block' }}>
              <Button fullWidth size="lg">Proceed to Checkout →</Button>
            </Link>
            <button className={styles.clearBtn} onClick={() => dispatch(clearCart())}>Clear cart</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
