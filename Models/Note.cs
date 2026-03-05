using System.ComponentModel.DataAnnotations;

namespace SecureNotesApp.Models
{
    public class Note
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string Color { get; set; } = "#ffffff";
        public bool IsPinned { get; set; } = false;
        public string? OwnerID { get; set; }
    }
}