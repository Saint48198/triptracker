import LoginForm from './LoginForm';
import styles from './LoginPage.module.scss';

const LoginPage: React.FC = () => {
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <h2 className={styles.loginTitle}>Login</h2>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
