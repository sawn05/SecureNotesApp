using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureNotesApp.Data;
using SecureNotesApp.Models;
using Microsoft.AspNetCore.Authorization;

namespace SecureNotesApp.Controllers
{
    [Authorize]
    public class TasksController : Controller
    {
        private readonly ApplicationDbContext _context;

        public TasksController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize] // Đảm bảo chỉ người đã đăng nhập mới vào được
        public async Task<IActionResult> Index()
        {
            // 1. Lấy tên người dùng hiện tại
            var currentUser = User.Identity?.Name;

            // 2. Chỉ lấy các task mà OwnerName khớp với người đang đăng nhập
            var tasks = await _context.TodoTasks
                                    .Where(t => t.OwnerName == currentUser) // LỌC Ở ĐÂY
                                    .OrderBy(t => t.DueDate)
                                    .ToListAsync();

            // 3. Các logic tính toán thống kê (giữ nguyên nhưng dựa trên danh sách đã lọc)
            var totalTasks = tasks.Count;
            var completedTasks = tasks.Count(t => t.IsCompleted);
            
            var now = DateTime.Now;
            var upcomingTasks = tasks.Count(t => !t.IsCompleted && t.DueDate >= now && t.DueDate <= now.AddDays(7));

            int progress = totalTasks > 0 ? (int)Math.Round((double)completedTasks / totalTasks * 100) : 0;

            ViewBag.TotalTasks = totalTasks;
            ViewBag.CompletedTasks = completedTasks;
            ViewBag.UpcomingTasks = upcomingTasks;
            ViewBag.Progress = progress;

            return View(tasks);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(TodoTask task)
        {
            if (ModelState.IsValid)
            {
                task.CreatedAt = DateTime.Now;
                task.IsCompleted = false;
                task.OwnerName = User.Identity?.Name;
                
                _context.TodoTasks.Add(task);

                // var log = new ActivityLog {
                //     UserId = User.GetUserId(),
                //     ActionType = "Create",
                //     EntityType = "Task",
                //     Description = $"Đã thêm Task mới: {task.Title}",
                //     CreatedAt = DateTime.Now
                // };
                // _context.ActivityLogs.Add(log);

                await _context.SaveChangesAsync();
                
                return RedirectToAction(nameof(Index));
            }
            return RedirectToAction(nameof(Index));
        }

        // HÀM ĐÁNH DẤU HOÀN THÀNH / CHƯA HOÀN THÀNH
        [HttpPost]
        public async Task<IActionResult> ToggleComplete(int id)
        {
            var task = await _context.TodoTasks.FindAsync(id);
            if (task != null)
            {
                task.IsCompleted = !task.IsCompleted;
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }

        // HÀM XÓA CÔNG VIỆC
        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            var task = await _context.TodoTasks.FindAsync(id);
            if (task != null)
            {
                _context.TodoTasks.Remove(task);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
}