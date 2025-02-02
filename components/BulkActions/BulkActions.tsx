import React from 'react';
import styles from './BulkActions.module.scss';
import Button from '@/components/Button/Button';

interface BulkActionsProps {
  selectedCount: number;
  onRemoveSelected: () => void;
  onClearSelection: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onRemoveSelected,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null; // Hide component if no selection

  return (
    <div className={styles.bulkActions}>
      <span className={styles.selectedCount}>{selectedCount} selected</span>
      <Button
        onClick={onRemoveSelected}
        buttonType={'button'}
        styleType={'danger'}
      >
        🗑 Remove
      </Button>
      <Button
        onClick={onClearSelection}
        buttonType={'button'}
        styleType={'secondary'}
      >
        ✖ Clear Selection
      </Button>
    </div>
  );
};

export default BulkActions;
