using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using TangoKultura.Data;
using TangoKultura.Helpers;
using TangoKultura.Models;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;

namespace TangoKultura.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EventsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/EventsApi
        [HttpGet]
        public IActionResult GetEvents(string eventType = "", string subEventType = "", bool upcomingCourses = true, string county = "")
        {
            if (string.IsNullOrEmpty(eventType))
            {
                eventType = "Events";
            }

            IQueryable<Event> query = _context.Events;

            var events = query.ToList();

            var filteredEvents = events.Where(e => DateTime.Parse(e.Date).Date >= DateTime.Today);


            if (!string.IsNullOrEmpty(county) && county != "All")
            {
                filteredEvents = filteredEvents.Where(e => NorwayCountyHelper.GetCountyForCity(e.City).Equals(county, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrEmpty(subEventType))
            {
                if (subEventType == "Class")
                {
                    filteredEvents = filteredEvents.Where(e => e.TypeEvent == "Class");
                }
                else if (subEventType == "Course")
                {
                    if (upcomingCourses)
                    {
                        filteredEvents = filteredEvents.Where(e => e.TypeEvent == "Course" && DateTime.Parse(e.Date) > DateTime.Today);
                    }
                    else
                    {
                        filteredEvents = filteredEvents.Where(e => e.TypeEvent == "Course" && DateTime.Parse(e.Date) <= DateTime.Today);
                    }
                }
            }
            else if (!string.IsNullOrEmpty(eventType))
            {
                if (eventType == "Classes")
                {
                    filteredEvents = filteredEvents.Where(e => e.TypeEvent == "Class");
                }
                else if (eventType == "Events")
                {
                    filteredEvents = filteredEvents.Where(e => e.TypeEvent == "Milonga" || e.TypeEvent == "Concert" || e.TypeEvent == "Practice" || e.TypeEvent == "Class" || (e.TypeEvent == "Course" && DateTime.Parse(e.Date) >= DateTime.Today));
                }
            }

            var eventDtos = filteredEvents
                .OrderBy(e => DateTime.Parse(e.Date))
                .ThenBy(e => e.Starts)
                .Select(e => new EventDto
                {
                    Id = e.Id,
                    EventName = e.EventName,
                    TypeEvent = e.TypeEvent,
                    Description = e.Description,
                    Organizer = e.Organizer,
                    CreatedBy = e.CreatedBy,
                    Address = e.Address,
                    Date = DateTime.Parse(e.Date).ToString("dd-MM-yyyy"),
                    EndsDate = !string.IsNullOrEmpty(e.EndsDate) ? DateTime.Parse(e.EndsDate).ToString("dd-MM-yyyy") : null,
                    Starts = e.Starts,
                    Ends = e.Ends,
                    Price = e.Price,
                    EventLink = e.EventLink,
                    City = e.City,
                    County = NorwayCountyHelper.GetCountyForCity(e.City)
                })
                .ToList();

            return Ok(new { events = eventDtos });
        }

        // POST: api/EventsApi
        [HttpPost("")]
        [Authorize]
        public IActionResult Post([FromBody] JsonElement eventData)
        {
            if (eventData.ValueKind == JsonValueKind.Undefined || eventData.ValueKind == JsonValueKind.Null)
                return BadRequest("No event data provided.");

            var eventsToAdd = new List<Event>();
            try
            {
                // We are now expecting a single event object, not an array
                if (eventData.ValueKind == JsonValueKind.Object)
                {
                    var singleEvent = JsonSerializer.Deserialize<Event>(eventData.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (singleEvent != null)
                        eventsToAdd.Add(singleEvent);
                }
                else
                {
                    return BadRequest("Invalid event data format. Expected a single event object.");
                }
            }
            catch (JsonException ex)
            {
                // Log the exception for debugging
                return BadRequest($"Invalid event data format: {ex.Message}");
            }

            if (eventsToAdd.Count == 0)
                return BadRequest("No valid events to add.");

            // Obtener email del usuario autenticado
            var userEmail = User?.Identity?.Name;
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("User email not found.");

            foreach (var ev in eventsToAdd)
            {
                ev.CreatedBy = userEmail;
                _context.Events.Add(ev);
            }
            _context.SaveChanges();

            return Created("/api/EventsApi", eventsToAdd);
        }

        // DELETE: api/EventsApi/5
        [HttpDelete("{id}")]
        [Authorize]
        public IActionResult Delete(int id)
        {
            var ev = _context.Events.FirstOrDefault(e => e.Id == id);
            if (ev == null)
                return NotFound();
            var userEmail = User?.Identity?.Name;
            // Permitir si es el creador o el admin
            if (string.IsNullOrEmpty(userEmail) || (!string.Equals(ev.CreatedBy, userEmail, StringComparison.OrdinalIgnoreCase) && !string.Equals(userEmail, "aracenafernando@gmail.com", StringComparison.OrdinalIgnoreCase)))
                return Forbid();
            _context.Events.Remove(ev);
            _context.SaveChanges();
            return NoContent();
        }

        // PUT: api/EventsApi/5
        [HttpPut("{id}")]
        [Authorize]
        public IActionResult Put(int id, [FromBody] Event updatedEvent)
        {
            var userEmail = User?.Identity?.Name;
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("User email not found.");

            var existingEvent = _context.Events.FirstOrDefault(e => e.Id == id);
            if (existingEvent == null)
                return NotFound();
            // Permitir si es el creador o el admin
            if (!string.Equals(existingEvent.CreatedBy, userEmail, StringComparison.OrdinalIgnoreCase) && !string.Equals(userEmail, "aracenafernando@gmail.com", StringComparison.OrdinalIgnoreCase))
                return Forbid("You can only edit your own events.");

            // Actualizar campos permitidos
            existingEvent.EventName = updatedEvent.EventName;
            existingEvent.TypeEvent = updatedEvent.TypeEvent;
            existingEvent.Description = updatedEvent.Description;
            existingEvent.Organizer = updatedEvent.Organizer;
            existingEvent.Address = updatedEvent.Address;
            existingEvent.Date = updatedEvent.Date;
            existingEvent.EndsDate = updatedEvent.EndsDate;
            existingEvent.Starts = updatedEvent.Starts;
            existingEvent.Ends = updatedEvent.Ends;
            existingEvent.Price = updatedEvent.Price;
            existingEvent.EventLink = updatedEvent.EventLink;
            existingEvent.City = updatedEvent.City;
            // CreatedBy no se actualiza

            _context.SaveChanges();
            return Ok(existingEvent);
        }
    }
}
