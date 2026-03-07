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

        // public async Task<IActionResult> Index()
        // {
        //     var userName = User.Identity?.Name;
        //     if (string.IsNullOrEmpty(userName)) return RedirectToAction("Login", "Account");

        //     // 1. Đếm số lượng từ Database
        //     // var totalAccounts = await _context.SavedAccounts.CountAsync(x => x.OwnerId == userName);
        //     var totalNotes = await _context.Notes.CountAsync(x => x.OwnerID == userName);
            
        //     var tasks = await _context.TodoTasks.Where(x => x.OwnerName == userName && x.CreatedAt.Date == DateTime.Today).ToListAsync();
        //     var tasksToday = tasks.Count;
            
        //     int completedTasks = tasks.Count(x => x.IsCompleted);
        //     string rate = tasksToday > 0 ? $"{(completedTasks * 100 / tasksToday)}%" : "0%";

        //     var recentNotes = await _context.Notes
        //         .Where(x => x.OwnerID == userName)
        //         .OrderByDescending(x => x.CreatedAt)
        //         .Take(3)
        //         .Select(n => new ActivityItem {
        //             Title = $"Đã cập nhật ghi chú \"{n.Title}\"",
        //             Time = n.CreatedAt.ToString("HH:mm"),
        //             IconColor = "#f59e0b",
        //             BgColor = "rgba(245, 158, 11, 0.1)",
        //             SvgPath = "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"
        //         }).ToListAsync();

        //     var model = new DashboardViewModel {
        //         UserName = userName.Split('@')[0],
        //         TotalAccounts = 0, // Need update
        //         TotalNotes = totalNotes,
        //         TasksToday = tasksToday,
        //         CompletionRate = rate,
        //         RecentActivities = recentNotes
        //     };

        //     return View(model);
        // }


        public async Task<IActionResult> Index()
        {
            var userName = User.Identity?.Name;
            if (string.IsNullOrEmpty(userName)) return RedirectToAction("Login", "Account");

            // 1. Thống kê số lượng (giữ nguyên hoặc cập nhật)
            var totalNotes = await _context.Notes.CountAsync(x => x.OwnerID == userName);
            var totalAccounts = await _context.SavedAccounts.CountAsync(x => x.OwnerID == userName);
            var tasks = await _context.TodoTasks.Where(x => x.OwnerName == userName && x.CreatedAt.Date == DateTime.Today).ToListAsync();
            
            var noteActs = await _context.Notes
                .Where(x => x.OwnerID == userName)
                .OrderByDescending(x => x.CreatedAt).Take(5)
                .Select(n => new { 
                    Message = $"Cập nhật ghi chú: {n.Title}", 
                    Date = n.CreatedAt, 
                    Type = "Note" 
                })
                .ToListAsync();

            var accountActs = await _context.SavedAccounts
                .Where(x => x.OwnerID == userName)
                .OrderByDescending(x => x.CreatedAt).Take(5)
                .Select(a => new { 
                    Message = $"Đã thêm tài khoản {a.PlatformGroup} mới", 
                    Date = a.CreatedAt, 
                    Type = "Account" 
                })
                .ToListAsync();

            var taskActs = await _context.TodoTasks
                .Where(x => x.OwnerName == userName)
                .OrderByDescending(x => x.CreatedAt).Take(5)
                .Select(t => new { 
                    Message = $"Đã tạo công việc: {t.Title}", 
                    Date = t.CreatedAt, 
                    Type = "Task" 
                })
                .ToListAsync();

            var allActivities = noteActs.Concat(accountActs).Concat(taskActs)
                .OrderByDescending(x => x.Date)
                .Take(4)
                .Select(x => new ActivityItem
                {
                    Title = x.Message,
                    Time = GetRelativeTime(x.Date), 
                    
                    IconColor = x.Type == "Note" ? "#f59e0b" : (x.Type == "Account" ? "#667eea" : "#10b981"),
                    BgColor = x.Type == "Note" ? "rgba(245, 158, 11, 0.1)" : (x.Type == "Account" ? "rgba(102, 126, 234, 0.1)" : "rgba(16, 185, 129, 0.1)"),
                    SvgPath = x.Type == "Note" ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" : 
                            (x.Type == "Account" ? "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" : 
                            "M5 13l4 4L19 7")
                }).ToList();

            var model = new DashboardViewModel
            {
                UserName = userName.Split('@')[0],
                TotalAccounts = totalAccounts,
                TotalNotes = totalNotes,
                TasksToday = tasks.Count,
                CompletionRate = tasks.Count > 0 ? $"{(tasks.Count(t => t.IsCompleted) * 100 / tasks.Count)}%" : "0%",
                RecentActivities = allActivities
            };

            return View(model);
        }

        public static string GetRelativeTime(DateTime dateTime)
        {
            var timeSpan = DateTime.Now - dateTime;

            if (timeSpan <= TimeSpan.FromSeconds(60))
                return "Vừa xong";

            if (timeSpan <= TimeSpan.FromMinutes(60))
                return $"{timeSpan.Minutes} phút trước";

            if (timeSpan <= TimeSpan.FromHours(24))
                return $"{timeSpan.Hours} giờ trước";

            if (timeSpan <= TimeSpan.FromDays(2))
                return "Hôm qua";

            if (timeSpan <= TimeSpan.FromDays(30))
                return $"{timeSpan.Days} ngày trước";

            if (timeSpan <= TimeSpan.FromDays(365))
                return $"{dateTime.Month} tháng trước";

            return dateTime.ToString("dd/MM/yyyy");
        }
    }
}