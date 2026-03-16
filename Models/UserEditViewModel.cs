namespace SecureNotesApp.Models
{
    public class UserEditViewModel
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public IList<string> CurrentRoles { get; set; }
        public List<string> AllRoles { get; set; } 
        public string SelectedRole { get; set; }
    }
}