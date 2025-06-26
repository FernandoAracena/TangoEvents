using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using TangoKultura.Data;
using TangoKultura.Models;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using System.Linq;
using System.Globalization;
using System.Collections.Generic;

namespace TangoKultura.Controllers
{
    public class EventsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public EventsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Events
        [AllowAnonymous]
        public IActionResult Index(string eventType = "", string subEventType = "", bool upcomingCourses = true)
        {
            if (string.IsNullOrEmpty(eventType))
            {
                eventType = "Events";
            }

            IEnumerable<Event> objEventList = _context.Events
                .ToList()
                .Where(e => !string.IsNullOrEmpty(e.Date) && (DateTime.ParseExact(e.Date, "dd-MM-yyyy", CultureInfo.InvariantCulture) >= DateTime.Today || (!string.IsNullOrEmpty(e.EndsDate) && DateTime.ParseExact(e.EndsDate, "dd-MM-yyyy", CultureInfo.InvariantCulture) >= DateTime.Today)))
                .OrderBy(e => DateTime.ParseExact(e.Date, "dd-MM-yyyy", CultureInfo.InvariantCulture))
                .ThenBy(e => DateTime.Parse(e.Starts));

            // Separate lists for upcoming and started courses
            IEnumerable<Event> objUpcomingCoursesList = Enumerable.Empty<Event>();
            IEnumerable<Event> objStartedCoursesList = Enumerable.Empty<Event>();

            // Filter by city
            //if (string.IsNullOrEmpty(city))
            //{
            //    city = "Oslo";
            //}

            //if (!string.IsNullOrEmpty(city))
            //{
            //    objEventList = objEventList.Where(e => e.City == city);
            //}

            if (!string.IsNullOrEmpty(subEventType))
            {
                if (subEventType == "Class")
                {
                    objEventList = objEventList.Where(e => e.TypeEvent == "Class");
                }
                else if (subEventType == "Course")
                {
                    objUpcomingCoursesList = objEventList
                        .Where(e => e.TypeEvent == "Course" &&
                                    (DateTime.ParseExact(e.Date, "dd-MM-yyyy", CultureInfo.InvariantCulture) > DateTime.Today));

                    objStartedCoursesList = objEventList
                        .Where(e => e.TypeEvent == "Course" &&
                                    (DateTime.ParseExact(e.Date, "dd-MM-yyyy", CultureInfo.InvariantCulture) <= DateTime.Today));
                }
            }
            else if (!string.IsNullOrEmpty(eventType))
            {
                if (eventType == "Classes")
                {
                    subEventType = "Class";
                    objEventList = objEventList.Where(e => e.TypeEvent == "Class");
                }
                else if (eventType == "Events")
                {
                    objEventList = objEventList.Where(e => e.TypeEvent == "Milonga" || e.TypeEvent == "Concert" || e.TypeEvent == "Practice" || e.TypeEvent == "Class" || (e.TypeEvent == "Course" && DateTime.ParseExact(e.Date, "dd-MM-yyyy", CultureInfo.InvariantCulture) >= DateTime.Today)
);
                }
            }

            List<string> eventDates = objEventList.Select(e => e.Date).Distinct().ToList();
            objEventList = objEventList
                .OrderBy(e => DateTime.ParseExact(e.Date, "dd-MM-yyyy", CultureInfo.InvariantCulture))
                .ThenBy(e => DateTime.Parse(e.Starts));

            ViewData["EventDates"] = eventDates;
            ViewData["EventType"] = eventType;
            ViewData["subEventType"] = subEventType;
            //ViewData["City"] = city;

            // Pass both lists to the view
            ViewBag.UpcomingCoursesList = objUpcomingCoursesList;
            ViewBag.StartedCoursesList = objStartedCoursesList;

            // Filter the courses based on the selected option (upcoming or started)
            if (subEventType == "Course")
            {
                objEventList = upcomingCourses ? objUpcomingCoursesList : objStartedCoursesList;
            }
            ViewData["UpcomingCourses"] = upcomingCourses.ToString();


            return View(objEventList);
        }

