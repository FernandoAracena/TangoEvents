import React from 'react';
import { isWeekend, parse, format } from 'date-fns';

interface MultiDatePickerProps {
  name: string;
  values: string[];
  onChange: (dates: string[]) => void;
  required?: boolean;
  label?: string;
}

const MultiDatePicker: React.FC<MultiDatePickerProps> = ({ name, values, onChange, required, label }) => {
  // values: array of 'dd-MM-yyyy' o 'yyyy-MM-dd'
  const selected = values && values.length > 0 ? values.map(v => {
    if (/^\d{2}-\d{2}-\d{4}$/.test(v)) {
      const [d, m, y] = v.split('-');
      return new Date(Number(y), Number(m) - 1, Number(d));
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      return parse(v, 'yyyy-MM-dd', new Date());
    }
    return null;
  }).filter((d): d is Date => !!d) : [];
  const value = values.join(', ');
  return (
    <div>
      {label && <label className="font-semibold text-tangoBlue mb-1 block">{label}</label>}
      <input
        type="text"
        name={name}
        value={value}
        onChange={e => onChange(e.target.value.split(', ').map(date => format(parse(date, 'dd-MM-yyyy', new Date()), 'dd-MM-yyyy')))}
        className="input"
        required={required}
      />
    </div>
  );
};

export default MultiDatePicker;
