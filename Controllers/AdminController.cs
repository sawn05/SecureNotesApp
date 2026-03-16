using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureNotesApp.Data;
using SecureNotesApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;

namespace SecureNotesApp.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AdminController(ApplicationDbContext context, UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<IActionResult> Index()
        {
            var model = new AdminDashboardViewModel
            {
                TotalUsers = await _userManager.Users.CountAsync(),
                TotalNotes = await _context.Notes.CountAsync(),
                TotalAccounts = await _context.SavedAccounts.CountAsync(),
                TotalTasks = await _context.TodoTasks.CountAsync(),
                RecentUsers = await _userManager.Users.OrderByDescending(u => u.Id).Take(5).ToListAsync()
            };


            var last7Days = Enumerable.Range(0, 7)
                .Select(i => DateTime.Today.AddDays(-i))
                .Reverse()
                .ToList();

            foreach (var date in last7Days)
            {
                model.ChartLabels.Add(date.ToString("dd/MM"));
                
                var count = await _context.Notes
                    .CountAsync(n => n.CreatedAt.Date == date.Date);
                model.ChartData.Add(count);
            }

            return View(model);
        }

        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Users()
        {
            var users = await _userManager.Users.ToListAsync();
            
            var userList = new List<UserManagementViewModel>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new UserManagementViewModel
                {
                    Id = user.Id,
                    Email = user.Email,
                    UserName = user.UserName,
                    Roles = roles.ToList(),
                    IsLocked = await _userManager.IsLockedOutAsync(user)
                });
            }

            return View(userList);
        }



        [HttpPost]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            if (user.Email == User.Identity.Name)
            {
                TempData["Error"] = "Không thể xóa chính mình.";
                return RedirectToAction(nameof(Users));
            }

            var result = await _userManager.DeleteAsync(user);
            if (result.Succeeded) TempData["Message"] = "Đã xóa người dùng thành công!";
            
            return RedirectToAction(nameof(Users));
        }



        // GET: Admin/EditUser/id
        public async Task<IActionResult> EditUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            var model = new UserEditViewModel {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                CurrentRoles = await _userManager.GetRolesAsync(user),
                AllRoles = await _roleManager.Roles.Select(r => r.Name).ToListAsync()
            };
            return View(model);
        }

        // POST: Admin/EditUser
        [HttpPost]
        public async Task<IActionResult> EditUser(UserEditViewModel model)
        {
            var user = await _userManager.FindByIdAsync(model.Id);
            if (user == null) return NotFound();

            user.Email = model.Email;
            user.UserName = model.UserName;

            var updateResult = await _userManager.UpdateAsync(user);
            if (updateResult.Succeeded)
            {
                var roles = await _userManager.GetRolesAsync(user);
                await _userManager.RemoveFromRolesAsync(user, roles);
                if (!string.IsNullOrEmpty(model.SelectedRole))
                {
                    await _userManager.AddToRoleAsync(user, model.SelectedRole);
                }
                TempData["Message"] = "Cập nhật người dùng thành công!";
                return RedirectToAction(nameof(Users));
            }
            return View(model);
        }



        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Accounts()
        {
            var allAccounts = await _context.SavedAccounts.ToListAsync();
            
            var sortedAccounts = allAccounts.OrderBy(a => a.OwnerID).ToList();

            return View(sortedAccounts);
        }

        [HttpPost]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            var account = await _context.SavedAccounts.FindAsync(id);
            if (account == null) return NotFound();

            _context.SavedAccounts.Remove(account);
            await _context.SaveChangesAsync();
            
            TempData["Message"] = "Đã xóa tài khoản khỏi hệ thống thành công!";
            return RedirectToAction(nameof(Accounts));
        }


        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Notes()
        {
            var allNotes = await _context.Notes
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return View(allNotes);
        }

        [HttpPost]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null) return NotFound();

            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();
            
            TempData["Message"] = "Đã xóa ghi chú thành công!";
            return RedirectToAction(nameof(Notes));
        }


        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Tasks()
        {
            var allTasks = await _context.TodoTasks
                .OrderByDescending(t => t.Id) 
                .ToListAsync();

            return View(allTasks);
        }

        // Delete Task
        [HttpPost]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.TodoTasks.FindAsync(id);
            if (task == null) return NotFound();

            _context.TodoTasks.Remove(task);
            await _context.SaveChangesAsync();
            
            TempData["Message"] = "Đã dọn dẹp Task thành công!";
            return RedirectToAction(nameof(Tasks));
        }



        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Prompts()
        {
            var prompts = await _context.Prompts
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return View(prompts);
        }

        [HttpPost]
        public async Task<IActionResult> DeletePrompt(int id)
        {
            var prompt = await _context.Prompts.FindAsync(id);
            if (prompt == null) return NotFound();

            _context.Prompts.Remove(prompt);
            await _context.SaveChangesAsync();
            
            TempData["Message"] = "Đã xóa Prompt thành công!";
            return RedirectToAction(nameof(Prompts));
        }


        // 1. Giao diện sửa
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EditPrompt(int id)
        {
            var prompt = await _context.Prompts.FindAsync(id);
            if (prompt == null) return NotFound();
            return View(prompt);
        }

        // 2. Xử lý lưu dữ liệu
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> EditPrompt(int id, Prompt promptFromForm)
        {
            if (id != promptFromForm.Id) return NotFound();

            var existingPrompt = await _context.Prompts.FindAsync(id);
            
            if (existingPrompt == null) return NotFound();

            existingPrompt.Title = promptFromForm.Title;
            existingPrompt.Description = promptFromForm.Description;
            existingPrompt.Content = promptFromForm.Content;
            existingPrompt.CategoryName = promptFromForm.CategoryName;
            existingPrompt.CategoryIcon = promptFromForm.CategoryIcon;
            existingPrompt.CategoryClass = promptFromForm.CategoryClass;
            existingPrompt.IsFavorite = promptFromForm.IsFavorite;
            existingPrompt.IsPublic = promptFromForm.IsPublic;

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(existingPrompt);
                    await _context.SaveChangesAsync();
                    TempData["Message"] = "Đã cập nhật đúng những gì bạn sửa!";
                    return RedirectToAction(nameof(Prompts));
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", "Lỗi khi lưu: " + ex.Message);
                }
            }
            return View(promptFromForm);
        }
    }
}
