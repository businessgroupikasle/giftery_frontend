import styles from './OurProcess.module.css';

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Select',
    desc: 'Choose from our wide range of premium products.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c58b29" strokeWidth="1.8">
        <path d="M20 12v10H4V12"></path>
        <path d="M22 7H2v5h20V7z"></path>
        <path d="M12 22V7"></path>
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Customize',
    desc: 'Personalize with your logo, message & branding.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c58b29" strokeWidth="1.8">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Manufacture',
    desc: 'We craft your order with quality & precision.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c58b29" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Deliver',
    desc: 'Timely delivery across India, safely to your doorstep.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c58b29" strokeWidth="1.8">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    ),
  },
];

const OurProcess = () => {
  return (
    <section className={styles.processSection}>
      <div className={styles.processContainer}>
        <span className={styles.processSubheading}>OUR PROCESS</span>
        <h2 className={styles.processTitle}>
          Simple Steps, <span className={styles.titleGold}>Perfect Gifts</span>
        </h2>

        <div className={styles.stepsRow}>
          {PROCESS_STEPS.map((step, idx) => (
            <div key={step.number} className={styles.stepItem}>
              {/* Connector dashed line */}
              {idx < PROCESS_STEPS.length - 1 && (
                <div className={styles.connectorLine}>
                  <span className={styles.connectorDot} />
                </div>
              )}

              <div className={styles.iconCircle}>{step.icon}</div>
              <div className={styles.stepNumber}>{step.number}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurProcess;
