import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  return (
    <div>
      {label && <label className="font-semibold text-tangoBlue mb-1 block">{label}</label>}
      <ReactDatePicker
        selected={selected[0] || null}
        onChange={(dates: any) => {
          if (Array.isArray(dates)) {
            onChange(dates.map((d: Date) => format(d, 'dd-MM-yyyy')));
          } else if (dates) {
            onChange([format(dates, 'dd-MM-yyyy')]);
          } else {
            onChange([]);
          }
        }}
        name={name}
        required={required}
        className="input"
        dayClassName={date => isWeekend(date) ? 'bg-tangoGold-light text-tangoBlue' : ''}
        dateFormat="dd-MM-yyyy"
        placeholderText="Select dates (dd-MM-yyyy)"
        selectsMultiple
        inline={false}
        highlightDates={selected}
        value={values.join(', ')}
        shouldCloseOnSelect={false}
      />
    </div>
  );
};

export default MultiDatePicker;
