// Id, Email, UserName, Roles (List<string>), IsLocked (bool)
namespace SecureNotesApp.Models
{
    public class UserManagementViewModel
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public List<string> Roles { get; set; }
        public bool IsLocked { get; set; }
    }
}