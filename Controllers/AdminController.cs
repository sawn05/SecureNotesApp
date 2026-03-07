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

            return View(model);
        }

        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Users()
        {
            // 1. Lấy danh sách tất cả người dùng
            var users = await _userManager.Users.ToListAsync();
            
            // 2. Tạo một danh sách ViewModel để chứa thông tin hiển thị (bao gồm cả Role)
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

            // Cập nhật thông tin cơ bản
            var updateResult = await _userManager.UpdateAsync(user);
            if (updateResult.Succeeded)
            {
                // Cập nhật Role: Xóa hết role cũ, thêm role mới được chọn
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
    }
}
