import { FiFolder } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const CategoriesSection = ({
  categories,
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className={styles.cardContainer}>
        <div className={styles.cardHeaderRow}>
          <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiFolder style={{ color: '#d99b26' }} />
            <span>Store Categories ({categories.length})</span>
          </h3>
          <button
            type="button"
            className={styles.viewAllBtn}
            onClick={handleOpenAddCategory}
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
            + Add New Category
          </button>
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
                maxWidth: '560px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button type="button" onClick={resetCategoryForm} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              {/* Name * */}
              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
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
                  Category Type / Parent Category
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
                  <option value="">— None (This is a Main Category) —</option>
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
                  Select a parent category to create a <strong>Subcategory</strong>, or select <em>None</em> for a <strong>Main Category</strong>.
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
                  {savingCategory ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Table */}
        {categories.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <FiFolder style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
            <p>No categories found. Click <strong>"+ Add New Category"</strong> to create one.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Parent Category</th>
                  <th>Products Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => {
                  const parentCat = categories.find(c => c.id === cat.parentId);
                  return (
                    <tr key={cat.id}>
                      <td>
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} onError={(e) => { e.target.style.display='none'; }} />
                        ) : (
                          <div style={{ width: '44px', height: '44px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.2rem' }}>📁</div>
                        )}
                      </td>
                      <td>
                        <strong>{cat.name}</strong>
                      </td>
                      <td>
                        <code style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', color: '#d99b26' }}>{cat.slug}</code>
                      </td>
                      <td>
                        {parentCat ? (
                          <span style={{ background: '#e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '600' }}>{parentCat.name}</span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Top Level</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: '700', color: '#1e293b' }}>{cat._count?.products ?? 0} Products</span>
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
      </div>
    </div>
  );
};

export default CategoriesSection;
