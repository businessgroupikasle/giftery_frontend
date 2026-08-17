import React, { useState, useRef } from 'react';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { toast } from 'react-toastify';
import { FiDownload, FiUploadCloud, FiFile, FiCheckCircle, FiAlertCircle, FiX, FiRefreshCw } from 'react-icons/fi';
import styles from './BulkImportModal.module.css';

const BulkImportModal = ({ isOpen, onClose, categories = [], onImportSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'create' | 'update' | 'error'
  const [searchQuery, setSearchQuery] = useState('');
  const [importSummary, setImportSummary] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // 1. Download official Excel Template from backend
  const handleDownloadTemplate = async () => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.PRODUCTS.BULK.TEMPLATE, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data || res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'product_bulk_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Excel Template downloaded successfully!');
    } catch (err) {
      console.error('Failed to download template:', err);
      toast.error('Failed to download Excel template');
    }
  };

  // 2. File Selection & Drag-and-drop
  const handleFileChange = (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.zip') && !name.endsWith('.csv')) {
      toast.error('Please select a valid Excel (.xlsx, .xls) or ZIP (.zip) file');
      return;
    }
    setSelectedFile(file);
    setValidationData(null);
    setImportSummary(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // 3. Validate File via Backend
  const handleValidateAndPreview = async () => {
    if (!selectedFile) {
      toast.error('Please select an Excel or ZIP file to validate');
      return;
    }

    setValidating(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await axiosInstance.post(ENDPOINTS.PRODUCTS.BULK.VALIDATE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = res.data?.data || res.data || res;
      setValidationData(data);
      if (data.summary?.invalid > 0) {
        toast.warning(`Found ${data.summary.valid} valid products and ${data.summary.invalid} invalid rows.`);
      } else {
        toast.success(`All ${data.summary.total} products are valid and ready to import!`);
      }
    } catch (err) {
      console.error('Validation error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Validation failed';
      toast.error(`Validation failed: ${errMsg}`);
    } finally {
      setValidating(false);
    }
  };

  // 4. Confirm and Execute Bulk Import
  const handleConfirmImport = async () => {
    if (!validationData || !validationData.rows) return;
    const validProducts = validationData.rows.filter(r => r.isValid).map(r => ({
      ...r.data,
      action: r.action,
    }));

    if (validProducts.length === 0) {
      toast.error('No valid products to import');
      return;
    }

    setImporting(true);
    try {
      const res = await axiosInstance.post(ENDPOINTS.PRODUCTS.BULK.IMPORT, {
        products: validProducts,
      });
      const result = res.data?.data || res.data || res;
      setImportSummary(result);
      toast.success(`Import completed: ${result.importedCount || 0} created, ${result.updatedCount || 0} updated!`);
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      console.error('Bulk import error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Bulk import failed';
      toast.error(`Import failed: ${errMsg}`);
    } finally {
      setImporting(false);
    }
  };

  // 5. Download Error Report
  const handleDownloadErrorReport = () => {
    if (!validationData) return;
    const invalidRows = validationData.rows.filter(r => !r.isValid);
    const report = invalidRows.map(r => ({
      'Row Number': r.rowNumber,
      'Product Name': r.data?.name || '',
      'SKU': r.data?.sku || '',
      'Errors': r.errors.join('; '),
    }));

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bulk_import_errors.json');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Filtered rows for preview table
  const filteredRows = (validationData?.rows || []).filter(r => {
    if (filterMode === 'create' && r.action !== 'CREATE') return false;
    if (filterMode === 'update' && r.action !== 'UPDATE') return false;
    if (filterMode === 'error' && r.isValid) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (r.data?.name || '').toLowerCase();
    const sku = (r.data?.sku || '').toLowerCase();
    const cat = (r.data?.mainCategoryName || '').toLowerCase();
    return name.includes(q) || sku.includes(q) || cat.includes(q);
  });

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h4 className={styles.modalTitle}>
              <span>📥</span> Bulk Import Products
            </h4>
            <p className={styles.modalSubtitle}>
              Upload an Excel (.xlsx) spreadsheet or ZIP archive with product images
            </p>
          </div>
          <button type="button" onClick={onClose} className={styles.closeButton} title="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          
          {/* Post-Import Success Summary Screen */}
          {importSummary ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                ✓
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>
                  Bulk Import Completed
                </h3>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                  Your product catalog has been updated in PostgreSQL database.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700, display: 'block' }}>New Products Created</span>
                  <strong style={{ fontSize: '1.3rem', color: '#16a34a' }}>✓ {importSummary.importedCount || 0}</strong>
                </div>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 700, display: 'block' }}>Products Updated</span>
                  <strong style={{ fontSize: '1.3rem', color: '#2563eb' }}>✓ {importSummary.updatedCount || 0}</strong>
                </div>

                {importSummary.failedCount > 0 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#991b1b', fontWeight: 700, display: 'block' }}>Failed Products</span>
                    <strong style={{ fontSize: '1.3rem', color: '#dc2626' }}>✕ {importSummary.failedCount}</strong>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                {importSummary.failedCount > 0 && (
                  <button type="button" onClick={handleDownloadErrorReport} className={styles.cancelBtn}>
                    Download Error Report
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                  }}
                  className={styles.importBtn}
                  style={{ background: '#0f172a' }}
                >
                  Close & View Products
                </button>
              </div>
            </div>
          ) : !validationData ? (
            // Step 1: Upload & Download Template Screen
            <>
              {/* Template Download Banner */}
              <div className={styles.templateBanner}>
                <div className={styles.templateBannerText}>
                  <h5>Download Standard Excel Template</h5>
                  <p>
                    Use the official template with pre-mapped columns for Name, SKU, Price, Stock, Category, Specs, Tags, Images & Collections.
                  </p>
                </div>
                <button type="button" onClick={handleDownloadTemplate} className={styles.downloadTemplateBtn}>
                  <FiDownload />
                  <span>Download Excel Template</span>
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div
                className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".xlsx,.xls,.zip,.csv"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />
                <FiUploadCloud className={styles.uploadIcon} />
                <h4 className={styles.dropZoneTitle}>
                  Drag & Drop your import ZIP or Excel file
                </h4>
                <p className={styles.dropZoneSubtitle}>
                  Excel + product images (ZIP) or standalone Excel spreadsheet (.xlsx, .xls)
                </p>
                <button type="button" className={styles.fileSelectLabel} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  Choose ZIP or Excel File
                </button>
              </div>

              {/* Selected File Box */}
              {selectedFile && (
                <div className={styles.selectedFileCard}>
                  <div className={styles.fileInfo}>
                    <FiFile style={{ fontSize: '1.4rem', color: '#d99b26' }} />
                    <div>
                      <div className={styles.fileName}>{selectedFile.name}</div>
                      <div className={styles.fileSize}>{(selectedFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </>
          ) : (
            // Step 2: Validation Preview Screen
            <>
              {/* Stat Summary Cards */}
              <div className={styles.statsRow}>
                <div className={`${styles.statCard} ${styles.statCardTotal}`}>
                  <span className={styles.statLabel}>Total Products</span>
                  <span className={`${styles.statValue} ${styles.statValueTotal}`}>{validationData.summary?.total || 0}</span>
                </div>
                <div className={`${styles.statCard} ${styles.statCardCreate}`}>
                  <span className={styles.statLabel}>New (CREATE)</span>
                  <span className={`${styles.statValue} ${styles.statValueCreate}`}>✓ {validationData.summary?.newCount || 0}</span>
                </div>
                <div className={`${styles.statCard} ${styles.statCardUpdate}`}>
                  <span className={styles.statLabel}>Update (UPDATE)</span>
                  <span className={`${styles.statValue} ${styles.statValueUpdate}`}>↻ {validationData.summary?.updateCount || 0}</span>
                </div>
                <div className={`${styles.statCard} ${styles.statCardInvalid}`}>
                  <span className={styles.statLabel}>Invalid (ERROR)</span>
                  <span className={`${styles.statValue} ${styles.statValueInvalid}`}>✕ {validationData.summary?.invalid || 0}</span>
                </div>
              </div>

              {/* Filter Pills & Search */}
              <div className={styles.filterBar}>
                <div className={styles.filterPills}>
                  <button
                    type="button"
                    className={`${styles.filterPill} ${filterMode === 'all' ? styles.filterPillActive : ''}`}
                    onClick={() => setFilterMode('all')}
                  >
                    All ({validationData.summary?.total || 0})
                  </button>
                  <button
                    type="button"
                    className={`${styles.filterPill} ${filterMode === 'create' ? styles.filterPillActive : ''}`}
                    onClick={() => setFilterMode('create')}
                  >
                    New ({validationData.summary?.newCount || 0})
                  </button>
                  <button
                    type="button"
                    className={`${styles.filterPill} ${filterMode === 'update' ? styles.filterPillActive : ''}`}
                    onClick={() => setFilterMode('update')}
                  >
                    Updates ({validationData.summary?.updateCount || 0})
                  </button>
                  <button
                    type="button"
                    className={`${styles.filterPill} ${filterMode === 'error' ? styles.filterPillActive : ''}`}
                    onClick={() => setFilterMode('error')}
                  >
                    Errors ({validationData.summary?.invalid || 0})
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Filter preview by name, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    width: '220px',
                  }}
                />
              </div>

              {/* Preview Table */}
              <div className={styles.tableWrapper}>
                <table className={styles.previewTable}>
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Action</th>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Category</th>
                      <th>Subcategory</th>
                      <th>Images</th>
                      <th>Status & Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r, idx) => {
                      const isValid = r.isValid;
                      return (
                        <tr key={idx} className={isValid ? styles.rowValid : styles.rowInvalid}>
                          <td><strong>#{r.rowNumber}</strong></td>
                          <td>
                            {r.action === 'CREATE' && <span className={styles.actionBadgeCreate}>CREATE</span>}
                            {r.action === 'UPDATE' && <span className={styles.actionBadgeUpdate}>UPDATE</span>}
                            {r.action === 'ERROR' && <span className={styles.actionBadgeError}>ERROR</span>}
                          </td>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{r.data?.name || '—'}</strong>
                          </td>
                          <td>
                            <code style={{ fontSize: '0.76rem', background: '#f1f5f9', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
                              {r.data?.sku || 'Auto'}
                            </code>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: '#d99b26' }}>
                              ₹{Number(r.data?.price || 0).toLocaleString('en-IN')}
                            </span>
                            {r.data?.comparePrice && (
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                ₹{Number(r.data.comparePrice).toLocaleString('en-IN')}
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{ fontWeight: 700 }}>{r.data?.stock || 0}</span>
                          </td>
                          <td>
                            <span style={{ background: '#fffcf5', color: '#92400e', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 600 }}>
                              {r.data?.mainCategoryName || '—'}
                            </span>
                          </td>
                          <td>
                            {r.data?.subcategoryName ? (
                              <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 600 }}>
                                {r.data.subcategoryName}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.74rem' }}>None</span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.74rem', color: '#475569' }}>
                              {r.data?.images?.length || 0} {r.data?.images?.length === 1 ? 'img' : 'imgs'}
                            </span>
                          </td>
                          <td>
                            {isValid ? (
                              <span className={styles.statusPillValid}>✓ Valid</span>
                            ) : (
                              <div>
                                <span className={styles.statusPillInvalid}>✕ Error</span>
                                <ul className={styles.errorList}>
                                  {r.errors.map((err, errIdx) => (
                                    <li key={errIdx}>{err}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>

        {/* Footer Actions */}
        {!importSummary && (
          <div className={styles.modalFooter}>
            {!validationData ? (
              <>
                <button type="button" onClick={onClose} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleValidateAndPreview}
                  disabled={!selectedFile || validating}
                  className={styles.importBtn}
                >
                  {validating ? (
                    <>
                      <FiRefreshCw className="spinIcon" />
                      <span>Validating Rows...</span>
                    </>
                  ) : (
                    <span>Validate & Preview Products</span>
                  )}
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setValidationData(null);
                    }}
                    className={styles.cancelBtn}
                  >
                    ← Re-upload File
                  </button>
                  <button type="button" onClick={onClose} className={styles.cancelBtn}>
                    Cancel
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={!validationData.summary?.valid || importing}
                  className={styles.importBtn}
                >
                  {importing ? (
                    <>
                      <FiRefreshCw className="spinIcon" />
                      <span>Importing & Processing Images...</span>
                    </>
                  ) : (
                    <span>
                      Import {validationData.summary?.valid || 0} Valid Products
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default BulkImportModal;