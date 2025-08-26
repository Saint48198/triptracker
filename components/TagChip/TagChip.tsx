'use client';
import React from 'react';
import styles from './TagChip.module.scss';

type TagChipProps = {
  label: string; // what to display
  value?: string; // optional value (defaults to label)
  selected?: boolean;
  disabled?: boolean;
  variant?: 'solid' | 'dashed'; // visual style
  title?: string;
  className?: string;
  onToggle: (value: string) => void; // called with value (or label)
};

export default function TagChip({
  label,
  value,
  selected = false,
  disabled = false,
  variant = 'solid',
  title,
  className,
  onToggle,
}: TagChipProps) {
  const v = value ?? label;

  return (
    <button
      type="button"
      className={[
        styles.chip,
        variant === 'dashed' ? styles.dashed : '',
        selected ? styles.selected : '',
        disabled ? styles.disabled : '',
        className || '',
      ]
        .join(' ')
        .trim()}
      aria-pressed={selected}
      aria-label={`${selected ? 'Remove' : 'Add'} ${label}`}
      title={title ?? (selected ? `Remove ${label}` : `Add ${label}`)}
      disabled={disabled}
      onClick={() => onToggle(v)}
    >
      <span className={styles.text}>{label}</span>
      <span className={styles.affordance}>{selected ? '✓' : '+'}</span>
    </button>
  );
}
