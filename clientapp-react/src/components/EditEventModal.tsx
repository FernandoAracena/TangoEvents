import React, { useState } from 'react';
import Modal from './Modal';
import CustomDatePicker from './CustomDatePicker';
import TimePicker from './TimePicker';
import { useUser } from '../UserContext';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onSuccess?: () => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ isOpen, onClose, event, onSuccess }) => {
  const [form, setForm] = useState(event);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user, token } = useUser();

  React.useEffect(() => {
    setForm(event);
  }, [event]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDatePickerChange = (name: string) => (date: string) => {
    setForm({ ...form, [name]: date });
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
    CreatedBy: e.createdBy
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!validateDateTime()) return;
    setLoading(true);
    try {
      const payload = toPascalCaseEvent({ ...form });
      const res = await fetch(`https://localhost:7279/api/EventsApi/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        setError('No autorizado. Solo el creador puede editar este evento o tu sesión expiró.');
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Failed to update event');
      setSuccess(true);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Event">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input name="eventName" value={form.eventName} onChange={handleChange} placeholder="Event Name" className="input" required />
        <select name="typeEvent" value={form.typeEvent} onChange={handleChange} className="input" required>
          <option value="">Select type</option>
          <option value="Milonga">Milonga</option>
          <option value="Practice">Practice</option>
          <option value="Class">Class</option>
          <option value="Course">Course</option>
        </select>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="input" required />
        <input name="organizer" value={form.organizer} onChange={handleChange} placeholder="Organizer" className="input" required />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="input" required />
        <CustomDatePicker
          name="date"
          value={form.date}
          onChange={handleDatePickerChange('date')}
          required
          // label="Date:"
        />
        {form.typeEvent === 'Course' && (
          <CustomDatePicker
            name="endsDate"
            value={form.endsDate}
            onChange={handleDatePickerChange('endsDate')}
            // label="Ends Date:"
          />
        )}
        <TimePicker
          name="starts"
          value={form.starts}
          onChange={handleChange}
          required
          // label="Starts:"
        />
        <TimePicker
          name="ends"
          value={form.ends}
          onChange={handleChange}
          required
          // label="Ends:"
        />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="input" required />
        <input name="eventLink" value={form.eventLink} onChange={handleChange} placeholder="Event Link" className="input" required />
        <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="input" required />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-700 mb-2">Event updated successfully!</div>}
        <div className="flex gap-4 justify-end mt-2">
          <button type="button" className="bg-tangoBlue text-white py-2 px-4 rounded hover:bg-tangoGold transition" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="bg-tangoGreen-dark text-white py-2 px-4 rounded hover:bg-tangoGold hover:text-green-700 transition" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditEventModal;
