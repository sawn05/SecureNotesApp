using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureNotesApp.Data;
using SecureNotesApp.Models;

namespace SecureNotesApp.Controllers
{
    public class TasksController : Controller
    {
        private readonly ApplicationDbContext _context;

        public TasksController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var tasks = await _context.TodoTasks.OrderBy(t => t.DueDate).ToListAsync();

            // Tính toán thống kê
            var totalTasks = tasks.Count;
            var completedTasks = tasks.Count(t => t.IsCompleted);
            
            // Số task sắp đến hạn (trong vòng 7 ngày tới)
            var now = DateTime.Now;
            var upcomingTasks = tasks.Count(t => !t.IsCompleted && t.DueDate >= now && t.DueDate <= now.AddDays(7));

            // Tính phần trăm tiến độ
            int progress = totalTasks > 0 ? (int)Math.Round((double)completedTasks / totalTasks * 100) : 0;

            // Truyền dữ liệu ra View bằng ViewBag
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
                
                _context.TodoTasks.Add(task);
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