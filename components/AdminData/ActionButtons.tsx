import React from 'react';
import Link from 'next/link';
import Button from '@/components/Button/Button';
import styles from './ActionButtons.module.scss';
import {
  ENTITY_TYPE_ATTRACTION,
  ENTITY_TYPE_CITY,
  ENTITY_TYPE_COUNTRY,
  ENTITY_TYPE_STATE,
} from '@/constants';

type EntityType =
  | typeof ENTITY_TYPE_CITY
  | typeof ENTITY_TYPE_COUNTRY
  | typeof ENTITY_TYPE_STATE
  | typeof ENTITY_TYPE_ATTRACTION;

interface ActionButtonsProps {
  row: { id: string };
  handleDelete: (id: string) => void;
  entity: EntityType;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  row,
  handleDelete,
  entity,
}) => {
  return (
    <div className={styles.actionButtons}>
      <Link href={`/admin/${entity}?id=${row.id}`}>Edit</Link>
      <Button
        onClick={() => handleDelete(row.id)}
        buttonType="button"
        styleType="danger"
      >
        Delete
      </Button>
    </div>
  );
};

export default ActionButtons;
