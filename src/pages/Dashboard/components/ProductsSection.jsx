import { useState } from 'react';
import { FiBox, FiSave, FiUpload, FiPlus, FiImage } from 'react-icons/fi';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-toastify';
import styles from '../Dashboard.module.css';

const parseImages = (imgs) => {
  if (!imgs) return [];
  if (Array.isArray(imgs)) return imgs.map((s) => String(s).trim()).filter(Boolean);
  if (typeof imgs === 'string') {
    const trimmed = imgs.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
      } catch (e) {}
    }
    if (trimmed.includes('|||')) {
      return trimmed.split('|||').map((s) => s.trim()).filter(Boolean);
    }
    if (trimmed.startsWith('data:')) {
      return [trimmed];
    }
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const handleImageFileUpload = (file, idx, imageList, handleProductFormChange) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (evt) => {
    const dataUrl = evt.target?.result;
    if (!dataUrl) return;

    try {
      const res = await axiosInstance.post('/upload', { image: dataUrl });
      const uploadedUrl = res.data?.data?.url || res.data?.url;
      if (uploadedUrl) {
        const updated = [...imageList];
        updated[idx] = uploadedUrl;
        handleProductFormChange({ target: { name: 'images', value: updated.filter(Boolean).join('|||') } });
        toast.success('Image saved directly to backend Uploads directory!');
        return;
      }
    } catch (err) {
      console.warn('Backend upload endpoint fallback:', err.message);
    }

    const updated = [...imageList];
    updated[idx] = dataUrl;
    handleProductFormChange({ target: { name: 'images', value: updated.filter(Boolean).join('|||') } });
  };
  reader.readAsDataURL(file);
};

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
  const [maxSlots, setMaxSlots] = useState(1);

  const handleCloseModal = () => {
    setMaxSlots(1);
    resetProductForm();
  };

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
            onClick={() => {
              setMaxSlots(1);
              handleOpenAddProduct();
            }}
            style={{
              background: 'linear-gradient(135deg, #d99b26 0%, #b87c12 100%)',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '0.92rem',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(217, 155, 38, 0.35)',
              transition: 'all 0.15s ease',
            }}
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
                  {editingProduct ? `Edit Product — ${editingProduct.name}` : 'Add New Product'}
                </h4>
                <button type="button" onClick={handleCloseModal} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              {/* Row 1: Name + SKU */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Product Name *</label>
                  <input type="text" name="name" required value={productForm.name} onChange={handleProductFormChange} placeholder="e.g. Premium Gift Hamper" className={styles.searchInput} style={{ paddingLeft: '0.85rem', width: '100%', height: '42px', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>SKU</label>
                  <input type="text" name="sku" value={productForm.sku} onChange={handleProductFormChange} placeholder="e.g. GH-2024-001" className={styles.searchInput} style={{ paddingLeft: '0.85rem', width: '100%', height: '42px', borderRadius: '8px' }} />
                </div>
              </div>

              {/* Row 2: Price + Compare Price + Stock + Weight */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Price (₹) *</label>
                  <input type="number" name="price" required min="0" step="0.01" value={productForm.price} onChange={handleProductFormChange} placeholder="999" className={`${styles.searchInput} ${styles.noSpinner}`} style={{ paddingLeft: '0.85rem', width: '100%', height: '42px', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Compare Price (₹)</label>
                  <input type="number" name="comparePrice" min="0" step="0.01" value={productForm.comparePrice} onChange={handleProductFormChange} placeholder="1299" className={`${styles.searchInput} ${styles.noSpinner}`} style={{ paddingLeft: '0.85rem', width: '100%', height: '42px', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Stock Qty *</label>
                  <input type="number" name="stock" min="0" value={productForm.stock} onChange={handleProductFormChange} placeholder="50" className={`${styles.searchInput} ${styles.noSpinner}`} style={{ paddingLeft: '0.85rem', width: '100%', height: '42px', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Weight (kg)</label>
                  <input type="number" name="weight" min="0" step="0.01" value={productForm.weight} onChange={handleProductFormChange} placeholder="0.5" className={`${styles.searchInput} ${styles.noSpinner}`} style={{ paddingLeft: '0.85rem', width: '100%', height: '42px', borderRadius: '8px' }} />
                </div>
              </div>

              {/* Row 3: Main Category & Related Subcategory */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Main Category *</label>
                  <select
                    name="categoryId"
                    required
                    value={productForm.categoryId}
                    onChange={handleProductFormChange}
                    className={styles.searchInput}
                    style={{ paddingLeft: '0.85rem', width: '100%', cursor: 'pointer', height: '42px', borderRadius: '8px' }}
                  >
                    <option value="">— Select Main Category —</option>
                    {categories.filter(c => !c.parentId).map(mainCat => (
                      <option key={mainCat.id} value={mainCat.id}>{mainCat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Related Subcategory (Optional)</label>
                  <select
                    name="subCategoryId"
                    value={productForm.subCategoryId || ''}
                    onChange={handleProductFormChange}
                    disabled={!productForm.categoryId}
                    className={styles.searchInput}
                    style={{
                      paddingLeft: '0.85rem',
                      width: '100%',
                      cursor: !productForm.categoryId ? 'not-allowed' : 'pointer',
                      height: '42px',
                      borderRadius: '8px',
                      opacity: !productForm.categoryId ? 0.6 : 1,
                      background: !productForm.categoryId ? '#f1f5f9' : '#ffffff',
                    }}
                  >
                    <option value="">
                      {!productForm.categoryId ? '— First Select Main Category —' : '— Select Related Subcategory —'}
                    </option>
                    {productForm.categoryId &&
                      categories
                        .filter(c => c.parentId === productForm.categoryId)
                        .map(subCat => (
                          <option key={subCat.id} value={subCat.id}>
                            {subCat.name}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Single Form Fields Stacked */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 1. Description */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    value={productForm.description || ''}
                    onChange={handleProductFormChange}
                    placeholder="Describe the product in detail..."
                    className={styles.searchInput}
                    style={{ padding: '0.65rem 0.85rem', width: '100%', resize: 'vertical', fontFamily: 'inherit', borderRadius: '8px' }}
                  />
                </div>

                {/* 2. Specifications */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Specifications <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Key: Value pairs formatted into a clean table on product page)</span>
                  </label>
                  <textarea
                    name="specifications"
                    rows={4}
                    value={productForm.specifications || ''}
                    onChange={handleProductFormChange}
                    placeholder="Material: Genuine Italian Leather & Stainless Steel&#10;Dimensions: 15cm x 10cm x 5cm&#10;Weight: 350 grams&#10;Branding: High Precision Laser Engraving&#10;Color Options: Matte Black & Gold Accent"
                    className={styles.searchInput}
                    style={{ padding: '0.65rem 0.85rem', width: '100%', resize: 'vertical', fontFamily: 'inherit', borderRadius: '8px' }}
                  />
                </div>

                {/* 2b. Customization Options */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Customization Details <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Logo uploading guidelines, engraving limits & packaging options)</span>
                  </label>
                  <textarea
                    name="customization"
                    rows={3}
                    value={productForm.customization || ''}
                    onChange={handleProductFormChange}
                    placeholder="Custom logo laser engraving available. Max 25 characters name engraving. Comes with premium black velvet gift box."
                    className={styles.searchInput}
                    style={{ padding: '0.65rem 0.85rem', width: '100%', resize: 'vertical', fontFamily: 'inherit', borderRadius: '8px' }}
                  />
                </div>

                {/* 2c. Shipping & Returns */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Shipping & Returns Info <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Delivery timeline & return policies)</span>
                  </label>
                  <textarea
                    name="shippingReturns"
                    rows={2}
                    value={productForm.shippingReturns || ''}
                    onChange={handleProductFormChange}
                    placeholder="Dispatches in 2-3 business days. Free standard shipping on orders above ₹999. 7 days return & replacement policy."
                    className={styles.searchInput}
                    style={{ padding: '0.65rem 0.85rem', width: '100%', resize: 'vertical', fontFamily: 'inherit', borderRadius: '8px' }}
                  />
                </div>

                {/* 3. Reviews & Rating */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Rating (1.0 - 5.0)
                    </label>
                    <input
                      type="number"
                      name="rating"
                      step="0.1"
                      min="1"
                      max="5"
                      value={productForm.rating || '4.8'}
                      onChange={handleProductFormChange}
                      className={styles.searchInput}
                      style={{ paddingLeft: '0.85rem', width: '100%', height: '42px', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Reviews Count
                    </label>
                    <input
                      type="number"
                      name="reviewsCount"
                      value={productForm.reviewsCount || '128'}
                      onChange={handleProductFormChange}
                      className={styles.searchInput}
                      style={{ paddingLeft: '0.85rem', width: '100%', height: '42px', borderRadius: '8px' }}
                    />
                  </div>
                </div>

                {/* 6. Extra Tags */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Extra Product Tags <span style={{ fontWeight: 400, color: '#94a3b8' }}>(comma-separated e.g. Best Seller, Trending, Eco-Friendly, Luxury)</span>
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={productForm.tags || ''}
                    onChange={handleProductFormChange}
                    placeholder="Best Seller, Trending, New Arrival, Corporate, Personalized"
                    className={styles.searchInput}
                    style={{ paddingLeft: '0.85rem', width: '100%', height: '42px', borderRadius: '8px' }}
                  />
                </div>

                {/* Homepage Collection Badges & Tabs Checkboxes */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    Homepage Collections &amp; Filter Tabs
                  </label>
                  <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
                    Select which collection tabs on the homepage (&quot;Explore Our Collections&quot;) this product should appear in when ticked:
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={!!productForm.isFeatured || !!productForm.featured}
                        onChange={handleProductFormChange}
                        style={{ width: '16px', height: '16px', accentColor: '#1b4332', cursor: 'pointer' }}
                      />
                      <span>Featured Products</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                      <input
                        type="checkbox"
                        name="isBestseller"
                        checked={!!productForm.isBestseller}
                        onChange={handleProductFormChange}
                        style={{ width: '16px', height: '16px', accentColor: '#1b4332', cursor: 'pointer' }}
                      />
                      <span>Best Sellers</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                      <input
                        type="checkbox"
                        name="isPopular"
                        checked={!!productForm.isPopular}
                        onChange={handleProductFormChange}
                        style={{ width: '16px', height: '16px', accentColor: '#1b4332', cursor: 'pointer' }}
                      />
                      <span>Popular Products</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                      <input
                        type="checkbox"
                        name="isNewArrival"
                        checked={!!productForm.isNewArrival}
                        onChange={handleProductFormChange}
                        style={{ width: '16px', height: '16px', accentColor: '#1b4332', cursor: 'pointer' }}
                      />
                      <span>New Arrivals</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                      <input
                        type="checkbox"
                        name="isMostLoved"
                        checked={!!productForm.isMostLoved}
                        onChange={handleProductFormChange}
                        style={{ width: '16px', height: '16px', accentColor: '#1b4332', cursor: 'pointer' }}
                      />
                      <span>Most Loved</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                      <input
                        type="checkbox"
                        name="isGiftSet"
                        checked={!!productForm.isGiftSet}
                        onChange={handleProductFormChange}
                        style={{ width: '16px', height: '16px', accentColor: '#1b4332', cursor: 'pointer' }}
                      />
                      <span>Gift Sets</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Row 5: Product Images Upload Slots (Matching User's Screenshot Design) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                    Product Images <span style={{ color: '#64748b', fontWeight: 400 }}>(max {Math.max(maxSlots, parseImages(productForm.images).length)})</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMaxSlots((prev) => prev + 1)}
                    style={{
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '0.25rem 0.65rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <FiPlus /> Add More Image Option
                  </button>
                </div>

                {/* Grid of Dashed Upload Boxes */}
                {(() => {
                  const imageList = parseImages(productForm.images);
                  const totalSlotsCount = Math.max(maxSlots, imageList.length);

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                      {Array.from({ length: totalSlotsCount }).map((_, idx) => {
                        const imgUrl = imageList[idx];
                        const slotLabel = idx === 0 ? 'IMAGE 1 • PRIMARY' : idx === 1 ? 'IMAGE 2 • HOVER' : `IMAGE ${idx + 1} • GALLERY`;

                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: idx === 0 ? '#d99b26' : idx === 1 ? '#2563eb' : '#64748b', letterSpacing: '0.5px' }}>
                              {slotLabel}
                            </span>
                            <div
                              style={{
                                height: '180px',
                                border: imgUrl ? '1.5px solid #cbd5e1' : '2px dashed #cbd5e1',
                                borderRadius: '12px',
                                background: imgUrl ? '#ffffff' : '#f8fafc',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {imgUrl ? (
                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                  <img src={imgUrl} alt={`Product Image ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  
                                  {/* Floating top right delete badge */}
                                  <button
                                    type="button"
                                    title="Remove image"
                                    onClick={() => {
                                      const updated = [...imageList];
                                      updated.splice(idx, 1);
                                      handleProductFormChange({ target: { name: 'images', value: updated.join(', ') } });
                                    }}
                                    style={{
                                      position: 'absolute',
                                      top: '6px',
                                      right: '6px',
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      background: '#ef4444',
                                      color: '#ffffff',
                                      border: 'none',
                                      fontSize: '0.75rem',
                                      fontWeight: '900',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                      zIndex: 2,
                                    }}
                                  >
                                    ✕
                                  </button>

                                  {/* Bottom Action Bar: Change Image + Remove Image */}
                                  <div
                                    style={{
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      background: 'rgba(15, 23, 42, 0.88)',
                                      padding: '0.35rem 0.5rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      zIndex: 3,
                                    }}
                                  >
                                    <label
                                      title="Change / Replace Image"
                                      style={{
                                        color: '#38bdf8',
                                        fontSize: '0.68rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                      }}
                                    >
                                      🔄 Change
                                      <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleImageFileUpload(e.target.files?.[0], idx, imageList, handleProductFormChange)}
                                      />
                                    </label>

                                    <button
                                      type="button"
                                      title="Remove image"
                                      onClick={() => {
                                        const updated = [...imageList];
                                        updated.splice(idx, 1);
                                        handleProductFormChange({ target: { name: 'images', value: updated.filter(Boolean).join('|||') } });
                                      }}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#f87171',
                                        fontSize: '0.68rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        padding: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                      }}
                                    >
                                      🗑️ Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <label
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    gap: '0.4rem',
                                    color: '#64748b',
                                  }}
                                >
                                  <FiImage style={{ fontSize: '2rem', color: '#94a3b8' }} />
                                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Upload</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleImageFileUpload(e.target.files?.[0], idx, imageList, handleProductFormChange)}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                  Image 1 is shown by default. Image 2 appears on hover in the product listing.
                </p>
              </div>

              {/* Row 6: Toggles without emojis */}
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  <input type="checkbox" name="featured" checked={productForm.featured} onChange={handleProductFormChange} style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: '#d99b26' }} />
                  Featured Product
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  <input type="checkbox" name="isActive" checked={productForm.isActive} onChange={handleProductFormChange} style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: '#059669' }} />
                  Active (visible on store)
                </label>
              </div>

              {/* Form Actions without icon */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={handleCloseModal} style={{ padding: '0.65rem 1.4rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#475569' }}>Cancel</button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  style={{ padding: '0.65rem 1.75rem', background: '#d99b26', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(217,155,38,0.3)' }}
                >
                  {savingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
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
