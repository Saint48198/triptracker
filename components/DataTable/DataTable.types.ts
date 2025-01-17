export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onRowClick?: (row: Record<string, any>) => void;
  actions?: (row: Record<string, any>) => React.ReactNode;
}
