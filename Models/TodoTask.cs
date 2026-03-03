using System.ComponentModel.DataAnnotations;

namespace SecureNotesApp.Models
{
    public class TodoTask
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        public string Description { get; set; }

        // Due date
        [Required]
        public DateTime DueDate { get; set; }

        // Status
        public bool IsCompleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}