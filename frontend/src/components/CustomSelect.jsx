import React, { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ value, onChange, options, placeholder = '-- Select --' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (val) => {
    onChange({ target: { value: val } });
    setOpen(false);
  };

  return (
    <div className="custom-select" ref={ref}>
      <button
        type="button"
        className={`custom-select-btn ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span className={selected ? 'cs-value' : 'cs-placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="cs-arrow">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="custom-select-dropdown">
          <div
            className="cs-option cs-option-placeholder"
            onClick={() => handleSelect('')}
          >
            {placeholder}
          </div>
          {options.map(opt => (
            <div
              key={opt.value}
              className={`cs-option ${String(opt.value) === String(value) ? 'cs-option-selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
