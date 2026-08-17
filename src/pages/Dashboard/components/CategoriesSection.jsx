import React, { useState, useMemo, useEffect } from 'react';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import styles from '../Dashboard.module.css';

const CategoriesSection = ({
  categories = [],
  products = [],
  showCategoryForm,
  editingCategory,
  savingCategory,
  categoryForm,
  resetCategoryForm,
  handleOpenAddCategory,
  handleEditCategoryClick,
  handleCategoryFormChange,
  handleCategoryImageFileChange,
  handleCategorySubmit,
  handleDeleteCategory,
}) => {
  // Navigation & View States
  const [activeParentFilter, setActiveParentFilter] = useState('all'); // 'all' | 'top_level' | parentId
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState(products || []);

  useEffect(() => {
    if (products && products.length > 0) {
      setAllProducts(products);
    } else {
      const fetchLiveProds = async () => {
        try {
          const res = await axiosInstance.get(ENDPOINTS.PRODUCTS.LIST + '?limit=300&showAll=true');
          const data = res.data || res;
          const list = Array.isArray(data) ? data : (data?.products || data?.data || []);
          if (Array.isArray(list)) setAllProducts(list);
        } catch (err) {
          console.warn('CategoriesSection live products fetch note:', err.message);
        }
      };
      fetchLiveProds();
    }
  }, [products]);

  // Dynamic Product count helper for any category / subcategory
  const getProductCount = (cat) => {
    if (!cat) return 0;

    let count = 0;
    if (Array.isArray(allProducts) && allProducts.length > 0) {
      const catId = cat.id;
      const catSlug = (cat.slug || '').toLowerCase();
      const catName = (cat.name || '').toLowerCase();

      allProducts.forEach(p => {
        if (cat.parentId) {
          // Subcategory matching
          const pSubId = p.subCategoryId;
          const pSubSlug = (p.subCategory?.slug || p.subCategorySlug || p.subcategorySlug || '').toLowerCase();
          const pSubName = (p.subCategory?.name || p.subCategoryName || p.subcategoryName || '').toLowerCase();
          const pName = (p.name || '').toLowerCase();
          const pDesc = (p.description || '').toLowerCase();

          if (pSubId && pSubId === catId) {
            count += 1;
          } else if (pSubSlug && pSubSlug === catSlug) {
            count += 1;
          } else if (pSubName && pSubName === catName) {
            count += 1;
          } else if (!pSubId && !pSubName && catName) {
            // Keyword fallback
            const words = catName.split(' ').filter(w => w.length > 3 && !['gifts', 'toys', 'kit', 'kits', 'all', 'products'].includes(w));
            if (words.length > 0 && words.some(w => pName.includes(w) || pDesc.includes(w))) {
              count += 1;
            }
          }
        } else {
          // Main category matching
          const pCatId = p.categoryId;
          const pCatSlug = (p.category?.slug || p.categorySlug || '').toLowerCase();
          const pCatName = (p.category?.name || p.categoryName || '').toLowerCase();

          if (pCatId && pCatId === catId) {
            count += 1;
          } else if (pCatSlug && pCatSlug === catSlug) {
            count += 1;
          } else if (pCatName && pCatName === catName) {
            count += 1;
          }
        }
      });
    }

    const dbCount = cat._count?.products || 0;
    return Math.max(count, dbCount);
  };

  // Extract Top-Level Main Categories and Subcategories
  const { mainCategories, parentCategoryGroups, stats } = useMemo(() => {
    const mainCats = categories.filter(c => !c.parentId);
    const subCats = categories.filter(c => c.parentId);

    // Map parent IDs to their child categories
    const groupsMap = new Map();

    // Initialize map for all main categories
    mainCats.forEach(main => {
      groupsMap.set(main.id, {
        parent: main,
        children: []
      });
    });

    // Add orphaned subcategories or populate children
    subCats.forEach(sub => {
      if (groupsMap.has(sub.parentId)) {
        groupsMap.get(sub.parentId).children.push(sub);
      } else {
        const unknownParent = categories.find(c => c.id === sub.parentId);
        if (unknownParent) {
          groupsMap.set(unknownParent.id, {
            parent: unknownParent,
            children: [sub]
          });
        } else {
          // Fallback if parent missing
          const fallbackKey = 'unassigned';
          if (!groupsMap.has(fallbackKey)) {
            groupsMap.set(fallbackKey, {
              parent: { id: 'unassigned', name: 'Other Subcategories', slug: 'other' },
              children: []
            });
          }
          groupsMap.get(fallbackKey).children.push(sub);
        }
      }
    });

    return {
      mainCategories: mainCats,
      parentCategoryGroups: Array.from(groupsMap.values()),
      stats: {
        total: categories.length,
        mainCount: mainCats.length,
        subCount: subCats.length
      }
    };
  }, [categories]);

  // List of Parent Categories that have tabs
  const parentFilterTabs = useMemo(() => {
    const tabs = [
      { id: 'all', label: 'All Categories', count: categories.length },
      { id: 'top_level', label: 'Top Level Only', count: mainCategories.length }
    ];

    // Add each main category as a tab
    mainCategories.forEach(mainCat => {
      const children = categories.filter(c => c.parentId === mainCat.id);
      tabs.push({
        id: mainCat.id,
        label: mainCat.name,
        count: children.length + 1, // Parent + children
        mainCategory: mainCat
      });
    });

    return tabs;
  }, [categories, mainCategories]);

  // Filtered categories according to tab filter and search query
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      // Search text match
      const matchesSearch =
        !searchQuery.trim() ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Tab Filter match
      if (activeParentFilter === 'all') return true;
      if (activeParentFilter === 'top_level') return !cat.parentId;

      // Specific Parent Category Tab selected: show parent itself AND its children
      return cat.id === activeParentFilter || cat.parentId === activeParentFilter;
    });
  }, [categories, activeParentFilter, searchQuery]);

  // Filtered Parent Category Groups for Grouped view
  const displayGroups = useMemo(() => {
    let groups = parentCategoryGroups;

    if (activeParentFilter === 'top_level') {
      groups = groups.map(g => ({ parent: g.parent, children: [] }));
    } else if (activeParentFilter !== 'all') {
      groups = groups.filter(g => g.parent.id === activeParentFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      groups = groups.map(g => ({
        parent: g.parent,
        children: g.children.filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
      })).filter(g =>
        g.parent.name.toLowerCase().includes(q) ||
        g.parent.slug.toLowerCase().includes(q) ||
        g.children.length > 0
      );
    }

    return groups;
  }, [parentCategoryGroups, activeParentFilter, searchQuery]);

  // Currently selected parent category object if a specific parent tab is active
  const selectedParentCategoryObj = mainCategories.find(m => m.id === activeParentFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Upper Stats Banner & Primary Actions Header */}
      <div className={styles.cardContainer} style={{ background: '#ffffff', padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h3 className={styles.cardTitle} style={{ fontSize: '1.2rem', color: '#0f172a' }}>
              Store Categories Management
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Organize store catalog with Parent Categories and Subcategories
            </p>
          </div>

          {/* Quick Counter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.4rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: '600' }}>Total:</span>
              <strong style={{ color: '#0f172a' }}>{stats.total}</strong>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.4rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: '600' }}>Main Parents:</span>
              <strong style={{ color: '#166534' }}>{stats.mainCount}</strong>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.4rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#1d4ed8', fontWeight: '600' }}>Subcategories:</span>
              <strong style={{ color: '#1e40af' }}>{stats.subCount}</strong>
            </div>
          </div>

          {/* Top Contextual Creation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => handleOpenAddCategory('')}
              style={{
                background: '#ffffff',
                color: '#d99b26',
                border: '1.5px solid #d99b26',
                fontWeight: '700',
                fontSize: '0.85rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              + Main Category
            </button>

            <button
              type="button"
              onClick={() => handleOpenAddCategory(selectedParentCategoryObj ? selectedParentCategoryObj.id : '')}
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
                transition: 'all 0.15s ease',
              }}
            >
              {selectedParentCategoryObj ? `+ Add to ${selectedParentCategoryObj.name}` : '+ Add New Category'}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar: Parent Category Tabs & View Switcher */}
      <div className={styles.cardContainer} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Row 1: Parent Category Filter Tabs */}
        <div>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>
              FILTER BY PARENT CATEGORY:
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem', scrollbarWidth: 'thin' }}>
            {parentFilterTabs.map(tab => {
              const isActive = activeParentFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveParentFilter(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? '700' : '600',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    border: isActive ? '1.5px solid #d99b26' : '1px solid #e2e8f0',
                    background: isActive ? '#fffcf5' : '#ffffff',
                    color: isActive ? '#92400e' : '#475569',
                    boxShadow: isActive ? '0 2px 6px rgba(217, 155, 38, 0.15)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      background: isActive ? '#d99b26' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#64748b',
                      fontSize: '0.72rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '10px',
                      fontWeight: '800',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Search Bar + View Mode Switcher Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '380px' }}>
            <input
              type="text"
              placeholder="Search category by name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              style={{
                paddingLeft: '0.85rem',
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

          {/* View Mode Toggle Buttons (Grouped View & List Table View) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', padding: '0.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={() => setViewMode('grouped')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                border: 'none',
                background: viewMode === 'grouped' ? '#ffffff' : 'transparent',
                color: viewMode === 'grouped' ? '#d99b26' : '#64748b',
                boxShadow: viewMode === 'grouped' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Grouped View
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                border: 'none',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#d99b26' : '#64748b',
                boxShadow: viewMode === 'table' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              List Table View
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Category Modal Window */}
      {showCategoryForm && (
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
            onSubmit={handleCategorySubmit}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                type="button"
                onClick={resetCategoryForm}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Name * */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Toys, Accessories, Corporate Gifts..."
                value={categoryForm.name}
                onChange={handleCategoryFormChange}
                className={styles.searchInput}
                style={{
                  paddingLeft: '0.85rem',
                  width: '100%',
                  height: '42px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Category Type / Parent Category */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                Parent Category Selection
              </label>
              <select
                name="parentId"
                value={categoryForm.parentId || ''}
                onChange={handleCategoryFormChange}
                className={styles.searchInput}
                style={{
                  paddingLeft: '0.85rem',
                  width: '100%',
                  height: '42px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  background: '#ffffff',
                }}
              >
                <option value="">— None (This is a Top-Level Main Category) —</option>
                {categories
                  .filter(c => !c.parentId && c.id !== editingCategory?.id)
                  .map(mainCat => (
                    <option key={mainCat.id} value={mainCat.id}>
                      Subcategory under "{mainCat.name}"
                    </option>
                  ))
                }
              </select>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                Select a parent category to create a <strong>Subcategory</strong>, or select <em>None</em> for a <strong>Top-Level Main Category</strong>.
              </span>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Optional description..."
                value={categoryForm.description}
                onChange={handleCategoryFormChange}
                className={styles.searchInput}
                style={{
                  padding: '0.65rem 0.85rem',
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Buttons: Cancel & Save */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={resetCategoryForm}
                style={{
                  padding: '0.6rem 1.5rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingCategory}
                style={{
                  padding: '0.6rem 1.75rem',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                }}
              >
                {savingCategory ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MAIN CONTENT DISPLAY BASED ON VIEW MODE */}

      {filteredCategories.length === 0 ? (
        <div className={styles.cardContainer} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ fontSize: '1rem', margin: 0 }}>No categories found matching your filter/search criteria.</p>
          <button
            type="button"
            onClick={() => handleOpenAddCategory(activeParentFilter !== 'all' && activeParentFilter !== 'top_level' ? activeParentFilter : '')}
            style={{ marginTop: '0.75rem', padding: '0.5rem 1.2rem', background: '#d99b26', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            + Create New Category
          </button>
        </div>
      ) : (
        <>
          {/* VIEW MODE 1: GROUPED SECTIONS VIEW */}
          {viewMode === 'grouped' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {displayGroups.map(group => {
                const isParentMain = group.parent.id !== 'unassigned';
                return (
                  <div key={group.parent.id} className={styles.cardContainer} style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                          {group.parent.name}
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Parent Category ({group.children.length} subcategories)
                        </span>
                      </div>

                      {isParentMain && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenAddCategory(group.parent.id)}
                            style={{
                              background: '#d99b26',
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.4rem 0.85rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            + Add Subcategory
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditCategoryClick(group.parent)}
                            style={{ padding: '0.4rem 0.75rem', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                          >
                            Edit Parent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(group.parent.id, group.parent.name)}
                            style={{ padding: '0.4rem 0.75rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                          >
                            Delete Parent
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Subcategories Table */}
                    {group.children.length === 0 ? (
                      <div style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>
                        No subcategories assigned to {group.parent.name}.
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table className={styles.ordersTable}>
                          <thead>
                            <tr>
                              <th>Subcategory Name</th>
                              <th>Slug</th>
                              <th>Products Count</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.children.map(sub => (
                              <tr key={sub.id}>
                                <td>
                                  <strong>{sub.name}</strong>
                                </td>
                                <td>
                                  <code style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', color: '#d99b26' }}>
                                    {sub.slug}
                                  </code>
                                </td>
                                <td>
                                  <span style={{ fontWeight: '700', color: '#1e293b' }}>
                                    {getProductCount(sub)} Products
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleEditCategoryClick(sub)}
                                      style={{ padding: '0.35rem 0.75rem', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCategory(sub.id, sub.name)}
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
                );
              })}
            </div>
          )}

          {/* VIEW MODE 2: STANDARD FLAT LIST TABLE VIEW */}
          {viewMode === 'table' && (
            <div className={styles.cardContainer} style={{ overflowX: 'auto' }}>
              <table className={styles.ordersTable}>
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Slug</th>
                    <th>Parent Category</th>
                    <th>Products Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map(cat => {
                    const parentCat = categories.find(c => c.id === cat.parentId);
                    return (
                      <tr key={cat.id}>
                        <td>
                          <strong>{cat.name}</strong>
                        </td>
                        <td>
                          <code style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', color: '#d99b26' }}>
                            {cat.slug}
                          </code>
                        </td>
                        <td>
                          {parentCat ? (
                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.7rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700', border: '1px solid #fde68a' }}>
                              {parentCat.name}
                            </span>
                          ) : (
                            <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.7rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700' }}>
                              Top Level Main
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontWeight: '700', color: '#1e293b' }}>
                            {getProductCount(cat)} Products
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => handleEditCategoryClick(cat)}
                              style={{ padding: '0.35rem 0.75rem', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
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
        </>
      )}
    </div>
  );
};

export default CategoriesSection;