        // GET: Events/Create
        [Authorize]

        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize]

        public IActionResult Create(Event obj)
        {

            if (ModelState.IsValid)
            {
                // Validate Date
                if (!IsValidDateFormat(obj.Date, "dd-MM-yyyy"))
                {
                    ModelState.AddModelError("Date", "Invalid Date format. Please use a valid Day-Month-Year (dd-MM-yyyy) format.");
                    return View(obj);
                }

                if (string.IsNullOrEmpty(obj.EndsDate))
                {
                    obj.EndsDate = obj.Date;
                }

                // Validate Starts Time
                if (!IsValidTimeFormat(obj.Starts, "HH:mm"))
                {
                    ModelState.AddModelError("Starts", "Invalid Starts time format. Please use HH:mm format.");
                    return View(obj);
                }

                // Validate Ends Time
                if (!IsValidTimeFormat(obj.Ends, "HH:mm"))
                {
                    ModelState.AddModelError("Ends", "Invalid Ends time format. Please use HH:mm format.");
                    return View(obj);
                }

                // Set the organizer of the event to the ID of the currently authenticated user
                obj.CreatedBy = User.FindFirstValue(ClaimTypes.NameIdentifier);

                // Asignar el county automáticamente según la ciudad
                // (El campo County ya no existe en el modelo Event, solo se calcula en la API)

                _context.Events.Add(obj);
                _context.SaveChanges();
                TempData["success"] = "Event created successfully !!!";
                return RedirectToAction("Index");
            }
            return View(obj);
        }

        // GET: Events/Details/5
        [AllowAnonymous]

        public IActionResult Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var obj = _context.Events
                .FirstOrDefault(m => m.Id == id);
            if (obj == null)
            {
                return NotFound();
            }

            return View(obj);
        }

        // GET: Events/Edit/5
        [Authorize]

        public IActionResult Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var eventFromDb = _context.Events.Find(id);
            if (eventFromDb == null)
            {
                return NotFound();
            }

            // Check if the current user is authorized to edit the event
            if (!UserCanEditEvent(eventFromDb))
            {
                return Forbid();
            }

            return View(eventFromDb);
        }


        // POST: Events/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize]

        public IActionResult Edit(Event obj)
        {
            if (ModelState.IsValid)
            {
                var eventFromDb = _context.Events.Find(obj.Id);
                if (eventFromDb == null)
                {
                    return NotFound();
                }

                // Check if the current user is authorized to edit the event
                if (!UserCanEditEvent(eventFromDb))
                {
                    return Forbid();
                }

                // Update the properties of the event object
                eventFromDb.EventName = obj.EventName;
                eventFromDb.TypeEvent = obj.TypeEvent;
                eventFromDb.Organizer = obj.Organizer;
                eventFromDb.Description = obj.Description;
                eventFromDb.Address = obj.Address;
                eventFromDb.Date = obj.Date;
                eventFromDb.EndsDate = obj.EndsDate;
                eventFromDb.Starts = obj.Starts;
                eventFromDb.Ends = obj.Ends;
                eventFromDb.Price = obj.Price;
                eventFromDb.EventLink = obj.EventLink;

                _context.Events.Update(eventFromDb);
                _context.SaveChanges();
                TempData["success"] = "Event updated successfully !!!";
                return RedirectToAction("Index");
            }

            return View(obj);
        }


        // GET: Events/Delete/5
        [Authorize]

        public IActionResult Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var obj = _context.Events
                .FirstOrDefault(m => m.Id == id);
            if (obj == null)
            {
                return NotFound();
            }

            // Check if the current user is authorized to delete the event
            if (!UserCanEditEvent(obj))
            {
                return Forbid();
            }

            return View(obj);
        }

        // POST: Events/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        [Authorize]

        public IActionResult DeleteConfirmed(int id)
        {
            var obj = _context.Events.Find(id);
            if (obj == null)
            {
                return NotFound();
            }

            // Check if the current user is authorized to delete the event
            if (!UserCanEditEvent(obj))
            {
                return Forbid();
            }

            _context.Events.Remove(obj);
            _context.SaveChanges();
            TempData["success"] = "Event removed successfully !!!";

            return RedirectToAction(nameof(Index));
        }

        private bool EventExists(int id)
        {
            return _context.Events.Any(e => e.Id == id);
        }

        private bool UserCanEditEvent(Event ev)
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return ev.CreatedBy == userId || User.IsInRole("Admin");
        }

        private bool IsValidDateFormat(string value, string format)
        {
            DateTime date;
            return DateTime.TryParseExact(value, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out date);
        }

        private bool IsValidTimeFormat(string value, string format)
        {
            DateTime time;
            return DateTime.TryParseExact(value, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out time);
        }
    }
}