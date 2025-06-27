import React, { useState } from 'react';
import DatePicker from './components/DatePicker';
import TimePicker from './components/TimePicker';
import CustomDatePicker from './components/CustomDatePicker';
import MultiDatePicker from './components/MultiDatePicker';
import RepetitionDatePicker from './components/RepetitionDatePicker';
import { useUser } from './UserContext';

const initialState = {
  eventName: '',
  typeEvent: '',
  description: '',
  organizer: '',
  address: '',
  date: '',
  endsDate: '',
  starts: '',
  ends: '',
  price: '',
  eventLink: '',
  city: '',
};

interface CreateEventProps {
  onSuccess?: () => void;
}

const CreateEvent: React.FC<CreateEventProps> = ({ onSuccess }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [repeatOption, setRepeatOption] = useState('none');
  const [multiDates, setMultiDates] = useState<string[]>([]);
  const [repeatUntil, setRepeatUntil] = useState('');
  const { user, token } = useUser();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDatePickerChange = (name: string) => (date: string) => {
    setForm({ ...form, [name]: date });
  };

  const handleRepeatOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRepeatOption(e.target.value);
    if (e.target.value === 'none') setMultiDates([]);
  };
  const handleMultiDateChange = (dates: string[]) => {
    setMultiDates(dates);
  };
  const handleRepeatUntilChange = (date: string) => {
    setRepeatUntil(date);
  };

  // Validación extra para fechas y horas
  const validateDateTime = () => {
    if (form.endsDate && form.endsDate < form.date) {
      setError('Ends Date cannot be before Start Date.');
      return false;
    }
    if (form.starts && form.ends && form.starts >= form.ends) {
      setError('End time must be after start time.');
      return false;
    }
    return true;
  };

  // Utilidad para formatear fecha yyyy-MM-dd a dd-MM-yyyy
  const formatToDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return '';
    // Si ya está en dd-MM-yyyy, no cambiar
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
    const [y, m, d] = dateStr.split('-');
    if (y && m && d && y.length === 4) return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
    return dateStr;
  };

  // Utilidad para mapear los nombres de las propiedades a PascalCase y formatear fechas
  const toPascalCaseEvent = (e: any) => ({
    EventName: e.eventName,
    TypeEvent: e.typeEvent,
    Description: e.description,
    Organizer: e.organizer,
    Address: e.address,
    Date: formatToDDMMYYYY(e.date),
    EndsDate: formatToDDMMYYYY(e.endsDate),
    Starts: e.starts,
    Ends: e.ends,
    Price: e.price,
    EventLink: e.eventLink,
    City: e.city,
    CreatedBy: e.CreatedBy
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!user) {
      setError('You must be logged in to create an event.');
      return;
    }
    if (!validateDateTime()) return;
    setLoading(true);
    // Validar campos obligatorios
    for (const key of Object.keys(initialState)) {
      if (!form[key as keyof typeof form] && key !== 'endsDate') {
        setError('All fields except Ends Date are required.');
        setLoading(false);
        return;
      }
    }
    try {
      // Si hay varias fechas, crear un array de eventos, si no, solo uno
      let payload;
      if (form.typeEvent !== 'Course' && multiDates.length > 0) {
        payload = multiDates.map(date => toPascalCaseEvent({ ...form, date, CreatedBy: user.email }));
      } else {
        payload = toPascalCaseEvent({ ...form, CreatedBy: user.email });
      }
      const res = await fetch('http://localhost:8080/api/EventsApi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('Evento creado (respuesta backend):', data);
      if (!res.ok) throw new Error('Failed to create event');
      setSuccess(true);
      setForm(initialState);
      setMultiDates([]);
      setRepeatOption('none');
      setRepeatUntil('');
      if (onSuccess) onSuccess(); // Esto refresca la lista si el padre lo implementa
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      {/* <h2 className="text-2xl font-bold mb-4 text-tangoBlue">Create New Event</h2> */}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-700 mb-2">Event created successfully!</div>}
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input name="eventName" value={form.eventName} onChange={handleChange} placeholder="Event Name" className="input" required />
        <select name="typeEvent" value={form.typeEvent} onChange={handleChange} className="input" required>
          <option value="">Select type</option>
          <option value="Milonga">Milonga</option>
          <option value="Practice">Practice</option>
          <option value="Class">Class</option>
          <option value="Course">Course</option>
        </select>
        {form.typeEvent !== 'Course' ? (
          <RepetitionDatePicker
            name="date"
            value={form.date}
            onChange={handleDatePickerChange('date')}
            repeatOption={repeatOption}
            onRepeatOptionChange={setRepeatOption}
            repeatUntil={repeatUntil}
            onRepeatUntilChange={handleRepeatUntilChange}
            multiDates={multiDates}
            onMultiDatesChange={setMultiDates}
          />
        ) : (
          <CustomDatePicker
            name="date"
            value={form.date}
            onChange={handleDatePickerChange('date')}
            required
          />
        )}
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="input" required />
        <input name="organizer" value={form.organizer} onChange={handleChange} placeholder="Organizer" className="input" required />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="input" required />
        {form.typeEvent === 'Course' && (
          <CustomDatePicker
            name="endsDate"
            value={form.endsDate}
            onChange={handleDatePickerChange('endsDate')}
          />
        )}
        <TimePicker
          name="starts"
          value={form.starts}
          onChange={handleChange}
          required
        />
        <TimePicker
          name="ends"
          value={form.ends}
          onChange={handleChange}
          required
        />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="input" required />
        <input name="eventLink" value={form.eventLink} onChange={handleChange} placeholder="Event Link" className="input" required />
        <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="input" required />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-700 mb-2">Event created successfully!</div>}
        <button type="submit" className="bg-tangoBlue text-white py-2 rounded hover:bg-tangoGold transition" disabled={loading}>
          {loading ? 'Saving...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
