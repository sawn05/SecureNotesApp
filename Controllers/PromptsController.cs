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
    }
}