import React from 'react';
import styles from './FormSelect.module.scss';

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: FormSelectOption[];
  noValueOption?: FormSelectNoValueOption;
  hideLabel?: boolean;
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
  hideLabel = false,
  ...props
}) => {
  return (
    <div className={styles.formSelectContainer}>
      {!hideLabel && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <select
        id={id}
        aria-label={hideLabel ? label : undefined}
        className={styles.select}
        {...props}
      >
        {noValueOption.include && (
          <option value="">{noValueOption.label}</option>
        )}
        {options.map((option: FormSelectOption, index: number) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FormSelect;
