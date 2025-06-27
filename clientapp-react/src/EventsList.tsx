import React, { useEffect, useState } from 'react';
import CreateEventModalWrapper from './components/CreateEventModalWrapper';
import EditEventModal from './components/EditEventModal';
import Modal from './components/Modal';
import { useUser } from './UserContext';

interface Event {
  id: number;
  eventName: string;
  typeEvent: string;
  description: string;
  organizer: string;
  createdBy: string;
  address: string;
  date: string;
  endsDate: string;
  starts: string;
  ends: string;
  price: string;
  eventLink: string;
  city: string;
  county: string; // calculado por backend
}

const COUNTIES = [
  "Oslo", "Viken", "Innlandet", "Vestfold og Telemark", "Agder", "Rogaland", "Vestland", "Møre og Romsdal", "Trøndelag", "Nordland", "Troms og Finnmark"
];

const EVENT_TYPE_GROUPS = [
  { label: 'All', types: [] },
  { label: 'Events', types: ['Milonga', 'Practice'] },
  { label: 'Classes', types: ['Class', 'Course'] }
];

function parseDDMMYYYY(dateStr: string): Date | null {
  const [day, month, year] = dateStr.split('-').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

function formatDateTitle(dateStr: string): string {
  const d = parseDDMMYYYY(dateStr);
  if (!d) return dateStr;
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function groupEventsByDate(events: Event[]) {
  // Filtrar solo eventos con fecha válida y >= hoy
  const today = new Date();
  const filtered = events.filter(e => {
    const d = parseDDMMYYYY(e.date);
    return d && d >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  return filtered.reduce((groups: Record<string, Event[]>, event) => {
    const d = parseDDMMYYYY(event.date);
    if (!d) return groups;
    const date = d.toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(event);
    return groups;
  }, {});
}

function getCountyFromPosition(lat: number, lon: number): Promise<string> {
  return fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
    .then(res => res.json())
    .then(data => {
      console.log('Nominatim response:', data);
      // Prioridad: county > municipality > state > Unknown
      return (
        data.address?.county ||
        data.address?.municipality ||
        data.address?.state ||
        "Unknown"
      );
    });
}

const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [county, setCounty] = useState<string>("auto"); // Cambiado de 'All' a 'auto'
  const [autoCounty, setAutoCounty] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventTypeGroup, setEventTypeGroup] = useState<string>('All');
  const [showEditModal, setShowEditModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState<number|null>(null);
  const { user, token } = useUser();

  useEffect(() => {
    if (county === "auto") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const c = await getCountyFromPosition(pos.coords.latitude, pos.coords.longitude);
          setAutoCounty(c);
        }, () => setAutoCounty("Unknown"));
      } else {
        setAutoCounty("Unknown");
      }
    }
  }, [county]);

  useEffect(() => {
    let url = 'http://localhost:8080/api/EventsApi?eventType=Events';
    const selectedCounty = county === "auto" ? autoCounty : county;
    if (selectedCounty && selectedCounty !== "All" && selectedCounty !== "") {
      url += `&county=${encodeURIComponent(selectedCounty)}`;
    }
    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo obtener eventos');
        return res.json();
      })
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [county, autoCounty]);

  // Filtrar eventos por grupo
  const filteredEvents = events.filter(e => {
    if (eventTypeGroup === 'All') return true;
    const group = EVENT_TYPE_GROUPS.find(g => g.label === eventTypeGroup);
    return group ? group.types.includes(e.typeEvent) : true;
  });
  const grouped = groupEventsByDate(filteredEvents);

  // Detectar ciudad para el título
  const detectedCity = county === "auto" && autoCounty ? autoCounty : county;

  const handleDelete = async (eventId: number) => {
    if (!token) return;
    setEventIdToDelete(eventId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!token || eventIdToDelete == null) return;
    try {
      const res = await fetch(`http://localhost:8080/api/EventsApi/${eventIdToDelete}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to delete event');
      setSelectedEvent(null);
      setShowDeleteModal(false);
      setEventIdToDelete(null);
      // Refrescar eventos tras eliminar
      let url = 'http://localhost:8080/api/EventsApi?eventType=Events';
      const selectedCounty = county === "auto" ? autoCounty : county;
      if (selectedCounty && selectedCounty !== "All" && selectedCounty !== "") {
        url += `&county=${encodeURIComponent(selectedCounty)}`;
      }
      setLoading(true);
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('No se pudo obtener eventos');
          return res.json();
        })
        .then((data) => {
          setEvents(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } catch (err: any) {
      setError(err.message);
      setShowDeleteModal(false);
      setEventIdToDelete(null);
    }
  };

  if (loading) return <div>Cargando eventos...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-end mb-4">
        {user && (
          <button
            className="bg-tangoBlue text-white px-4 py-2 rounded hover:bg-tangoGold transition"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Event or Class
          </button>
        )}
      </div>
      <h2 className="text-3xl font-bold mb-6 text-center text-tangoBlue">
        Tango Events in: {" "}
        <span className="text-tangoGreen-dark">
          {detectedCity && detectedCity !== 'All' ? detectedCity : 'Norway'}
        </span>
      </h2>
      <div className="mb-6 flex flex-col md:flex-row items-center gap-4 justify-center">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <label className="font-semibold text-tangoBlue">County:</label>
          <select
            className="border rounded px-3 py-2 text-tangoBlue focus:outline-none focus:ring-2 focus:ring-tangoGold min-w-[160px]"
            value={county}
            onChange={e => setCounty(e.target.value)}
          >
            <option value="All">All</option>
            <option value="auto">Auto (Detect my county)</option>
            {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2">
          <label className="font-semibold text-tangoBlue">Type:</label>
          <select
            className="border rounded px-3 py-2 text-tangoBlue focus:outline-none focus:ring-2 focus:ring-tangoGold min-w-[160px]"
            value={eventTypeGroup}
            onChange={e => setEventTypeGroup(e.target.value)}
          >
            {EVENT_TYPE_GROUPS.map(group => (
              <option key={group.label} value={group.label}>{group.label}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Mostrar mensaje si no hay eventos para el county seleccionado */}
      {Object.keys(grouped).length === 0 && (
        <div className="text-center text-tangoBlue font-semibold text-lg my-8">
          No events found for the selected county.
        </div>
      )}
      {Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map(date => (
        <div key={date} className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-tangoBlue border-b pb-1">{formatDateTitle(grouped[date][0].date)}</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {grouped[date].map((event) => (
              <div
                key={event.id}
                className="bg-tangoWhite rounded-lg shadow-md p-6 border border-tangoGold hover:shadow-xl transition cursor-pointer hover:bg-tangoGold-light group"
                onClick={() => setSelectedEvent(event)}
              >
                <h4 className="text-lg font-semibold mb-1 text-tangoBlue group-hover:text-tangoGold-dark">{event.eventName}</h4>
                <div className="text-sm text-tangoGold-dark mb-1">{event.typeEvent} &bull; {event.starts} - {event.ends}</div>
                <div className="text-tangoGreen-dark text-sm mb-1">Organizer: {event.organizer}</div>
                <div className="text-tangoGreen-dark text-sm mb-1">{event.city} ({event.county})</div>
                {user && (event.createdBy === user.email || user.email === 'aracenafernando@gmail.com') && (
                  <div className="mt-2 flex gap-2">
                    <span className="text-lg text-tangoBlue font-extrabold bg-tangoGold-light px-3 py-1 rounded shadow border border-tangoGold animate-pulse">Your event</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal de detalles */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-tangoWhite rounded-lg shadow-lg p-8 max-w-md w-full relative animate-fadeIn border-2 border-tangoGold">
            <button
              className="absolute top-2 right-2 text-tangoGreen hover:text-tangoGold-dark text-2xl font-bold"
              onClick={() => setSelectedEvent(null)}
              aria-label="Cerrar"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-2 text-tangoBlue">{selectedEvent.eventName}</h3>
            <div className="text-sm text-tangoGold-dark mb-2">{selectedEvent.typeEvent} &bull; {parseDDMMYYYY(selectedEvent.date)?.toLocaleDateString()} {selectedEvent.starts} - {selectedEvent.ends}</div>
            <div className="text-tangoGreen-dark mb-2">{selectedEvent.description}</div>
            <div className="text-tangoGreen-dark text-sm mb-1">Organizer: {selectedEvent.organizer}</div>
            <div className="text-tangoGreen-dark text-sm mb-1">Address: {selectedEvent.address}</div>
            <div className="text-tangoGold-dark text-sm mb-1">Price: {selectedEvent.price}</div>
            <div className="text-tangoGreen-dark text-sm mb-1">City: {selectedEvent.city} ({selectedEvent.county})</div>
            {selectedEvent.eventLink && (
              <a href={selectedEvent.eventLink} target="_blank" rel="noopener noreferrer" className="text-tangoGreen hover:text-tangoGold-dark text-sm">More Info...</a>
            )}
            {user && (selectedEvent.createdBy === user.email || user.email === 'aracenafernando@gmail.com') && (
              <div className="flex gap-2 mt-4 justify-center">
                <button
                  className="bg-tangoGreen-dark text-white px-4 py-2 rounded hover:bg-tangoGold hover:text-green-700 transition"
                  onClick={() => {
                    setEventToEdit(selectedEvent);
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={() => handleDelete(selectedEvent.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de edición de evento */}
      {showEditModal && eventToEdit && (
        <EditEventModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          event={eventToEdit}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
            // Refrescar eventos tras editar
            let url = 'http://localhost:8080/api/EventsApi?eventType=Events';
            const selectedCounty = county === "auto" ? autoCounty : county;
            if (selectedCounty && selectedCounty !== "All" && selectedCounty !== "") {
              url += `&county=${encodeURIComponent(selectedCounty)}`;
            }
            setLoading(true);
            fetch(url)
              .then((res) => {
                if (!res.ok) throw new Error('No se pudo obtener eventos');
                return res.json();
              })
              .then((data) => {
                setEvents(data);
                setLoading(false);
              })
              .catch((err) => {
                setError(err.message);
                setLoading(false);
              });
          }}
        />
      )}

      {/* Modal de creación de evento */}
      {showCreateModal && (
        <CreateEventModalWrapper
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // Refrescar eventos tras crear
            let url = 'http://localhost:8080/api/EventsApi?eventType=Events';
            const selectedCounty = county === "auto" ? autoCounty : county;
            if (selectedCounty && selectedCounty !== "All" && selectedCounty !== "") {
              url += `&county=${encodeURIComponent(selectedCounty)}`;
            }
            setLoading(true);
            fetch(url)
              .then((res) => {
                if (!res.ok) throw new Error('No se pudo obtener eventos');
                return res.json();
              })
              .then((data) => {
                setEvents(data);
                setLoading(false);
              })
              .catch((err) => {
                setError(err.message);
                setLoading(false);
              });
          }}
        />
      )}

      {/* Modal de confirmación de borrado */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Event">
        <div className="mb-4 text-center text-tangoBlue text-lg font-semibold">Are you sure you want to delete this event?</div>
        <div className="flex justify-center gap-4">
          <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
          <button onClick={() => setShowDeleteModal(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default EventsList;
