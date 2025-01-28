import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.text}>
          &copy; {new Date().getFullYear()} Scott Daniels. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
