import { useState } from 'react';
import { FaWhatsapp, FaDownload } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import styles from './FloatingWidgets.module.css';

const EMPTY_FORM = { name: '', email: '', phone: '', company: '' };

const FloatingWidgets = () => {
  const [downloading, setDownloading] = useState(false);
  const [showCatalogueForm, setShowCatalogueForm] = useState(false);
  const [catalogueForm, setCatalogueForm] = useState(EMPTY_FORM);

  const downloadCatalogue = () => {
    const content = `GIFTERY — PREMIUM GIFTS & LASTING IMPRESSIONS
PRODUCT CATALOGUE 2026

Store Locations:
1. Giftery Corporate Gift Store, 39, Ramachandra Rd, R.S. Puram, Coimbatore, Tamil Nadu 641002
2. Giftery Toys & Custom Gifts Store, Ramanathapuram, Coimbatore, Tamil Nadu 641045

Contact: +91 70101 21945 | giftery2023@gmail.com

COLLECTIONS:
• Corporate Gifts: Executive Hampers, Leather Keychains, Engraved Pens, Custom Flasks
• Personalized Gifts: 3D Acrylic Frames, Caricatures, Engraved Clocks, Wooden Plaques
• Toys & Games: STEM Kits, Kinetic Desk Toys, Mechanical Brain Teasers, RC Cars`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Giftery_Corporate_Gifts_Catalogue_2026.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const updateField = (field) => (event) => {
    const value = field === 'phone'
      ? event.target.value.replace(/\D/g, '').slice(0, 10)
      : event.target.value;
    setCatalogueForm((current) => ({ ...current, [field]: value }));
  };

  const handleCatalogueSubmit = async (event) => {
    event.preventDefault();
    if (downloading) return;

    const email = catalogueForm.email.trim();
    const phone = catalogueForm.phone.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const indianPhonePattern = /^[6-9]\d{9}$/;

    if (!emailPattern.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (!indianPhonePattern.test(phone)) {
      toast.error('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setDownloading(true);
    try {
      await axiosInstance.post(ENDPOINTS.ENQUIRIES.SUBMIT, {
        name: catalogueForm.name.trim(),
        email,
        phone,
        subject: 'Catalogue Request',
        message: `Company: ${catalogueForm.company.trim() || 'Not provided'}\nRequested the Giftery product catalogue.`,
      });
      downloadCatalogue();
      setShowCatalogueForm(false);
      setCatalogueForm(EMPTY_FORM);
      window.dispatchEvent(new Event('enquiries_updated'));
      toast.success('Details saved. Catalogue downloaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Could not save your details. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={styles.floatingContainer} aria-label="Quick contact and catalogue widgets">
      <button type="button" className={styles.CatalogueBtn} onClick={() => setShowCatalogueForm(true)} title="Download Product Catalogue" aria-label="Download Product Catalogue">
        <FaDownload className={styles.icon} />
        <span className={styles.tooltip}>Download Catalogue</span>
      </button>

      <a href="https://wa.me/917010121945?text=Hello%20Giftery%2C%20I%20would%20like%20to%20know%20more%20about%20your%20corporate%20and%20personalized%20gifts." target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn} title="Chat on WhatsApp" aria-label="Chat on WhatsApp">
        <FaWhatsapp className={styles.icon} />
        <span className={styles.tooltip}>Chat on WhatsApp</span>
      </a>

      {showCatalogueForm && (
        <div className={styles.catalogueOverlay} onClick={() => !downloading && setShowCatalogueForm(false)}>
          <div className={styles.catalogueModal} onClick={(event) => event.stopPropagation()}>
            <button type="button" className={styles.modalClose} onClick={() => setShowCatalogueForm(false)} aria-label="Close"><FiX /></button>
            <div className={styles.modalIcon}><FaDownload /></div>
            <h2>Download Catalogue</h2>
            <p>Share your basic details to access our latest gifting catalogue.</p>
            <form onSubmit={handleCatalogueSubmit} className={styles.catalogueForm}>
              <label>Full Name<input required value={catalogueForm.name} onChange={updateField('name')} placeholder="Enter your name" /></label>
              <label>Email Address<input required type="email" inputMode="email" autoComplete="email" value={catalogueForm.email} onChange={updateField('email')} placeholder="name@company.com" /></label>
              <label>Phone Number<input required type="tel" inputMode="numeric" autoComplete="tel" minLength={10} maxLength={10} pattern="[6-9][0-9]{9}" title="Enter a valid 10-digit Indian mobile number" value={catalogueForm.phone} onChange={updateField('phone')} placeholder="e.g. 9876543210" /></label>
              <label>Company Name <span>(Optional)</span><input value={catalogueForm.company} onChange={updateField('company')} placeholder="Enter company name" /></label>
              <button type="submit" disabled={downloading}>{downloading ? 'Saving...' : 'Submit & Download'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingWidgets;
