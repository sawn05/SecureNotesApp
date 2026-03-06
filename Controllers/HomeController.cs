using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureNotesApp.Models;
using SecureNotesApp.Helpers;
using SecureNotesApp.Data;

namespace SecureNotesApp.Controllers
{
    public class HomeController : Controller
    {

        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var userName = User.Identity?.Name;
            if (string.IsNullOrEmpty(userName)) return RedirectToAction("Login", "Account");

            // 1. Đếm số lượng từ Database
            // var totalAccounts = await _context.SavedAccounts.CountAsync(x => x.OwnerId == userName);
            var totalNotes = await _context.Notes.CountAsync(x => x.OwnerID == userName);
            
            var tasks = await _context.TodoTasks.Where(x => x.OwnerName == userName && x.CreatedAt.Date == DateTime.Today).ToListAsync();
            var tasksToday = tasks.Count;
            
            int completedTasks = tasks.Count(x => x.IsCompleted);
            string rate = tasksToday > 0 ? $"{(completedTasks * 100 / tasksToday)}%" : "0%";

            var recentNotes = await _context.Notes
                .Where(x => x.OwnerID == userName)
                .OrderByDescending(x => x.CreatedAt)
                .Take(3)
                .Select(n => new ActivityItem {
                    Title = $"Đã cập nhật ghi chú \"{n.Title}\"",
                    Time = n.CreatedAt.ToString("HH:mm"),
                    IconColor = "#f59e0b",
                    BgColor = "rgba(245, 158, 11, 0.1)",
                    SvgPath = "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"
                }).ToListAsync();

            var model = new DashboardViewModel {
                UserName = userName.Split('@')[0],
                TotalAccounts = 0, // Need update
                TotalNotes = totalNotes,
                TasksToday = tasksToday,
                CompletionRate = rate,
                RecentActivities = recentNotes
            };

            return View(model);
        }
    }
}