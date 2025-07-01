import React from 'react';

const COUNTIES = [
  'Oslo', 'Viken', 'Innlandet', 'Vestfold og Telemark', 'Agder',
  'Rogaland', 'Vestland', 'Møre og Romsdal', 'Trøndelag', 'Nordland', 'Troms og Finnmark'
];

interface CountySelectorProps {
  value: string;
  onChange: (county: string) => void;
  disabled?: boolean;
}

const CountySelector: React.FC<CountySelectorProps> = ({ value, onChange, disabled }) => (
  <select
    className="input"
    value={value}
    onChange={e => onChange(e.target.value)}
    disabled={disabled}
    required
  >
    <option value="">Select county</option>
    {COUNTIES.map(c => (
      <option key={c} value={c}>{c}</option>
    ))}
  </select>
);

export default CountySelector;
