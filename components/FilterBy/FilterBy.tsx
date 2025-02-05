import React from 'react';
import styles from './FilterBy.module.scss';
import { FilterByProps } from '@/components/FilterBy/FilterBy.types';
import FormSelect from '@/components/FormSelect/FormSelect';

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
      <FormSelect
        label={'Filter options'}
        id={'filters'}
        hideLabel={true}
        options={options.map(({ id, label }) => ({
          value: id,
          label,
        }))}
        onChange={(e) => handleChange(e)}
        multiple={multiple}
        value={
          multiple
            ? selectedFilters.length
              ? selectedFilters
              : ['']
            : selectedFilters.length
              ? selectedFilters[0]
              : ''
        }
        noValueOption={{
          include: includeSelectAll,
          label: selectAllLabel,
        }}
      />
    </div>
  );
};

export default FilterBy;
