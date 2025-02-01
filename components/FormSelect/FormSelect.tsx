import React from 'react';
import styles from './FormSelect.module.scss';

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: FormSelectOption[];
  noValueOption?: FormSelectNoValueOption;
}

interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectNoValueOption {
  include: boolean;
  label: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  id,
  options,
  noValueOption = { include: false, label: 'Select an option' },
  ...props
}) => {
  return (
    <div className={styles.formSelectContainer}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <select id={id} className={styles.select} {...props}>
        {noValueOption.include && (
          <option value="">{noValueOption.label}</option>
        )}
        {options.map((option: FormSelectOption) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FormSelect;
