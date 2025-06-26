import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
      <ReactDatePicker
        selected={selected}
        onChange={date => {
          if (date) {
            // Siempre devolver en formato dd-MM-yyyy
            onChange(format(date, 'dd-MM-yyyy'));
          } else {
            onChange('');
          }
        }}
        name={name}
        required={required}
        className="input"
        dayClassName={date => isWeekend(date) ? 'bg-tangoGold-light text-tangoBlue' : ''}
        dateFormat="dd-MM-yyyy"
        placeholderText="Select date (dd-MM-yyyy)"
      />
    </div>
  );
};

export default CustomDatePicker;
