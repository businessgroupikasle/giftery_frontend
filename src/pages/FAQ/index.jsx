import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, 
  FiChevronDown, 
  FiHelpCircle, 
  FiBriefcase, 
  FiGift, 
  FiTruck, 
  FiCreditCard, 
  FiRefreshCw, 
  FiPhoneCall, 
  FiMail, 
  FiMessageSquare,
  FiSmile
} from 'react-icons/fi';
import { ROUTES } from '@constants/routes';
import styles from './FAQ.module.css';

const FAQ_DATA = [
  // 🏢 Corporate & Bulk Gifts
  {
    id: 'corp-1',
    category: 'corporate',
    categoryName: 'Corporate & Bulk Gifts',
    icon: FiBriefcase,
    question: 'What is the Minimum Order Quantity (MOQ) for corporate gifts?',
    answer: `Our minimum order quantity for corporate custom gifts generally starts at 20 units per item. For premium executive gift hampers or high-end tech accessories, custom lower MOQs (e.g. 5 to 10 units) are also available. Please reach out to our corporate sales team for flexible packaging options.`,
  },
  {
    id: 'corp-2',
    category: 'corporate',
    categoryName: 'Corporate & Bulk Gifts',
    icon: FiBriefcase,
    question: 'Can we print our company logo and custom branding on products?',
    answer: `Yes, absolutely! We offer complete custom branding services including Laser Engraving, UV Digital Printing, Screen Printing, Debossing/Embossing on leather notebooks, and custom ribbon/box branding with your corporate logo and brand colors.`,
  },
  {
    id: 'corp-3',
    category: 'corporate',
    categoryName: 'Corporate & Bulk Gifts',
    icon: FiBriefcase,
    question: 'Do you offer GST invoices and bulk business discounts?',
    answer: `Yes! All corporate orders come with a 100% tax-compliant B2B GST invoice so your business can claim Input Tax Credit (ITC). We also offer volume-based tiered discounts for orders over 50, 100, and 500+ units.`,
  },
  {
    id: 'corp-4',
    category: 'corporate',
    categoryName: 'Corporate & Bulk Gifts',
    icon: FiBriefcase,
    question: 'How long does corporate gift production and delivery take?',
    answer: `Standard production for customized corporate gifts takes 5 to 7 business days after mock-up approval. Express dispatch (3-4 days) is available for urgent events, product launches, or work anniversaries.`,
  },

  // 🎨 Custom Personalization
  {
    id: 'pers-1',
    category: 'personalized',
    categoryName: 'Custom & Personalized Gifts',
    icon: FiGift,
    question: 'What types of personalized gifts can I order on Giftery?',
    answer: `We specialize in Photo Frames, High-Gloss Acrylic Frames, Custom 3D Caricatures, Wooden Photo Engravings, Personalized Wall & Desk Clocks, Customized LED Lamps, Name-Engraved Pens, and Custom Leather Keychains.`,
  },
  {
    id: 'pers-2',
    category: 'personalized',
    categoryName: 'Custom & Personalized Gifts',
    icon: FiGift,
    question: 'How do I submit high-resolution photos and recipient names?',
    answer: `During checkout or after placing your order, you can upload your photos and text directly via our design preview modal or email them along with your Order ID to giftery2023@gmail.com. Our design team will send a digital proof before printing!`,
  },
  {
    id: 'pers-3',
    category: 'personalized',
    categoryName: 'Custom & Personalized Gifts',
    icon: FiGift,
    question: 'Can individual recipient names be printed for employee gifts?',
    answer: `Yes! For team hampers, onboarding kits, or work anniversary gifts, each item can be individually personalized with the employee's full name, designation, or custom message.`,
  },

  // 🧸 Toys & Kids Products
  {
    id: 'toys-1',
    category: 'toys',
    categoryName: 'Toys & Children Gifts',
    icon: FiSmile,
    question: 'Are all toys on Giftery safety certified and non-toxic?',
    answer: `Yes! All our toys, educational kits, soft plushies, and building blocks comply strictly with BIS (Bureau of Indian Standards) quality norms, using non-toxic, BPA-free, child-safe materials.`,
  },

  // 🚚 Shipping & Delivery
  {
    id: 'ship-1',
    category: 'shipping',
    categoryName: 'Shipping & Delivery',
    icon: FiTruck,
    question: 'Do you deliver across Coimbatore, Tamil Nadu, and PAN India?',
    answer: `Yes! We ship across all pincodes in India. Local delivery in Coimbatore is available within 24 to 48 hours. Express PAN India delivery via premium courier partners (BlueDart, Delhivery, DTDC) takes 2 to 5 business days.`,
  },
  {
    id: 'ship-2',
    category: 'shipping',
    categoryName: 'Shipping & Delivery',
    icon: FiTruck,
    question: 'Can you ship corporate hampers directly to multiple employee addresses?',
    answer: `Yes! We offer Multi-Address Direct Employee Shipping. Simply provide us your address Excel sheet, and we will package, label, and deliver individual hampers directly to your remote team members' doorsteps anywhere in India.`,
  },

  // 💳 Payments & Invoicing
  {
    id: 'pay-1',
    category: 'payments',
    categoryName: 'Payments & Financials',
    icon: FiCreditCard,
    question: 'What payment methods do you accept?',
    answer: `We accept Credit/Debit Cards (Visa, MasterCard, Amex, Discover), UPI (Google Pay, PhonePe, Paytm), Net Banking, Razorpay, Cash on Delivery (COD for select retail orders), and Direct NEFT/RTGS Bank Transfers for corporate Purchase Orders (POs).`,
  },

  // 🔄 Returns & Replacements
  {
    id: 'ret-1',
    category: 'returns',
    categoryName: 'Returns & Defect Policy',
    icon: FiRefreshCw,
    question: 'What is your replacement policy for damaged or transit-affected items?',
    answer: `If any product arrives damaged or defective, notify us within 48 hours of delivery with an unboxing photo/video. We will immediately dispatch a free replacement without any hassle!`,
  },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Questions', icon: FiHelpCircle },
  { id: 'corporate', label: 'Corporate Gifts', icon: FiBriefcase },
  { id: 'personalized', label: 'Personalized Gifts', icon: FiGift },
  { id: 'toys', label: 'Toys & Kids', icon: FiSmile },
  { id: 'shipping', label: 'Shipping & Delivery', icon: FiTruck },
  { id: 'payments', label: 'Payments', icon: FiCreditCard },
  { id: 'returns', label: 'Returns & Support', icon: FiRefreshCw },
];

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(FAQ_DATA[0].id);

  const toggleAccordion = (id) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((faq) => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      const matchesQuery =
        searchQuery.trim() === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className={styles.faqPage}>
      {/* Hero Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <span className={styles.badgeLabel}>
            <FiHelpCircle style={{ color: '#d99b26' }} /> Help Center &amp; Support
          </span>
          <h1 className={styles.heroTitle}>Frequently Asked Questions</h1>
          <p className={styles.heroSubtitle}>
            Everything you need to know about Giftery corporate hampers, custom logo branding, bulk pricing, delivery timelines, and returns.
          </p>

          {/* Search Box */}
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by topic, e.g., corporate logo, delivery, MOQ, GST..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className={styles.mainContainer}>
        {/* Category Tabs */}
        <div className={styles.categoryTabs}>
          {CATEGORY_TABS.map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tabBtn} ${isActive ? styles.activeTabBtn : ''}`}
                onClick={() => setActiveCategory(tab.id)}
              >
                <IconComp className={styles.tabIcon} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <div className={styles.resultsBar}>
          <span>
            Showing <strong>{filteredFaqs.length}</strong> {filteredFaqs.length === 1 ? 'question' : 'questions'}
            {activeCategory !== 'all' ? ` in ${CATEGORY_TABS.find(t => t.id === activeCategory)?.label}` : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </span>
        </div>

        {/* Accordion List */}
        {filteredFaqs.length > 0 ? (
          <div className={styles.accordionList}>
            {filteredFaqs.map((faq) => {
              const isOpen = expandedId === faq.id;
              const IconComp = faq.icon;

              return (
                <div 
                  key={faq.id} 
                  className={`${styles.accordionItem} ${isOpen ? styles.itemOpen : ''}`}
                >
                  <button
                    type="button"
                    className={styles.accordionHeader}
                    onClick={() => toggleAccordion(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <div className={styles.headerLeft}>
                      <span className={styles.faqIconCircle}>
                        <IconComp />
                      </span>
                      <div>
                        <span className={styles.categoryBadge}>{faq.categoryName}</span>
                        <h3 className={styles.questionText}>{faq.question}</h3>
                      </div>
                    </div>
                    <span className={`${styles.chevronBox} ${isOpen ? styles.chevronRotated : ''}`}>
                      <FiChevronDown />
                    </span>
                  </button>

                  {isOpen && (
                    <div className={styles.accordionBody}>
                      <p className={styles.answerText}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.noResultsBox}>
            <FiHelpCircle size={48} className={styles.noResultsIcon} />
            <h3>No questions found</h3>
            <p>We couldn't find any questions matching your search term "{searchQuery}".</p>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
            >
              Reset Search &amp; Filters
            </button>
          </div>
        )}

        {/* Still Have Questions Contact Banner */}
        <div className={styles.contactBanner}>
          <div className={styles.contactLeft}>
            <div className={styles.contactIconCircle}>
              <FiMessageSquare />
            </div>
            <div>
              <h3>Still have questions?</h3>
              <p>Our gifting experts in Coimbatore are ready to assist you with custom quotes, sample requests, or corporate orders.</p>
            </div>
          </div>

          <div className={styles.contactActions}>
            <a href="tel:+917010121945" className={styles.callBtn}>
              <FiPhoneCall /> +91 70101 21945
            </a>
            <Link to={ROUTES.CONTACT} className={styles.contactPageBtn}>
              <FiMail /> Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
