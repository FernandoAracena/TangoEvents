import React, { useState } from 'react';
import DatePicker from './components/DatePicker';
import TimePicker from './components/TimePicker';
import CustomDatePicker from './components/CustomDatePicker';
import MultiDatePicker from './components/MultiDatePicker';
import RepetitionDatePicker from './components/RepetitionDatePicker';
import { useUser } from './UserContext';
import CountySelector from './components/CountySelector';

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
  county: '',
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
  const [county, setCounty] = useState('');
  const [locationStatus, setLocationStatus] = useState<'pending'|'success'|'error'>('pending');
  const [locationError, setLocationError] = useState('');
  const { user, token } = useUser();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDatePickerChange = (name: string) => (date: string) => {
    setForm({ ...form, [name]: date });
  };

  const handleRepeatOptionChange = (option: string) => {
    setRepeatOption(option);
    if (option === 'none') {
      if (form.date) setMultiDates([form.date]);
      else setMultiDates([]);
    } else if (form.date && repeatUntil) {
      // Generar fechas de repetición en formato dd-MM-yyyy
      const parseDate = (str: string) => {
        const [d, m, y] = str.split('-');
        return new Date(Number(y), Number(m) - 1, Number(d));
      };
      const formatDate = (d: Date) => `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getFullYear()}`;
      let dates: string[] = [];
      let current = parseDate(form.date);
      const end = parseDate(repeatUntil);
      while (current <= end) {
        dates.push(formatDate(current));
        if (option === 'weekly') current.setDate(current.getDate() + 7);
        else if (option === 'biweekly') current.setDate(current.getDate() + 14);
        else if (option === 'monthly') current.setMonth(current.getMonth() + 1);
        else break;
      }
      setMultiDates(dates);
    }
  };

  const handleRepeatUntilChange = (date: string) => {
    setRepeatUntil(date);
    if (repeatOption !== 'none' && form.date && date) {
      const parseDate = (str: string) => {
        const [d, m, y] = str.split('-');
        return new Date(Number(y), Number(m) - 1, Number(d));
      };
      const formatDate = (d: Date) => `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getFullYear()}`;
      let dates: string[] = [];
      let current = parseDate(form.date);
      const end = parseDate(date);
      while (current <= end) {
        dates.push(formatDate(current));
        if (repeatOption === 'weekly') current.setDate(current.getDate() + 7);
        else if (repeatOption === 'biweekly') current.setDate(current.getDate() + 14);
        else if (repeatOption === 'monthly') current.setMonth(current.getMonth() + 1);
        else break;
      }
      setMultiDates(dates);
    }
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

  React.useEffect(() => {
    // Pedir ubicación al abrir el formulario
    if (!county) {
      if (!navigator.geolocation) {
        setLocationStatus('error');
        setLocationError('Geolocation is not supported by your browser.');
        return;
      }
      setLocationStatus('pending');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          // Llamar al backend para obtener el county a partir de lat/lng
          try {
            const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';
            const res = await fetch(`${apiBase}/api/EventsApi/county?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
            if (!res.ok) throw new Error('Failed to get county');
            const data = await res.json();
            if (data && data.county) {
              setCounty(data.county);
              setLocationStatus('success');
            } else {
              setLocationStatus('error');
              setLocationError('Could not determine your county. Please select manually.');
            }
          } catch {
            setLocationStatus('error');
            setLocationError('Could not determine your county. Please select manually.');
          }
        },
        (err) => {
          setLocationStatus('error');
          setLocationError('Location permission denied or unavailable. Please select your county manually.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [county]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!user) {
      setError('You must be logged in to create an event.');
      return;
    }
    if (!county) {
      setError('Please select your county.');
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
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      // --- Generar fechas de repetición justo antes de enviar ---
      let datesToSend = multiDates;
      if (repeatOption !== 'none' && form.date && repeatUntil) {
        // Generar fechas de repetición en formato dd-MM-yyyy
        const parseDate = (str: string) => {
          const [d, m, y] = str.split('-');
          return new Date(Number(y), Number(m) - 1, Number(d));
        };
        const formatDate = (d: Date) => `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getFullYear()}`;
        let dates: string[] = [];
        let current = parseDate(form.date);
        const end = parseDate(repeatUntil);
        while (current <= end) {
          dates.push(formatDate(current));
          if (repeatOption === 'weekly') current.setDate(current.getDate() + 7);
          else if (repeatOption === 'biweekly') current.setDate(current.getDate() + 14);
          else if (repeatOption === 'monthly') current.setMonth(current.getMonth() + 1);
          else break;
        }
        datesToSend = dates;
      }
      // Si hay varias fechas, crear un array de eventos, si no, solo uno
      let payload;
      if (form.typeEvent !== 'Course' && datesToSend.length > 0) {
        payload = datesToSend.map(date => toPascalCaseEvent({ ...form, date, CreatedBy: user.email, county }));
      } else {
        payload = toPascalCaseEvent({ ...form, CreatedBy: user.email, county });
      }
      const res = await fetch(`${apiBase}/api/EventsApi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) {
          window.dispatchEvent(new CustomEvent('session-expired', { detail: { status: 401 } }));
          throw new Error('Unauthorized. Please log in again.');
        }
        if (res.status === 403) {
          throw new Error('You do not have permission to perform this action.');
        }
        let errorMsg = 'Unknown error';
        try {
          const data = await res.json();
          errorMsg = data.message || errorMsg;
        } catch {
          // If no JSON, ignore
        }
        throw new Error(errorMsg);
      }
      const data = await res.json();
      console.log('Evento creado (respuesta backend):', data);
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
            onRepeatOptionChange={handleRepeatOptionChange}
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
        {/* County logic */}
        {locationStatus === 'pending' && (
          <div className="text-blue-600 text-sm">Detecting your location...</div>
        )}
        {locationStatus === 'error' && (
          <div className="text-red-600 text-sm mb-1">{locationError} <button type="button" className="underline" onClick={()=>{setCounty('');setLocationStatus('pending');setLocationError('');}}>Retry</button></div>
        )}
        <CountySelector value={county} onChange={setCounty} disabled={locationStatus==='pending'} />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-700 mb-2">Event created successfully!</div>}
        <button type="submit" className="bg-tangoBlue text-white py-2 rounded hover:bg-tangoGold transition" disabled={loading || locationStatus==='pending'}>
          {loading ? 'Saving...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
