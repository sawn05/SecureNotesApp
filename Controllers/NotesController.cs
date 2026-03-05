using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureNotesApp.Data; // Thay bằng namespace thực tế của bạn
using SecureNotesApp.Models;

public class NotesController : Controller
{
    private readonly ApplicationDbContext _context;

    public NotesController(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        var currentUser = User.Identity?.Name;
        
        var notes = await _context.Notes
            .Where(n => n.OwnerID == currentUser)
            .OrderByDescending(n => n.IsPinned) 
            .ThenByDescending(n => n.CreatedAt) 
            .ToListAsync();

        return View(notes ?? new List<Note>());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Note note)
    {
        if (ModelState.IsValid)
        {
            note.CreatedAt = DateTime.Now;
            note.IsPinned = false; 
            
            note.OwnerID = User.Identity?.Name;

            _context.Notes.Add(note);
            await _context.SaveChangesAsync();

            return RedirectToAction(nameof(Index));
        }

        return RedirectToAction(nameof(Index));
    }
}