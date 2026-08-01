import { FiBox, FiSave } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const ProductsSection = ({
  productsList,
  categories,
  loadingProducts,
  showProductForm,
  editingProduct,
  savingProduct,
  productForm,
  resetProductForm,
  handleOpenAddProduct,
  handleEditProductClick,
  handleProductFormChange,
  handleProductSubmit,
  handleDeleteProduct,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Products Header Row */}
      <div className={styles.cardContainer}>
        <div className={styles.cardHeaderRow}>
          <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiBox style={{ color: '#d99b26' }} />
            <span>All Products ({productsList.length})</span>
          </h3>
          <button
            type="button"
            className={styles.viewAllBtn}
            onClick={handleOpenAddProduct}
            style={{ background: '#d99b26', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}
          >
            + Add New Product
          </button>
        </div>

        {/* Add / Edit Product Modal Window */}
        {showProductForm && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={resetProductForm}
          >
            <form
              onSubmit={handleProductSubmit}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxWidth: '720px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#1e293b' }}>
                  {editingProduct ? `✏️ Edit Product — ${editingProduct.name}` : '➕ Add New Product'}
                </h4>
                <button type="button" onClick={resetProductForm} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              {/* Row 1: Name + SKU */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Product Name *</label>
                  <input type="text" name="name" required value={productForm.name} onChange={handleProductFormChange} placeholder="e.g. Premium Gift Hamper" className={styles.searchInput} style={{ paddingLeft: '0.85rem', width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>SKU</label>
                  <input type="text" name="sku" value={productForm.sku} onChange={handleProductFormChange} placeholder="e.g. GH-2024-001" className={styles.searchInput} style={{ paddingLeft: '0.85rem', width: '100%' }} />
                </div>
              </div>

              {/* Row 2: Price + Compare Price + Stock + Weight */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Price (₹) *</label>
                  <input type="number" name="price" required min="0" step="0.01" value={productForm.price} onChange={handleProductFormChange} placeholder="999" className={styles.searchInput} style={{ paddingLeft: '0.85rem', width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Compare Price (₹)</label>
                  <input type="number" name="comparePrice" min="0" step="0.01" value={productForm.comparePrice} onChange={handleProductFormChange} placeholder="1299" className={styles.searchInput} style={{ paddingLeft: '0.85rem', width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Stock Qty *</label>
                  <input type="number" name="stock" min="0" value={productForm.stock} onChange={handleProductFormChange} placeholder="50" className={styles.searchInput} style={{ paddingLeft: '0.85rem', width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Weight (kg)</label>
                  <input type="number" name="weight" min="0" step="0.01" value={productForm.weight} onChange={handleProductFormChange} placeholder="0.5" className={styles.searchInput} style={{ paddingLeft: '0.85rem', width: '100%' }} />
                </div>
              </div>

              {/* Row 3: Category */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Category *</label>
                <select name="categoryId" required value={productForm.categoryId} onChange={handleProductFormChange} className={styles.searchInput} style={{ paddingLeft: '0.85rem', width: '100%', cursor: 'pointer' }}>
                  <option value="">— Select Category —</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Row 4: Description */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Description *</label>
                <textarea name="description" required rows={3} value={productForm.description} onChange={handleProductFormChange} placeholder="Describe the product in detail..." className={styles.searchInput} style={{ paddingLeft: '0.85rem', width: '100%', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              {/* Row 5: Images */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Image URLs * <span style={{ fontWeight: 400, color: '#94a3b8' }}>(comma-separated)</span></label>
                <input type="text" name="images" value={productForm.images} onChange={handleProductFormChange} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" className={styles.searchInput} style={{ paddingLeft: '0.85rem', width: '100%' }} />
              </div>

              {/* Row 6: Toggles */}
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input type="checkbox" name="featured" checked={productForm.featured} onChange={handleProductFormChange} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  ⭐ Featured Product
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input type="checkbox" name="isActive" checked={productForm.isActive} onChange={handleProductFormChange} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  ✅ Active (visible on store)
                </label>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={resetProductForm} style={{ padding: '0.65rem 1.25rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#475569' }}>Cancel</button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  style={{ padding: '0.65rem 1.75rem', background: '#d99b26', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(217,155,38,0.3)' }}
                >
                  <FiSave />
                  <span>{savingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        {loadingProducts ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading products from database...</div>
        ) : productsList.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <FiBox style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
            <p>No products yet. Click <strong>"+ Add New Product"</strong> to get started.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsList.map(product => (
                  <tr key={product.id}>
                    <td>
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} onError={(e) => { e.target.style.display='none'; }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.2rem' }}>📦</div>
                      )}
                    </td>
                    <td>
                      <strong style={{ display: 'block' }}>{product.name}</strong>
                      {product.sku && <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>SKU: {product.sku}</span>}
                    </td>
                    <td><span style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' }}>{product.category?.name || '—'}</span></td>
                    <td>
                      <strong style={{ color: '#d99b26' }}>₹{product.price?.toLocaleString('en-IN')}</strong>
                      {product.comparePrice && <div style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{product.comparePrice?.toLocaleString('en-IN')}</div>}
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: product.stock > 10 ? '#16a34a' : product.stock > 0 ? '#ea580c' : '#dc2626' }}>{product.stock}</span>
                    </td>
                    <td>
                      <span className={`${styles.pillStatus} ${product.isActive ? styles.pillDelivered : styles.pillCancelled}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {product.featured ? <span style={{ fontSize: '1.1rem' }}>⭐</span> : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleEditProductClick(product)}
                          style={{ padding: '0.35rem 0.75rem', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          style={{ padding: '0.35rem 0.75rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsSection;
