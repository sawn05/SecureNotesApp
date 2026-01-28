using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace SecureNotesApp.Models
{
    public class Note
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Tiêu đề không được để trống")]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nội dung không được để trống")]
        // Chỉ lưu chuỗi đã mã hóa, không lưu text gốc
        public string EncryptedContent { get; set; } = string.Empty;

        [DataType(DataType.DateTime)]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Required]
        public string UserId { get; set; } = string.Empty;

        // Khóa ngoại 
        [ForeignKey(nameof(UserId))]
        public virtual IdentityUser? User { get; set; }
        
        // Property phụ để hứng dữ liệu text thường từ Form nhập vào (Không lưu vào DB)
        [NotMapped]
        public string PlainContent { get; set; } = string.Empty;
    }
}