using System.ComponentModel.DataAnnotations;

namespace SecureNotesApp.Models
{
    public class Prompt
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        [Required]
        public string Content { get; set; }

        // Thông tin Danh mục (Ví dụ: "Lập trình", "💻", "coding")
        public string CategoryName { get; set; } 
        public string CategoryIcon { get; set; } 
        public string CategoryClass { get; set; }

        public bool IsFavorite { get; set; } = false;
        
        public int UseCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        public bool IsPublic { get; set; } = false;
        public string? OwnerId { get; set; }
    }
}