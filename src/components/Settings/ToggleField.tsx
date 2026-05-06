import { useId } from 'react';
import styles from './ToggleField.module.css';

interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export default function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  const id = useId();

  return (
    <div className={styles.field}>
      <div className={styles.textGroup}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {/* The real checkbox is visually hidden; the styled track+thumb are driven by it via CSS. */}
      <input
        id={id}
        className={styles.checkbox}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label className={styles.toggle} htmlFor={id} aria-hidden="true">
        <span className={styles.track} />
        <span className={styles.thumb} />
      </label>
    </div>
  );
}
