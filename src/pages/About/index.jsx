import Layout from '@components/layout/Layout';
import AboutHero from './AboutHero';
import OurStory from './OurStory';
import ProcessMission from './ProcessMission';
import OurValues from './OurValues';
import OurTeam from './OurTeam';
import AboutCTA from './AboutCTA';
import styles from './About.module.css';

const About = () => {
  return (
    <Layout>
      <div className={styles.aboutPage}>
        {/* ── 1. Hero Section ── */}
        <AboutHero />

        {/* ── 2. Our Story Section ── */}
        <OurStory />

        {/* ── 3. Split Process & Mission Section ── */}
        <ProcessMission />

        {/* ── 4. Our Values Section ── */}
        <OurValues />

        {/* ── 5. Our Team Section ── */}
        <OurTeam />

        {/* ── 6. CTA Banner Section ── */}
        <AboutCTA />
      </div>
    </Layout>
  );
};

export default About;
