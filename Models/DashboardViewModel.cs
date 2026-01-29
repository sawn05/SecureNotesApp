namespace SecureNotesApp.Models
{
    public class DashboardViewModel
    {
        public int TotalNotes { get; set; }
        public int NotesToday { get; set; }
        
        public int[] ChartData { get; set; } 
        
        public string[] ChartLabels { get; set; }
    }
}