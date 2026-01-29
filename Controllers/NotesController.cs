using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureNotesApp.Data;
using SecureNotesApp.Helpers;
using SecureNotesApp.Models;
using System.Security.Claims;

namespace SecureNotesApp.Controllers
{
    [Authorize]
    public class NotesController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;

        public NotesController(ApplicationDbContext context, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // public async Task<IActionResult> Index()
        // {
        //     var userId = _userManager.GetUserId(User);

        //     var notes = await _context.Notes
        //         .Where(n => n.UserId == userId)
        //         .OrderByDescending(n => n.CreatedAt)
        //         .ToListAsync();

        //     return View(notes);
        // }

        public async Task<IActionResult> Index(string searchString)
        {
            var userId = _userManager.GetUserId(User);

            var notes = from n in _context.Notes
                        where n.UserId == userId
                        select n;

            if (!string.IsNullOrEmpty(searchString))
            {
                notes = notes.Where(s => s.Title.Contains(searchString));
                ViewData["CurrentFilter"] = searchString;
            }

            return View(await notes.OrderByDescending(n => n.CreatedAt).ToListAsync());
        }


        // --- ACTION DASHBOARD ---
        public async Task<IActionResult> Dashboard()
        {
            var userId = _userManager.GetUserId(User);

            // Lấy tất cả ghi chú của user này (Chỉ lấy cột CreatedAt cho nhẹ)
            var allNotes = await _context.Notes
                .Where(n => n.UserId == userId)
                .Select(n => n.CreatedAt) 
                .ToListAsync();

            // 1. Tính tổng số
            int total = allNotes.Count;

            // 2. Tính số ghi chú hôm nay
            int today = allNotes.Count(n => n.Date == DateTime.Today);

            // 3. Chuẩn bị dữ liệu cho Biểu đồ (7 ngày gần nhất)
            // Tạo 2 mảng rỗng để chứa dữ liệu
            int[] data = new int[7];
            string[] labels = new string[7];

            for (int i = 0; i < 7; i++)
            {
                // Tính ngược từ hôm nay về quá khứ (Hôm nay là index 6, hôm qua là 5...)
                // Hoặc xếp từ quá khứ đến hiện tại (Ngày kia là 0, ..., Hôm nay là 6)
                
                // Cách làm: Lấy ngày hiện tại trừ đi (6 - i) ngày
                DateTime dateToCheck = DateTime.Today.AddDays(-(6 - i));
                
                // Đếm số note trong ngày đó
                data[i] = allNotes.Count(n => n.Date == dateToCheck);
                
                // Tạo nhãn ngày (ví dụ: 29/01)
                labels[i] = dateToCheck.ToString("dd/MM");
            }

            // Đóng gói vào ViewModel
            var model = new DashboardViewModel
            {
                TotalNotes = total,
                NotesToday = today,
                ChartData = data,
                ChartLabels = labels
            };

            return View(model);
        }


        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Note note)
        {
            var userId = _userManager.GetUserId(User);
            note.UserId = userId ?? "UserTam"; 
            note.CreatedAt = DateTime.Now;

            if (!string.IsNullOrEmpty(note.PlainContent))
            {
                note.EncryptedContent = SecurityHelper.Encrypt(note.PlainContent);
            }

            ModelState.Remove("UserId");
            ModelState.Remove("User");
            ModelState.Remove("EncryptedContent");

            if (!ModelState.IsValid)
            {
                Console.WriteLine("----------- ĐANG CÓ LỖI VALIDATION -----------");
                foreach (var modelStateKey in ModelState.Keys)
                {
                    var modelStateVal = ModelState[modelStateKey];
                    foreach (var error in modelStateVal.Errors)
                    {
                        Console.WriteLine($"❌ Trường: {modelStateKey} - Lỗi: {error.ErrorMessage}");
                    }
                }
                Console.WriteLine("----------------------------------------------");
            }

            if (ModelState.IsValid)
            {
                _context.Add(note);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }

            return View(note);
        }


        public async Task<IActionResult> Details(int? id)
        {
            if (id == null) return NotFound();

            var note = await _context.Notes
                .FirstOrDefaultAsync(m => m.Id == id);

            if (note == null) return NotFound();

            var currentUserId = _userManager.GetUserId(User);
            if (note.UserId != currentUserId)
            {
                return Forbid(); // 403
            }

            // Giải mã và hiện lên plainContent
            note.PlainContent = SecurityHelper.Decrypt(note.EncryptedContent);

            return View(note);
        }

        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null) return NotFound();

            var note = await _context.Notes.FirstOrDefaultAsync(m => m.Id == id);
            
            var currentUserId = _userManager.GetUserId(User);
            if (note != null && note.UserId != currentUserId)
            {
                return Forbid();
            }

            if (note != null)
            {
                _context.Notes.Remove(note);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }




        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();

            var note = await _context.Notes.FindAsync(id);
            if (note == null) return NotFound();

            var userId = _userManager.GetUserId(User);
            if (note.UserId != userId)
            {
                return Forbid(); // 403
            }

            // Giải mã để hiển thị trong form
            note.PlainContent = SecurityHelper.Decrypt(note.EncryptedContent);

            return View(note);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Note note)
        {
            if (id != note.Id) return NotFound();

            var userId = _userManager.GetUserId(User);

            if (!string.IsNullOrEmpty(note.PlainContent))
            {
                note.EncryptedContent = SecurityHelper.Encrypt(note.PlainContent);
            }

            ModelState.Remove("UserId");
            ModelState.Remove("User");
            ModelState.Remove("EncryptedContent");

            if (ModelState.IsValid)
            {
                try
                {
                    // Lấy dữ liệu cũ từ DB lên để đối chiếu
                    var existingNote = await _context.Notes.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
                    
                    if (existingNote == null || existingNote.UserId != userId)
                    {
                        return Forbid();
                    }

                    // Gán lại các giá trị quan trọng để không bị mất
                    note.UserId = userId; 
                    note.CreatedAt = existingNote.CreatedAt; 

                    _context.Update(note);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!_context.Notes.Any(e => e.Id == note.Id)) return NotFound();
                    else throw;
                }
                return RedirectToAction(nameof(Details), new { id = note.Id });
            }
            return View(note);
        }
    }
}