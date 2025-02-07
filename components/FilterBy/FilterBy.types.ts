export interface FilterOption {
  id: string; // Unique identifier
  value: string; // Value to filter by
  label: string; // Display label
}

export interface FilterByProps {
  options: FilterOption[]; // List of filter options
  selectedFilters: string[]; // Currently selected filter IDs
  onFilterChange: (selected: string[]) => void; // Callback when filters are updated
  multiple?: boolean; // Whether multiple selection is allowed
  includeSelectAll?: boolean; // Include "Select All" option
  selectAllLabel?: string; // Label for the "Select All" option
}
