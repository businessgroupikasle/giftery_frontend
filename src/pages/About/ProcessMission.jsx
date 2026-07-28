import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import styles from './About.module.css';

const ProcessMission = () => {
  return (
    <section className={styles.splitSection}>
      {/* Left Half: OUR PROCESS */}
      <div className={styles.splitLeft}>
        <span className={styles.processSubheading}>OUR PROCESS</span>
        <h2 className={styles.processTitle}>From Idea to Impression</h2>

        <div className={styles.processStepsRow}>
          {/* Step 1 */}
          <div className={styles.processStepItem}>
            <div className={styles.dashedArrowLine}>
              <span className={styles.arrowHead}>▶</span>
            </div>
            <div className={styles.blackBadgeCircle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <h4 className={styles.stepTitleBold}>1. Select</h4>
            <p className={styles.stepDescLight}>Choose from our wide range of products</p>
          </div>

          {/* Step 2 */}
          <div className={styles.processStepItem}>
            <div className={styles.dashedArrowLine}>
              <span className={styles.arrowHead}>▶</span>
            </div>
            <div className={styles.blackBadgeCircle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </div>
            <h4 className={styles.stepTitleBold}>2. Customize</h4>
            <p className={styles.stepDescLight}>Add your logo, message and branding</p>
          </div>

          {/* Step 3 */}
          <div className={styles.processStepItem}>
            <div className={styles.dashedArrowLine}>
              <span className={styles.arrowHead}>▶</span>
            </div>
            <div className={styles.blackBadgeCircle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <h4 className={styles.stepTitleBold}>3. Manufacture</h4>
            <p className={styles.stepDescLight}>Precision crafted with premium quality</p>
          </div>

          {/* Step 4 */}
          <div className={styles.processStepItem}>
            <div className={styles.blackBadgeCircle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <h4 className={styles.stepTitleBold}>4. Deliver</h4>
            <p className={styles.stepDescLight}>On-time delivery across India, with care</p>
          </div>
        </div>

        <Link to={ROUTES.SHOP} className={styles.exploreBtn}>
          EXPLORE PRODUCTS &rarr;
        </Link>
      </div>

      {/* Right Half: OUR MISSION */}
      <div className={styles.splitRight}>
        <div className={styles.missionContent}>
          <span className={styles.missionSubheading}>OUR MISSION</span>
          <h2 className={styles.missionTitle}>
            To Make Every Gift<br />
            <span className={styles.goldText}>A Powerful Gesture</span>
          </h2>

          <p className={styles.missionDesc}>
            We aim to help businesses express gratitude, celebrate achievements and build lasting relationships through thoughtful and premium gifting solutions.
          </p>

          <div className={styles.scriptSignature}>Team Giftery</div>
        </div>

        {/* Right Visual Image */}
        <div className={styles.missionVisual}>
          <img
            src="/images/about_mission_bag_set.png"
            alt="Giftery Mission Black Shopping Bag & Gift Items"
            className={styles.bagImg}
          />
        </div>
      </div>
    </section>
  );
};

export default ProcessMission;
