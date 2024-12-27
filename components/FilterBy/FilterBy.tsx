import React from 'react';
import styles from './FilterBy.module.scss';
import { FilterByProps } from '@/components/FilterBy/FilterBy.types';

const FilterBy: React.FC<FilterByProps> = ({
  options,
  selectedFilters,
  onFilterChange,
  multiple = true, // Default to multiple selection
  includeSelectAll = true, // Include "Select All" by default
  selectAllLabel = 'Select All', // Default label for "Select All"
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = multiple
      ? Array.from(e.target.selectedOptions, (option) => option.value)
      : [e.target.value];

    if (!multiple && selectedOptions.includes('')) {
      onFilterChange([]);
    } else {
      onFilterChange(selectedOptions);
    }
  };

  return (
    <div className={styles.filterBy}>
      <h3>Filter By</h3>
      <select
        multiple={multiple}
        value={selectedFilters.length ? selectedFilters : ['']}
        onChange={handleChange}
      >
        {includeSelectAll && <option value="">{selectAllLabel}</option>}
        {options.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterBy;
