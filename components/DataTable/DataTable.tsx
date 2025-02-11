import React, { useEffect, useState } from 'react';
import { DataTableProps, Column } from './DataTable.types';
import styles from './DataTable.module.scss';
import Link from 'next/link';

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
    let newSortOrder: 'asc' | 'desc' = 'asc';
    if (sortBy === columnKey) {
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    setSortBy((prev) => (prev === columnKey ? columnKey : columnKey)); // Ensure re-render
    setSortOrder((prev) =>
      sortBy === columnKey ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'
    );

    if (onSort) {
      onSort(columnKey, newSortOrder);
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

  useEffect(() => {
    console.log('SortBy changed:', sortBy);
  }, [sortBy]);

  return (
    <table className={styles.dataTable}>
      <thead className={styles.dataTableHeader}>
        <tr>
          {columns.map((column: Column) => (
            <th
              key={column.key}
              className={`${styles.dataTableHeaderCell} ${column.sortable ? styles.sortable : ''}`}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              {column.label}
              {column.sortable && (
                <span className={styles.sortIcon}>
                  {sortBy === column.key
                    ? sortOrder === 'asc'
                      ? '⬆️'
                      : '⬇️'
                    : ''}
                </span>
              )}
            </th>
          ))}
          {actions && (
            <th className={styles.dataTableHeaderActionCell}>Actions</th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex: number) => (
          <tr
            key={rowIndex}
            className={`${styles.dataTableRow}`}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onKeyDown={
              onRowClick ? (event) => handleKeyDown(event, row) : undefined
            }
            role={onRowClick ? 'button' : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            aria-label={onRowClick ? `Row ${rowIndex + 1}` : undefined}
          >
            {columns.map((column: Column, colIndex: number) => (
              <td key={column.key} className={styles.dataTableCell}>
                {colIndex === 0 && onRowClick ? (
                  <Link
                    href={`#${row[column.key].split(' ').join('_')}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onRowClick(row);
                    }}
                  >
                    {row[column.key]}
                  </Link>
                ) : (
                  <>{row[column.key]}</>
                )}
              </td>
            ))}
            {actions && (
              <td className={styles.dataTableActionCell}>{actions(row)}</td>
            )}
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td
              colSpan={columns.length + (actions ? 1 : 0)}
              className={styles.noData}
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
