// Reusable FormInput Component
import React from 'react';
import styles from './FormInput.module.scss';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  hideLabel?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  id,
  hideLabel = true,
  ...props
}) => {
  return (
    <div className={styles.formInputContainer}>
      {!hideLabel && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={styles.input}
        aria-label={hideLabel ? label : undefined}
        {...props}
      />
    </div>
  );
};

export default FormInput;
