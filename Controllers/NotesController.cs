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

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> TogglePin(int id)
    {
        var note = await _context.Notes.FindAsync(id);
        if (note == null) return NotFound();

        note.IsPinned = !note.IsPinned;

        _context.Update(note);
        await _context.SaveChangesAsync();

        return RedirectToAction(nameof(Index));
    }   

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, Note note)
    {
        if (id != note.Id) return NotFound();

        if (ModelState.IsValid)
        {
            var existingNote = await _context.Notes.FindAsync(id);
            if (existingNote != null)
            {
                existingNote.Title = note.Title;
                existingNote.Content = note.Content;
                existingNote.Color = note.Color;
                
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var note = await _context.Notes.FindAsync(id);
        
        if (note != null)
        {
            _context.Notes.Remove(note);
            
            await _context.SaveChangesAsync();
        }

        return RedirectToAction(nameof(Index));
    }   
}