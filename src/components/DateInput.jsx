// src/components/DateInput.jsx — Cross-platform date input with consistent DD-MM-YYYY display
import { useState, useRef, useCallback } from 'react';
import { CalendarDays } from 'lucide-react';

/**
 * Controlled date input that displays DD-MM-YYYY on all platforms.
 * Stores and emits values in YYYY-MM-DD format for API compatibility.
 *
 * @param {string} value - Date in YYYY-MM-DD format (or empty string)
 * @param {(e: {target: {name: string, value: string}}) => void} onChange - Mimics native input onChange
 * @param {string} name - Form field name
 * @param {string} id - Input element id
 * @param {string} [className] - Tailwind classes for the wrapper
 */
export default function DateInput({ value, onChange, name, id, className = '' }) {
  // Convert YYYY-MM-DD → DD-MM-YYYY for display
  const toDisplay = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return (y && m && d) ? `${d}-${m}-${y}` : iso;
  };

  // Convert DD-MM-YYYY → YYYY-MM-DD for storage
  const toISO = (display) => {
    if (!display) return '';
    const [d, m, y] = display.split('-');
    return (d && m && y && y.length === 4) ? `${y}-${m}-${d}` : '';
  };

  const [displayValue, setDisplayValue] = useState(() => toDisplay(value));
  const nativeDateRef = useRef(null);

  // Keep display in sync if parent value changes externally
  const prevValueRef = useRef(value);
  if (value !== prevValueRef.current) {
    prevValueRef.current = value;
    setDisplayValue(toDisplay(value));
  }

  // Auto-format: insert dashes after DD and MM, cap at 10 chars
  const handleTextChange = useCallback((e) => {
    let raw = e.target.value.replace(/[^0-9]/g, ''); // digits only
    if (raw.length > 8) raw = raw.slice(0, 8);

    let formatted = '';
    for (let i = 0; i < raw.length; i++) {
      if (i === 2 || i === 4) formatted += '-';
      formatted += raw[i];
    }

    setDisplayValue(formatted);

    // Emit YYYY-MM-DD to parent only when we have a full valid date
    const iso = toISO(formatted);
    onChange({ target: { name, value: iso } });
  }, [name, onChange]);

  // Native calendar picker fallback
  const handleNativePick = useCallback((e) => {
    const iso = e.target.value;
    setDisplayValue(toDisplay(iso));
    onChange({ target: { name, value: iso } });
  }, [name, onChange]);

  const openPicker = useCallback(() => {
    nativeDateRef.current?.showPicker?.();
  }, []);

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="DD-MM-YYYY"
        value={displayValue}
        onChange={handleTextChange}
        maxLength={10}
        className="w-full px-3.5 py-2.5 pr-10 bg-surface-darker border border-border-glass rounded-lg
          text-text-white placeholder:text-text-muted text-sm
          focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/60
          transition-colors"
      />
      {/* Calendar icon — opens native date picker */}
      <button
        type="button"
        onClick={openPicker}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-light transition-colors"
        tabIndex={-1}
        aria-label="Open date picker"
      >
        <CalendarDays className="w-4 h-4" />
      </button>
      {/* Hidden native picker for calendar fallback */}
      <input
        ref={nativeDateRef}
        type="date"
        value={value}
        onChange={handleNativePick}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
