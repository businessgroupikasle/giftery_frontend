import React, { useState, useMemo } from 'react';
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

// Helper function to resolve product's Main Category ID robustly
const resolveMainCategoryId = (product, categoriesList) => {
  const catId = product.categoryId || (typeof product.category === 'object' ? product.category?.id : product.category);
  const subId = product.subCategoryId || (typeof product.subcategory === 'object' ? product.subcategory?.id : product.subcategory) || (typeof product.subCategory === 'object' ? product.subCategory?.id : product.subCategory);

  // 1. Try finding by catId directly
  if (catId) {
    const matchedCat = categoriesList.find(c => c.id === catId || c.slug === catId || String(c.name).toLowerCase() === String(catId).toLowerCase());
    if (matchedCat) {
      if (!matchedCat.parentId) return matchedCat.id; // Direct Main Category
      // If it's a subcategory, return its parent Main Category ID
      const parentCat = categoriesList.find(c => c.id === matchedCat.parentId);
      if (parentCat) return parentCat.id;
    }
  }

  // 2. Try finding by subId
  if (subId) {
    const matchedSub = categoriesList.find(c => c.id === subId || c.slug === subId || String(c.name).toLowerCase() === String(subId).toLowerCase());
    if (matchedSub && matchedSub.parentId) {
      const parentCat = categoriesList.find(c => c.id === matchedSub.parentId);
      if (parentCat) return parentCat.id;
      return matchedSub.parentId;
    }
  }

  // 3. Try matching by category name string
  if (product.category?.name || (typeof product.category === 'string' && product.category)) {
    const catName = String(product.category?.name || product.category).toLowerCase().trim();
    const matchedByName = categoriesList.find(c => !c.parentId && c.name.toLowerCase().trim() === catName);
    if (matchedByName) return matchedByName.id;

    const matchedSubByName = categoriesList.find(c => c.parentId && c.name.toLowerCase().trim() === catName);
    if (matchedSubByName && matchedSubByName.parentId) return matchedSubByName.parentId;
  }

  return 'unassigned';
};

