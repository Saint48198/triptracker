import React from 'react';
import { PaginationProps } from './Pagination.types';
import styles from './Pagination.module.scss';

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={styles.pagination}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={styles.button}
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage >= totalPages}
        className={styles.button}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
