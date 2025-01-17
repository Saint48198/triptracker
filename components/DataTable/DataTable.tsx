import React, { useState } from 'react';
import { DataTableProps, Column } from './DataTable.types';

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onSort,
  actions,
  onRowClick,
}) => {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
    if (onSort) {
      onSort(columnKey, sortOrder === 'asc' ? 'desc' : 'asc');
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
    row: Record<string, any>
  ) => {
    if (onRowClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <table className="min-w-full table-auto border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          {columns.map((column: Column) => (
            <th
              key={column.key}
              className={`px-4 py-2 text-left ${column.sortable ? 'cursor-pointer hover:text-blue-600' : ''}`}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              {column.label}{' '}
              {column.sortable &&
                sortBy === column.key &&
                (sortOrder === 'asc' ? '⬆️' : '⬇️')}
            </th>
          ))}
          {actions && <th className="px-4 py-2 text-left">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={`cursor-${onRowClick ? 'pointer' : 'default'} hover:bg-gray-100`}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onKeyDown={
              onRowClick ? (event) => handleKeyDown(event, row) : undefined
            }
            role={onRowClick ? 'button' : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            aria-label={onRowClick ? `Row ${rowIndex + 1}` : undefined}
          >
            {columns.map((column: Column) => (
              <td key={column.key} className="px-4 py-2">
                {row[column.key]}
              </td>
            ))}
            {actions && <td className="px-4 py-2">{actions(row)}</td>}
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td
              colSpan={columns.length + (actions ? 1 : 0)}
              className="text-center py-4"
            >
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default DataTable;
