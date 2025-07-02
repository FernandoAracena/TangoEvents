import React, { useEffect, useState, useCallback } from 'react';
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
  const [county, setCounty] = useState<string>("auto");
  const [autoCounty, setAutoCounty] = useState<string>("");
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventTypeGroup, setEventTypeGroup] = useState<string>('All');
  const [showEditModal, setShowEditModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState<number|null>(null);
  const { user, token } = useUser();

  const fetchEvents = useCallback(() => {
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    let url = `${apiBase}/api/EventsApi?eventType=Events`;
    const selectedCounty = county === "auto" ? autoCounty : county;
    if (selectedCounty && selectedCounty !== "All" && selectedCounty !== "") {
      url += `&county=${encodeURIComponent(selectedCounty)}`;
    }
    setLoading(true);
    setError(null); // Reset error before fetching
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch events. Please try again later.');
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


  useEffect(() => {
    const requestGeolocation = () => {
      // Clear previous errors and state when starting
      setGeolocationError(null);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const c = await getCountyFromPosition(pos.coords.latitude, pos.coords.longitude);
          setAutoCounty(c);
          setGeolocationError(null); // Clear error on success
        }, (err) => {
          console.error("Geolocation error:", err);
          setGeolocationError("Could not automatically detect your location. Please select a county from the list.");
          setAutoCounty("");
          setError(null);
          // Si el usuario no ha cambiado el county manualmente, forzar a 'All' para evitar bloqueo
          setCounty((prev) => prev === "auto" ? "All" : prev);
        }, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // Allow cached position up to 5 minutes old
        });
      } else {
        console.log("Geolocation is not supported by this browser.");
        setGeolocationError("Geolocation is not supported. Please select a county manually.");
        setAutoCounty("");
        setError(null);
      }
    };

    if (county === "auto") {
      requestGeolocation();
    } else {
      // If user selects a county, clear any auto-county info
      setAutoCounty("");
      setGeolocationError(null);
    }
  }, [county]);

  // Solo pedir eventos cuando hay county válido
  useEffect(() => {
    if (county !== "auto" || (county === "auto" && autoCounty)) {
      fetchEvents();
    } else {
      console.log("Esperando county válido para pedir eventos...");
    }
  }, [fetchEvents, county, autoCounty]);

  // Filtrar eventos por grupo
  const filteredEvents = events.filter(e => {
    if (eventTypeGroup === 'All') return true;
    const group = EVENT_TYPE_GROUPS.find(g => g.label === eventTypeGroup);
    return group ? group.types.includes(e.typeEvent) : true;
  });
  const grouped = groupEventsByDate(filteredEvents);

  // Detectar ciudad para el título
  let cityLabel = 'All Norway'; // Default value
  if (county === 'auto') {
    if (geolocationError) {
      cityLabel = 'All Norway'; // On error, show a sensible default
    } else {
      cityLabel = autoCounty ? autoCounty : 'Detecting location...';
    }
  } else if (county && county !== 'All') {
    cityLabel = county;
  }

  const handleDelete = async (eventId: number) => {
    if (!token) return;
    setEventIdToDelete(eventId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!token || eventIdToDelete == null) return;
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    try {
      const res = await fetch(`${apiBase}/api/EventsApi/${eventIdToDelete}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.status === 401) {
        throw new Error('Unauthorized. Only the creator or an admin can delete this event or your session has expired.');
      }
      if (res.status === 403) {
        throw new Error('You do not have permission to delete this event.');
      }
      if (!res.ok) throw new Error('Failed to delete event');
      setSelectedEvent(null);
      setShowDeleteModal(false);
      setEventIdToDelete(null);
      // Refrescar eventos tras eliminar
      fetchEvents();
    } catch (err: any) {
      setError(err.message);
      setShowDeleteModal(false);
      setEventIdToDelete(null);
    }
  };

  if (loading) return <div>Loading events...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto pb-4 px-2">
      {user && (
        <div className="flex justify-end mb-0"> {/* Solo muestra el contenedor si hay usuario */}
          <button
            className="bg-tangoBlue text-white px-3 py-1 rounded hover:bg-tangoGold transition text-sm"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Event or Class
          </button>
        </div>
      )}
      {/* Compact block for title and filters with reduced margin */}
      <div className="mt-2 mb-3">
        <h2 className="text-base font-semibold mb-1 text-center text-tangoBlue">
          Tango Events in: {" "}
          <span className="text-tangoGreen-dark">{cityLabel}</span>
        </h2>
        <div className="flex flex-row gap-2 justify-center">
          <div className="flex-1 min-w-[120px] max-w-[200px]">
            <select
              className="border rounded px-2 py-1 text-sm text-tangoBlue focus:outline-none focus:ring-2 focus:ring-tangoGold w-full"
              value={county}
              onChange={e => setCounty(e.target.value)}
              aria-label="County"
            >
              <option value="" disabled hidden>County</option>
              <option value="All">All</option>
              <option value="auto">Auto (Detect my county)</option>
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[120px] max-w-[200px]">
            <select
              className="border rounded px-2 py-1 text-sm text-tangoBlue focus:outline-none focus:ring-2 focus:ring-tangoGold w-full"
              value={eventTypeGroup}
              onChange={e => setEventTypeGroup(e.target.value)}
              aria-label="Type"
            >
              <option value="" disabled hidden>Type</option>
              {EVENT_TYPE_GROUPS.map(group => (
                <option key={group.label} value={group.label}>{group.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Display geolocation error if it exists */}
      {geolocationError && county === 'auto' && (
        <div className="text-center text-orange-600 bg-orange-100 border border-orange-300 rounded-md p-2 mb-4 text-sm">
          {geolocationError}
        </div>
      )}

      {/* Display message if no events are found */}
      {Object.keys(grouped).length === 0 && !loading && (
        <div className="text-center text-tangoBlue font-semibold text-lg my-8">
          No events found for the selected area.
        </div>
      )}
      
      {Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map(date => (
        <div key={date} className="mb-4">
          <h3 className="text-base font-semibold mb-2 text-tangoBlue border-b pb-0.5">{formatDateTitle(grouped[date][0].date)}</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {grouped[date].map((event) => (
              <div
                key={event.id}
                className="bg-tangoWhite rounded-lg shadow-md p-3 border border-tangoGold hover:shadow-xl transition cursor-pointer hover:bg-tangoGold-light group min-h-[80px] flex flex-col justify-between w-full max-w-xs mx-auto box-border"
                onClick={() => setSelectedEvent(event)}
              >
                <div>
                  <h4 className="text-base font-semibold mb-1 text-tangoBlue group-hover:text-tangoGold-dark truncate">{event.eventName}</h4>
                  <div className="text-xs text-tangoGold-dark mb-1 flex flex-row items-center gap-2">
                    <span>{event.typeEvent}</span>
                    <span className="text-gray-400">&bull;</span>
                    <span>{event.starts} - {event.ends}</span>
                  </div>
                  {user && (event.createdBy === user.email || user.email === 'aracenafernando@gmail.com') && (
                    <div className="mt-2 flex gap-2">
                      <button
                        className="bg-tangoGreen-dark text-white px-3 py-1 rounded text-xs hover:bg-tangoGold transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEventToEdit(event);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(event.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal de detalles */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overscroll-contain">
          <div className="bg-tangoWhite w-full max-w-full sm:max-w-md p-2 sm:p-8 rounded-none sm:rounded-lg shadow-lg relative animate-fadeIn border-2 border-tangoGold overflow-y-auto overflow-x-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-tangoGreen hover:text-tangoGold-dark text-2xl font-bold z-10"
              onClick={() => setSelectedEvent(null)}
              aria-label="Cerrar"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-2 text-tangoBlue">{selectedEvent.eventName}</h3>
            <div className="text-sm text-tangoGold-dark mb-2">{selectedEvent.typeEvent} &bull; {parseDDMMYYYY(selectedEvent.date)?.toLocaleDateString()} {selectedEvent.starts} - {selectedEvent.ends}</div>
            <div className="text-tangoGreen-dark mb-2 break-words">{selectedEvent.description}</div>
            <div className="text-tangoGreen-dark text-sm mb-1 break-words">Organizer: {selectedEvent.organizer}</div>
            <div className="text-tangoGreen-dark text-sm mb-1 break-words">Address: {selectedEvent.address}</div>
            <div className="text-tangoGold-dark text-sm mb-1 break-words">Price: {selectedEvent.price}</div>
            <div className="text-tangoGreen-dark text-sm mb-1 break-words">City: {selectedEvent.city} ({selectedEvent.county})</div>
            {selectedEvent.eventLink && (
              <a href={selectedEvent.eventLink} target="_blank" rel="noopener noreferrer" className="text-tangoGreen hover:text-tangoGold-dark text-sm break-all">More Info...</a>
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
            fetchEvents();
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
            fetchEvents();
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
