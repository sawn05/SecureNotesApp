using System.ComponentModel.DataAnnotations;

namespace SecureNotesApp.Models
{
    public class SavedAccount
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string PlatformGroup { get; set; }

        [MaxLength(100)]
        public string? Username { get; set; }

        [Required]
        public string Password { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(100)]
        public string? FullName { get; set; }
        [MaxLength(100)]
        public string Email { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public string? OwnerID { get; set; }
    }
}