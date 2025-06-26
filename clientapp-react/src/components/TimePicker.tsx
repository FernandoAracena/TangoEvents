import React from 'react';

interface TimePickerProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  label?: string;
}

// Generates time options in 15-minute intervals
const generateTimeOptions = () => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, '0');
      const min = m.toString().padStart(2, '0');
      options.push(`${hour}:${min}`);
    }
  }
  return options;
};

const TimePicker: React.FC<TimePickerProps> = ({ name, value, onChange, required, label }) => {
  const options = generateTimeOptions();
  return (
    <div>
      {label && <label className="font-semibold text-tangoBlue">{label}</label>}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="input"
        required={required}
      >
        <option value="">
          {name === 'starts' ? 'Select start time' : name === 'ends' ? 'Select ends time' : 'Select time'}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
};

export default TimePicker;
