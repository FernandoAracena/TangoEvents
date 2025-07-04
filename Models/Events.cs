using System;
using System.ComponentModel.DataAnnotations;

namespace TangoKultura.Models
{
    public class Event
    {
        [Key]
        public int Id { get; set; }
        public string? EventName { get; set; }
        public string? TypeEvent { get; set; }
        public string? Description { get; set; }
        public string? Organizer { get; set; }
        public string? CreatedBy { get; set; }
        public string? Address { get; set; }
        [Required]
        public required string Date { get; set; }
        public string? EndsDate { get; set; }
        public string? Starts { get; set; }
        public string? Ends { get; set; }
        public string? Price { get; set; }
        public string? EventLink { get; set; }
        [Required]
        public required string City { get; set; }
    }
}
