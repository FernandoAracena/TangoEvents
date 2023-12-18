using System;
using System.ComponentModel.DataAnnotations;

namespace TangoKultura.Models
{
    public class Event
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string EventName { get; set; }
        [Required]
        public string TypeEvent { get; set; }
        public string Description { get; set; }
        [Required]
        public string Organizer { get; set; }
        [Required]
        public string CreatedBy { get; set; }
        [Required]
        public string Address { get; set; }
        [Required]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:dd-MM-yyyy}")]
        public string Date { get; set; }
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:dd-MM-yyyy}")]
        public string? EndsDate { get; set; }

        [Required]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:HH:mm}")]
        public string Starts { get; set; }

        [Required]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:HH:mm}")]
        public string Ends { get; set; }

        [Required]
        public string Price { get; set; }

        [Required]
        public string EventLink { get; set; }
    }
}
