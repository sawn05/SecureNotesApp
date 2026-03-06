namespace SecureNotesApp.Models
{
    public class DashboardViewModel
    {
        public string UserName { get; set; } = "";
        public int TotalAccounts { get; set; }
        public int TasksToday { get; set; }
        public int TotalNotes { get; set; }
        public string CompletionRate { get; set; } = "0%";

        public List<ActivityItem> RecentActivities { get; set; } = new List<ActivityItem>();
    }

    public class ActivityItem
    {
        public string Title { get; set; } = "";
        public string Time { get; set; } = "";
        public string IconColor { get; set; } = "";
        public string BgColor { get; set; } = "";
        public string SvgPath { get; set; } = "";
    }
}