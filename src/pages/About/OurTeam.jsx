import styles from './About.module.css';

const TEAM_MEMBERS = [
  {
    id: '01',
    name: 'Suhail Badhusha',
    role: 'Business Development Officer',
    image: '/images/team_member_1.png',
  },
  {
    id: '02',
    name: 'Clinton Mendez',
    role: 'Sales Manager',
    image: '/images/team_member_2.png',
  },
  {
    id: '03',
    name: 'Veera',
    role: 'Admin & Accounts',
    image: '/images/team_member_3.png',
  },
  {
    id: '04',
    name: 'Vishnu V',
    role: 'Sales Manager',
    image: '/images/team_member_4.png',
  },
  {
    id: '05',
    name: 'Rajbutheen',
    role: 'Sales',
    image: '/images/team_member_5.png',
  },
  {
    id: '06',
    name: 'Annapoorna',
    role: 'Printing and Sales',
    image: '/images/team_member_6.png',
  },
  {
    id: '07',
    name: 'Vasanthi',
    role: 'Printing',
    image: '/images/team_member_7.png',
  },
];

const OurTeam = () => {
  return (
    <section className={styles.teamSection}>
      <div className={styles.teamContainer}>
        <span className={styles.teamSubheading}>OUR TEAM</span>
        <h2 className={styles.teamTitle}>
          Meet Our <span className={styles.goldItalic}>Expert</span> Team
        </h2>

        {/* All 7 Members in 1 Single Horizontal Row */}
        <div className={styles.teamRowSingle}>
          {TEAM_MEMBERS.map((member) => (
            <div key={member.id} className={styles.teamCard}>
              <span className={styles.numberBadge}>{member.id}</span>
              <img
                src={member.image}
                alt={member.name}
                className={styles.teamPhoto}
              />
              <div className={styles.memberInfoOverlay}>
                <h3 className={styles.memberName}>{member.name}</h3>
                <p className={styles.memberRole}>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTeam;
