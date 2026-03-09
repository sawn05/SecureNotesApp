using Microsoft.AspNetCore.Identity;

namespace SecureNotesApp.Models
{
    public class AdminDashboardViewModel
    {
        public int TotalUsers { get; set; }
        public int TotalNotes { get; set; }
        public int TotalAccounts { get; set; }
        public int TotalTasks { get; set; }
        public List<IdentityUser> RecentUsers { get; set; }
        public List<string> ChartLabels { get; set; } = new();
        public List<int> ChartData { get; set; } = new();
    }
}