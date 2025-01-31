import React from 'react';
import styles from './FormTextarea.module.scss';

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
}

const FormTextarea: React.FC<FormTextareaProps> = ({ label, id, ...props }) => {
  return (
    <div className={styles.formTextareaContainer}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <textarea id={id} className={styles.textarea} {...props} />
    </div>
  );
};

export default FormTextarea;