const ProductsSection = ({
  productsList = [],
  categories = [],
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
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all'); // 'all' | mainCategoryId | 'unassigned'
  const [searchQuery, setSearchQuery] = useState('');

  const handleCloseModal = () => {
    setMaxSlots(1);
    resetProductForm();
  };

  // Map Main Categories & Group Products strictly by Main Category with Counts
  const { mainCategories, mainCategoryGroups, stats } = useMemo(() => {
    const mainCats = categories.filter(c => !c.parentId);

    const groupsMap = new Map();

    mainCats.forEach(main => {
      groupsMap.set(main.id, {
        mainCategory: main,
        products: []
      });
    });

    const unassignedGroupKey = 'unassigned';
    groupsMap.set(unassignedGroupKey, {
      mainCategory: { id: 'unassigned', name: 'Unassigned Category' },
      products: []
    });

    // Group each product by robust main category resolution
    productsList.forEach(p => {
      const mainId = resolveMainCategoryId(p, categories);
      if (groupsMap.has(mainId)) {
        groupsMap.get(mainId).products.push(p);
      } else {
        groupsMap.get(unassignedGroupKey).products.push(p);
      }
    });

    const activeGroups = Array.from(groupsMap.values());

    return {
      mainCategories: mainCats,
      mainCategoryGroups: activeGroups,
      stats: {
        total: productsList.length,
        withCategory: productsList.filter(p => resolveMainCategoryId(p, categories) !== 'unassigned').length,
        unassigned: productsList.filter(p => resolveMainCategoryId(p, categories) === 'unassigned').length
      }
    };
  }, [categories, productsList]);

  // Filtered Products List for Table View
  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      // Category filter
      if (activeCategoryFilter !== 'all') {
        const pMainId = resolveMainCategoryId(p, categories);
        if (pMainId !== activeCategoryFilter) return false;
      }

      // Search text filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const tagsStr = Array.isArray(p.tags) ? p.tags.join(' ') : String(p.tags || '');
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q)) ||
        (p.subcategory?.name && p.subcategory.name.toLowerCase().includes(q)) ||
        tagsStr.toLowerCase().includes(q)
      );
    });
  }, [productsList, categories, activeCategoryFilter, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Banner: Title, Interactive Category Filter Buttons, Searchbar & Add Button */}
      <div className={styles.cardContainer} style={{ background: '#ffffff', padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h3 className={styles.cardTitle} style={{ fontSize: '1.2rem', color: '#0f172a' }}>
              Products Management ({filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'})
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Click any category pill to filter products in List View
            </p>
          </div>

          {/* Interactive Main Category Filter Pills with Live Product Counts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            
            {/* 'All Products' Filter Pill */}
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('all')}
              style={{
                background: activeCategoryFilter === 'all' ? '#fffcf5' : '#f8fafc',
                border: activeCategoryFilter === 'all' ? '1.5px solid #d99b26' : '1px solid #e2e8f0',
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: activeCategoryFilter === 'all' ? '700' : '600',
                color: activeCategoryFilter === 'all' ? '#92400e' : '#475569',
                cursor: 'pointer',
                boxShadow: activeCategoryFilter === 'all' ? '0 2px 6px rgba(217, 155, 38, 0.2)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>All Products:</span>
              <strong style={{ background: activeCategoryFilter === 'all' ? '#d99b26' : '#cbd5e1', color: '#ffffff', fontSize: '0.72rem', padding: '0.1rem 0.45rem', borderRadius: '10px' }}>
                {stats.total}
              </strong>
            </button>

            {/* Main Category Filter Pills */}
            {mainCategoryGroups.map(group => {
              // Skip unassigned if count is 0
              if (group.products.length === 0 && group.mainCategory.id === 'unassigned') return null;
              
              const isSelected = activeCategoryFilter === group.mainCategory.id;
              return (
                <button
                  key={group.mainCategory.id}
                  type="button"
                  onClick={() => setActiveCategoryFilter(isSelected ? 'all' : group.mainCategory.id)}
                  style={{
                    background: isSelected ? '#fffcf5' : '#ffffff',
                    border: isSelected ? '1.5px solid #d99b26' : '1px solid #fde68a',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? '700' : '600',
                    color: isSelected ? '#92400e' : '#b45309',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 2px 8px rgba(217, 155, 38, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <span>{group.mainCategory.name}:</span>
                  <span
                    style={{
                      background: '#d99b26',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '10px',
                      fontWeight: '800',
                    }}
                  >
                    {group.products.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Side Corner Container: Searchbar & Add New Product Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
            
            {/* Search Input on Right Side Corner */}
            <div style={{ position: 'relative', width: '260px' }}>
              <input
                type="text"
                placeholder="Search products by name, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                style={{
                  paddingLeft: '0.85rem',
                  paddingRight: searchQuery ? '2rem' : '0.85rem',
                  width: '100%',
                  height: '38px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Add New Product Button */}
            <button
              type="button"
              onClick={() => {
                setMaxSlots(1);
                handleOpenAddProduct(activeCategoryFilter !== 'all' && activeCategoryFilter !== 'unassigned' ? activeCategoryFilter : '');
              }}
              style={{
                background: 'linear-gradient(135deg, #d99b26 0%, #b87c12 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.85rem',
                padding: '0.55rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(217, 155, 38, 0.35)',
                whiteSpace: 'nowrap',
              }}
            >
              + Add New Product
            </button>
          </div>
        </div>
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

            {/* Row 2: Price + Compare Price + Stock */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
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
            </div>

            {/* Row 3: Main Category & Subcategory Selection */}
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
                  {mainCategories.map(mainCat => (
                    <option key={mainCat.id} value={mainCat.id}>{mainCat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Subcategory (Optional)</label>
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
                    {!productForm.categoryId ? '— Select Main Category First —' : '— Select Subcategory (Optional) —'}
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

            {/* Description */}
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

            {/* Specifications */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Specifications <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Key: Value pairs)</span>
              </label>
              <textarea
                name="specifications"
                rows={3}
                value={productForm.specifications || ''}
                onChange={handleProductFormChange}
                placeholder="Material: Genuine Leather&#10;Dimensions: 15cm x 10cm&#10;Color: Matte Black"
                className={styles.searchInput}
                style={{ padding: '0.65rem 0.85rem', width: '100%', resize: 'vertical', fontFamily: 'inherit', borderRadius: '8px' }}
              />
            </div>

            {/* Product Tags / Search Keywords */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Product Tags & Search Keywords <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Comma separated, e.g. luxury, leather, onboarding, office)</span>
              </label>
              <input
                type="text"
                name="tags"
                value={productForm.tags || ''}
                onChange={handleProductFormChange}
                placeholder="e.g. luxury, leather, onboarding, corporate gift, bottle"
                className={styles.searchInput}
                style={{ paddingLeft: '0.85rem', width: '100%', height: '42px', borderRadius: '8px' }}
              />
            </div>

            {/* Product Image Slots */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                  Product Images
                </label>
                {maxSlots < 4 && (
                  <button
                    type="button"
                    onClick={() => setMaxSlots((prev) => Math.min(prev + 1, 4))}
                    style={{ background: 'none', border: 'none', color: '#d99b26', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add More Image Slot
                  </button>
                )}
              </div>

              {(() => {
                const imageList = parseImages(productForm.images);
                const slotsCount = Math.max(1, maxSlots, imageList.length);
                const slots = Array.from({ length: slotsCount });

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                    {slots.map((_, idx) => {
                      const imgUrl = imageList[idx] || '';
                      return (
                        <div
                          key={idx}
                          style={{
                            border: '1px border #cbd5e1',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            overflow: 'hidden',
                            height: '110px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                          }}
                        >
                          {imgUrl ? (
                            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                              <img src={imgUrl} alt={`Product ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <div style={{ position: 'absolute', bottom: '4px', right: '4px', display: 'flex', gap: '4px' }}>
                                <label style={{ background: '#ffffff', color: '#334155', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 700 }}>
                                  Edit
                                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageFileUpload(e.target.files?.[0], idx, imageList, handleProductFormChange)} />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...imageList];
                                    updated.splice(idx, 1);
                                    handleProductFormChange({ target: { name: 'images', value: updated.filter(Boolean).join('|||') } });
                                  }}
                                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 700 }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '0.3rem', color: '#64748b' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>+ Upload Image</span>
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageFileUpload(e.target.files?.[0], idx, imageList, handleProductFormChange)} />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Homepage Display Collections & Store Visibility */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '0.65rem' }}>
                Show Product on Homepage Tabs & Store Collections:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={!!productForm.isFeatured || !!productForm.featured}
                    onChange={(e) => {
                      handleProductFormChange(e);
                      handleProductFormChange({ target: { name: 'featured', value: e.target.checked, type: 'checkbox', checked: e.target.checked } });
                    }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#d99b26' }}
                  />
                  Featured Products
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  <input
                    type="checkbox"
                    name="isBestseller"
                    checked={!!productForm.isBestseller}
                    onChange={handleProductFormChange}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#d99b26' }}
                  />
                  Best Sellers
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  <input
                    type="checkbox"
                    name="isPopular"
                    checked={!!productForm.isPopular}
                    onChange={handleProductFormChange}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#d99b26' }}
                  />
                  Popular Products
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={!!productForm.isNewArrival}
                    onChange={handleProductFormChange}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#d99b26' }}
                  />
                  New Arrivals
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  <input
                    type="checkbox"
                    name="isMostLoved"
                    checked={!!productForm.isMostLoved}
                    onChange={handleProductFormChange}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#d99b26' }}
                  />
                  Most Loved
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  <input
                    type="checkbox"
                    name="isGiftSet"
                    checked={!!productForm.isGiftSet}
                    onChange={handleProductFormChange}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#d99b26' }}
                  />
                  Gift Sets
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, color: '#059669' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={productForm.isActive !== false}
                    onChange={handleProductFormChange}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#059669' }}
                  />
                  Active (Store Visible)
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" onClick={handleCloseModal} style={{ padding: '0.65rem 1.4rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#475569' }}>Cancel</button>
              <button
                type="submit"
                disabled={savingProduct}
                style={{ padding: '0.65rem 1.75rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.25)' }}
              >
                {savingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MAIN PRODUCTS DISPLAY - LIST VIEW TABLE */}
      {loadingProducts ? (
        <div className={styles.cardContainer} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
          Loading products from database...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={styles.cardContainer} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ fontSize: '1rem', margin: 0 }}>No products found matching your search/category filter.</p>
          <button
            type="button"
            onClick={() => {
              setMaxSlots(1);
              handleOpenAddProduct();
            }}
            style={{ marginTop: '0.75rem', padding: '0.5rem 1.2rem', background: '#d99b26', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            + Add Product
          </button>
        </div>
      ) : (
        <div className={styles.cardContainer} style={{ overflowX: 'auto' }}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Main Category</th>
                <th>Subcategory</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const mainId = resolveMainCategoryId(product, categories);
                const mainCat = categories.find(c => c.id === mainId);
                const mainCatName = mainCat?.name || product.category?.name || 'Unassigned';
                const subCatName = product.subcategory?.name || product.subCategory?.name;

                return (
                  <tr key={product.id}>
                    <td>
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} onError={(e) => { e.target.style.display='none'; }} />
                      ) : (
                        <div style={{ width: '44px', height: '44px', background: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>No Img</div>
                      )}
                    </td>
                    <td>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9rem' }}>{product.name}</strong>
                      {product.sku && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>SKU: {product.sku}</span>}
                    </td>
                    <td>
                      <span style={{ background: '#fffcf5', color: '#92400e', border: '1px solid #fde68a', padding: '0.2rem 0.65rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700' }}>
                        {mainCatName}
                      </span>
                    </td>
                    <td>
                      {subCatName ? (
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '600' }}>
                          {subCatName}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>None</span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#d99b26', fontSize: '0.9rem' }}>₹{product.price?.toLocaleString('en-IN')}</strong>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductsSection;
