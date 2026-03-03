using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureNotesApp.Data;
using SecureNotesApp.Models;

namespace SecureNotesApp.Controllers
{
    public class PromptsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public PromptsController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var prompts = await _context.Prompts.ToListAsync();
            return View(prompts);
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Prompt prompt)
        {
            if (ModelState.IsValid)
            {
                prompt.CreatedAt = DateTime.Now;
                prompt.UseCount = 0;
                prompt.IsFavorite = false;
                
                _context.Prompts.Add(prompt);
                await _context.SaveChangesAsync();
                
                return RedirectToAction(nameof(Index));
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> ToggleFavorite(int id)
        {
            var prompt = await _context.Prompts.FindAsync(id);
            if (prompt != null)
            {
                prompt.IsFavorite = !prompt.IsFavorite;
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }

        // Kỹ thuật AJAX: Tăng số lần sử dụng mà KHÔNG cần tải lại trang
        [HttpPost]
        public async Task<IActionResult> IncrementUseCount(int id)
        {
            var prompt = await _context.Prompts.FindAsync(id);
            if (prompt != null)
            {
                prompt.UseCount += 1;
                await _context.SaveChangesAsync();
                
                return Json(new { success = true, newCount = prompt.UseCount });
            }
            return Json(new { success = false });
        }

        // Edit prompt - Không cập nhật UseCount, IsFavorite và CreatedAt
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Prompt prompt)
        {
            if (id != prompt.Id) return NotFound();

            if (ModelState.IsValid)
            {
                var existingPrompt = await _context.Prompts.FindAsync(id);
                if (existingPrompt != null)
                {
                    existingPrompt.Title = prompt.Title;
                    existingPrompt.CategoryName = prompt.CategoryName;
                    existingPrompt.CategoryIcon = prompt.CategoryIcon;
                    existingPrompt.CategoryClass = prompt.CategoryClass;
                    existingPrompt.Description = prompt.Description;
                    existingPrompt.Content = prompt.Content;
                    
                    await _context.SaveChangesAsync();
                }
                return RedirectToAction(nameof(Index));
            }
            return RedirectToAction(nameof(Index));
        }

        // HÀM XÓA PROMPT
        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            var prompt = await _context.Prompts.FindAsync(id);
            if (prompt != null)
            {
                _context.Prompts.Remove(prompt);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
}