// Reusable FormInput Component
import React from 'react';
import styles from './FormInput.module.scss';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, id, ...props }) => {
  return (
    <div className={styles.formInputContainer}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input id={id} className={styles.input} {...props} />
    </div>
  );
};

export default FormInput;
