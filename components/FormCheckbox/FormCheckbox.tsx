import React from 'react';
import styles from './FormCheckbox.module.scss';

interface FormCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({ label, id, ...props }) => {
  return (
    <div className={styles.formCheckboxContainer}>
      <input type="checkbox" id={id} className={styles.checkbox} {...props} />
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
    </div>
  );
};

export default FormCheckbox;
