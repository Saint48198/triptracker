import React from 'react';
import styles from './BulkActions.module.scss';
import Button from '@/components/Button/Button';
import { FaSpinner } from 'react-icons/fa';

interface BulkActionsProps {
  selectedCount: number;
  onRemoveSelected: () => void;
  onClearSelection: () => void;
  removingPhotos: boolean;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onRemoveSelected,
  onClearSelection,
  removingPhotos = false,
}) => {
  if (selectedCount === 0) return null; // Hide component if no selection

  return (
    <div className={styles.bulkActions}>
      <span className={styles.selectedCount}>{selectedCount} selected</span>
      <Button
        onClick={onRemoveSelected}
        buttonType={'button'}
        styleType={'danger'}
        isDisabled={removingPhotos}
      >
        {removingPhotos ? <FaSpinner className="animate-spin" /> : '🗑 Remove'}
      </Button>
      <Button
        onClick={onClearSelection}
        buttonType={'button'}
        styleType={'secondary'}
        isDisabled={removingPhotos}
      >
        ✖ Clear Selection
      </Button>
    </div>
  );
};

export default BulkActions;
