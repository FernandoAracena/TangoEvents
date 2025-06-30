import React, { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { isWeekend, parse, format, addWeeks, addMonths, isAfter } from 'date-fns';

interface RepetitionDatePickerProps {
  name: string;
  value: string;
  onChange: (date: string) => void;
  repeatOption: string;
  onRepeatOptionChange: (option: string) => void;
  repeatUntil: string;
  onRepeatUntilChange: (date: string) => void;
  multiDates: string[];
  onMultiDatesChange: (dates: string[]) => void;
  label?: string;
}

const REPEAT_OPTIONS = [
  { value: 'none', label: 'No repetition' },
  { value: 'weekly', label: 'Every week' },
  { value: 'biweekly', label: 'Every two weeks' },
  { value: 'monthly', label: 'Once a month' },
];

const RepetitionDatePicker: React.FC<RepetitionDatePickerProps> = ({
  name,
  value,
  onChange,
  repeatOption,
  onRepeatOptionChange,
  repeatUntil,
  onRepeatUntilChange,
  multiDates,
  onMultiDatesChange,
  label,
}) => {
  // value puede venir como 'dd-MM-yyyy', 'yyyy-MM-dd' o ''
  let selected: Date | null = null;
  if (value) {
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      const [d, m, y] = value.split('-');
      selected = new Date(Number(y), Number(m) - 1, Number(d));
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      selected = parse(value, 'yyyy-MM-dd', new Date());
    }
  }
  let repeatUntilDate: Date | null = null;
  if (repeatUntil) {
    if (/^\d{2}-\d{2}-\d{4}$/.test(repeatUntil)) {
      const [d, m, y] = repeatUntil.split('-');
      repeatUntilDate = new Date(Number(y), Number(m) - 1, Number(d));
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(repeatUntil)) {
      repeatUntilDate = parse(repeatUntil, 'yyyy-MM-dd', new Date());
    }
  }

  // Genera fechas de repetición automáticas
  const generateDates = () => {
    if (!selected || repeatOption === 'none' || !repeatUntilDate) return [selected].filter(Boolean);
    let dates = [];
    let current = selected;
    while (!isAfter(current, repeatUntilDate)) {
      dates.push(current);
      if (repeatOption === 'weekly') current = addWeeks(current, 1);
      else if (repeatOption === 'biweekly') current = addWeeks(current, 2);
      else if (repeatOption === 'monthly') current = addMonths(current, 1);
      else break;
    }
    return dates;
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      onChange(format(date, 'dd-MM-yyyy'));
      if (repeatOption !== 'none' && repeatUntilDate) {
        const autoDates = generateDates().filter(Boolean).map(d => format(d!, 'dd-MM-yyyy'));
        onMultiDatesChange(autoDates);
      } else {
        // Si no hay repetición, solo la fecha seleccionada
        onMultiDatesChange([format(date, 'dd-MM-yyyy')]);
      }
    } else {
      onChange('');
      onMultiDatesChange([]);
    }
  };

  const handleRepeatOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRepeatOptionChange(e.target.value);
    if (e.target.value === 'none') {
      if (selected) onMultiDatesChange([format(selected, 'dd-MM-yyyy')]);
      else onMultiDatesChange([]);
    } else if (selected && repeatUntilDate) {
      const autoDates = generateDates().filter(Boolean).map(d => format(d!, 'dd-MM-yyyy'));
      onMultiDatesChange(autoDates);
    }
  };

  const handleRepeatUntilChange = (date: Date | null) => {
    if (date) {
      onRepeatUntilChange(format(date, 'dd-MM-yyyy'));
      if (selected && repeatOption !== 'none') {
        const autoDates = generateDates().filter(Boolean).map(d => format(d!, 'dd-MM-yyyy'));
        onMultiDatesChange(autoDates);
      }
    } else {
      onRepeatUntilChange('');
    }
  };

  return (
    <div>
      {label && <label className="font-semibold text-tangoBlue mb-1 block">{label}</label>}
      <ReactDatePicker
        selected={selected}
        onChange={handleDateChange}
        name={name}
        required
        className="input"
        dayClassName={date => isWeekend(date) ? 'bg-tangoGold-light text-tangoBlue' : ''}
        dateFormat="dd-MM-yyyy"
        placeholderText="Select date (dd-MM-yyyy)"
        autoComplete="off"
      />
      <div className="mt-2">
        {/* <label className="font-semibold text-tangoBlue">Repetition:</label> */}
        <select value={repeatOption} onChange={handleRepeatOptionChange} className="input mt-1 mb-2">
          {REPEAT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {repeatOption !== 'none' && (
          <div className="flex flex-col gap-2">
            {/* <label className="font-semibold text-tangoBlue">Repeat until:</label> */}
            <ReactDatePicker
              selected={repeatUntilDate}
              onChange={handleRepeatUntilChange}
              minDate={selected || undefined}
              className="input"
              dateFormat="dd-MM-yyyy"
              placeholderText="Select end date (dd-MM-yyyy)"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RepetitionDatePicker;
