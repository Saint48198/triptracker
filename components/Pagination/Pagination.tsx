import React from 'react';
import { PaginationProps } from './Pagination.types';
import styles from './Pagination.module.scss';
import Link from 'next/link';

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const maxPageLinks = 5; // Limit the number of individual page links displayed
  const pageNumbers = [];

  let startPage = Math.max(1, currentPage - Math.floor(maxPageLinks / 2));
  let endPage = Math.min(totalPages, startPage + maxPageLinks - 1);

  if (endPage - startPage + 1 < maxPageLinks) {
    startPage = Math.max(1, endPage - maxPageLinks + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={styles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.button}
      >
        Previous
      </button>
      {startPage > 1 && (
        <button onClick={() => onPageChange(1)} className={styles.button}>
          1
        </button>
      )}
      {startPage > 2 && <span className={styles.ellipsis}>...</span>}
      {pageNumbers.map((number) => (
        <Link href={`?page=${number}`} key={number} className={styles.button}>
          {number}
        </Link>
      ))}
      {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
      {endPage < totalPages && (
        <button
          onClick={() => onPageChange(totalPages)}
          className={styles.button}
        >
          {totalPages}
        </button>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={styles.button}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
