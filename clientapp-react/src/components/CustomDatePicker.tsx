import React from 'react';
import { isWeekend, parse, format } from 'date-fns';

interface CustomDatePickerProps {
  name: string;
  value: string;
  onChange: (date: string) => void;
  required?: boolean;
  label?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ name, value, onChange, required, label }) => {
  // value puede venir como 'dd-MM-yyyy', 'yyyy-MM-dd' o ''
  let selected: Date | null = null;
  if (value) {
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      // dd-MM-yyyy
      const [d, m, y] = value.split('-');
      selected = new Date(Number(y), Number(m) - 1, Number(d));
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // yyyy-MM-dd
      selected = parse(value, 'yyyy-MM-dd', new Date());
    }
  }
  return (
    <div>
      {label && <label className="font-semibold text-tangoBlue mb-1 block">{label}</label>}
      <input
        type="text"
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input"
        required={required}
        placeholder="Select date (dd-MM-yyyy)"
      />
    </div>
  );
};

export default CustomDatePicker;
