import React from 'react';

interface DatePickerProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  label?: string;
}

// Helper to get day of week from yyyy-mm-dd
function getDayOfWeek(dateStr: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.getDay(); // 0: Sunday, 6: Saturday
}

const DatePicker: React.FC<DatePickerProps> = ({ name, value, onChange, required, label }) => {
  return (
    <div className="relative">
      {label && <label className="font-semibold text-tangoBlue">{label}</label>}
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className={`input ${getDayOfWeek(value) === 0 || getDayOfWeek(value) === 6 ? 'bg-tangoGold-light' : ''}`}
        required={required}
      />
      {/* Nota: El color de fondo solo se aplica al input si el día seleccionado es fin de semana. Para remarcar en el calendario nativo se requiere un datepicker externo. */}
    </div>
  );
};

export default DatePicker;
