import React from 'react';
import styles from './AboutPage.module.scss';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

const AboutPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <main>
        <div className={styles.aboutPage}>
          <section className={styles.section}>
            <h1>About the TripTracker</h1>
            <p>
              This app is designed to help users manage and explore various
              entities such as cities, countries, states, and attractions. It
              provides a user-friendly interface for viewing, editing, and
              deleting data entries, as well as filtering and sorting options to
              easily find the information you need.
            </p>
          </section>
          <section className={styles.section}>
            <h1>About the Me</h1>
            <p>
              The developer of this app is a passionate software engineer with
              expertise in TypeScript, React, and web development. With a strong
              focus on creating efficient and scalable applications, the
              developer aims to deliver high-quality software solutions that
              meet the needs of users.
            </p>
            <h2>Learn more</h2>
            <ul>
              <li>
                <Link href="https://github.com/Saint48198" target="_blank">
                  Github
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.linkedin.com/in/scottrdaniels/"
                  target="_blank"
                >
                  LinkedIn
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AboutPage;
