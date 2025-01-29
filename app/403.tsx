import styles from './ForbiddenPage.module.scss';

export default function ForbiddenPage() {
  return (
    <div className={styles.forbiddenPage}>
      <h1 className={styles.title}>403 - Access Denied</h1>
    </div>
  );
}
