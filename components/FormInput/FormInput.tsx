// Reusable FormInput Component
import React from 'react';
import styles from './FormInput.module.scss';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  hideLabel?: boolean;
  value: string;
  ref?: React.RefObject<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inlineLabel?: boolean;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, id, hideLabel = false, inlineLabel = false, ...props }, ref) => {
    return (
      <div
        className={`${styles.formInputContainer} ${inlineLabel ? styles.inlineLabel : ''}`}
      >
        {!hideLabel && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={styles.input}
          aria-label={hideLabel ? label : undefined}
          {...props}
        />
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
