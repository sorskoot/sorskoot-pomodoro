import styles from './DurationField.module.css';

interface DurationFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}

export default function DurationField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'min',
  onChange,
}: DurationFieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label}>{label}</label>
        <span className={styles.valueDisplay}>
          {value} {unit}
        </span>
      </div>
      <input
        className={styles.slider}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
    </div>
  );
}
