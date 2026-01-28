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

        public async Task<IActionResult> Index()
        {
            var userId = _userManager.GetUserId(User);

            var notes = await _context.Notes
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return View(notes);
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
            note.UserId = userId ?? "UserTam"; // Tránh lỗi null tạm thời
            note.CreatedAt = DateTime.Now;

            if (!string.IsNullOrEmpty(note.PlainContent))
            {
                note.EncryptedContent = SecurityHelper.Encrypt(note.PlainContent);
            }

            // Xóa các lỗi validation đã biết
            ModelState.Remove("UserId");
            ModelState.Remove("User");
            ModelState.Remove("EncryptedContent");

            // --- BẮT ĐẦU ĐOẠN MÃ THÁM TỬ (DEBUG) ---
            // Đoạn này sẽ in lỗi ra Terminal cho bạn xem
            if (!ModelState.IsValid)
            {
                Console.WriteLine("----------- ĐANG CÓ LỖI VALIDATION -----------");
                foreach (var modelStateKey in ModelState.Keys)
                {
                    var modelStateVal = ModelState[modelStateKey];
                    foreach (var error in modelStateVal.Errors)
                    {
                        // In tên trường bị lỗi và nguyên nhân
                        Console.WriteLine($"❌ Trường: {modelStateKey} - Lỗi: {error.ErrorMessage}");
                    }
                }
                Console.WriteLine("----------------------------------------------");
            }
            // --- KẾT THÚC ĐOẠN MÃ THÁM TỬ ---

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




        // --- 1. MỞ FORM SỬA (GET) ---
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();

            var note = await _context.Notes.FindAsync(id);
            if (note == null) return NotFound();

            // BẢO MẬT: Kiểm tra xem người đang sửa có phải chủ nhân không
            var userId = _userManager.GetUserId(User);
            if (note.UserId != userId)
            {
                return Forbid(); // Chặn ngay nếu định sửa trộm của người khác
            }

            // GIẢI MÃ: Để hiển thị nội dung cũ lên form
            note.PlainContent = SecurityHelper.Decrypt(note.EncryptedContent);

            return View(note);
        }

        // --- 2. LƯU THAY ĐỔI (POST) ---
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Note note)
        {
            if (id != note.Id) return NotFound();

            // Lấy ID User hiện tại để đảm bảo không bị hack đổi chủ sở hữu
            var userId = _userManager.GetUserId(User);

            // MÃ HÓA: Nội dung mới người dùng vừa sửa
            if (!string.IsNullOrEmpty(note.PlainContent))
            {
                note.EncryptedContent = SecurityHelper.Encrypt(note.PlainContent);
            }

            // BỎ QUA LỖI VALIDATION (Giống hệt bên Create)
            ModelState.Remove("UserId");
            ModelState.Remove("User");
            ModelState.Remove("EncryptedContent");

            if (ModelState.IsValid)
            {
                try
                {
                    // KỸ THUẬT AN TOÀN: 
                    // Thay vì update thẳng, ta lấy dữ liệu cũ từ DB lên để đối chiếu
                    var existingNote = await _context.Notes.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
                    
                    // Check quyền lần cuối
                    if (existingNote == null || existingNote.UserId != userId)
                    {
                        return Forbid();
                    }

                    // Gán lại các giá trị quan trọng để không bị mất
                    note.UserId = userId; // Giữ nguyên chủ sở hữu
                    note.CreatedAt = existingNote.CreatedAt; // Giữ nguyên ngày tạo ban đầu

                    _context.Update(note);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!_context.Notes.Any(e => e.Id == note.Id)) return NotFound();
                    else throw;
                }
                // Sửa xong thì quay về trang chi tiết để xem kết quả
                return RedirectToAction(nameof(Details), new { id = note.Id });
            }
            return View(note);
        }
    }
}