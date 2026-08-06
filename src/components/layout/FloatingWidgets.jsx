import { useState } from 'react';
import { FaWhatsapp, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styles from './FloatingWidgets.module.css';

const FloatingWidgets = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadCatalog = (e) => {
    e.preventDefault();
    if (downloading) return;
    setDownloading(true);
    toast.info('Preparing Giftery Product Catalog...');

    const catalogContent = `============================================================
      GIFTERY — PREMIUM GIFTS & LASTING IMPRESSIONS
                PRODUCT CATALOG 2026
============================================================
Store Locations:
1. Giftery Corporate Gift Store:
   39, Ramachandra Rd, R.S. Puram, Coimbatore, Tamil Nadu 641002
2. Giftery Toys & Custom Gifts Store:
   Ramanathapuram, Coimbatore, Tamil Nadu 641045

Contact:
Phone: +91 70101 21945
Email: giftery2023@gmail.com
Website: https://giftery.com

COLLECTIONS & HIGHLIGHTS:
------------------------------------------------------------
• Corporate Gifts: Executive Hampers, Leather Keychains, Engraved Pens, Custom Flasks
• Personalized Gifts: 3D Acrylic Frames, Caricatures, Engraved Clocks, Wooden Plaques
• Toys & Games: STEM Kits, Kinetic Desk Toys, Mechanical Brain Teasers, RC Cars
============================================================`;

    try {
      const blob = new Blob([catalogContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Giftery_Corporate_Gifts_Catalog_2026.txt');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setDownloading(false);
        toast.success('Giftery Catalog Downloaded Successfully!');
      }, 600);
    } catch (err) {
      setDownloading(false);
      toast.error('Failed to download catalog. Please try again.');
    }
  };

  return (
    <div className={styles.floatingContainer} aria-label="Quick contact and catalog widgets">
      {/* 1. Download Catalog Button */}
      <button
        type="button"
        className={styles.catalogBtn}
        onClick={handleDownloadCatalog}
        title="Download Product Catalog"
        aria-label="Download Product Catalog"
      >
        <FaDownload className={styles.icon} />
        <span className={styles.tooltip}>Download Catalog</span>
      </button>

      {/* 2. WhatsApp Direct Chat Button */}
      <a
        href="https://wa.me/917010121945?text=Hello%20Giftery%2C%20I%20would%20like%20to%20know%20more%20about%20your%20corporate%20and%20personalized%20gifts."
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappBtn}
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className={styles.icon} />
        <span className={styles.tooltip}>Chat on WhatsApp</span>
      </a>
    </div>
  );
};

export default FloatingWidgets;
