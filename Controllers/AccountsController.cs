using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureNotesApp.Data;
using SecureNotesApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;

namespace SecureNotesApp.Controllers
{
    [Authorize]
    public class AccountsController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IDataProtector _protector;

        // Check pass login user
        private readonly UserManager<IdentityUser> _userManager;

        // "Mượn" IDataProtectionProvider từ hệ thống
        public AccountsController(ApplicationDbContext context, IDataProtectionProvider provider, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _protector = provider.CreateProtector("SecureNotesApp.Accounts.v1");
            _userManager = userManager;
        }


        [HttpPost]
        public async Task<IActionResult> VerifyAndViewPassword(int id, string loginPassword)
        {
            var user = await _userManager.GetUserAsync(User);
            var isPasswordValid = await _userManager.CheckPasswordAsync(user, loginPassword);
            
            if (!isPasswordValid) return BadRequest("Mật khẩu xác nhận không chính xác!");

            var account = await _context.SavedAccounts.FindAsync(id);
            if (account == null || account.OwnerID != user.UserName) return NotFound();

            var decryptedPassword = _protector.Unprotect(account.Password);
            return Json(new { password = decryptedPassword });
        }


        [Authorize]
        public async Task<IActionResult> Index()
        {
            var currentUser = User.Identity?.Name;
            var accounts = await _context.SavedAccounts
                .Where(a => a.OwnerID == currentUser)
                .ToListAsync();

            foreach (var account in accounts)
            {
                try {
                    account.Password = _protector.Unprotect(account.Password);
                } catch {
                    account.Password = "Lỗi mã hóa!"; 
                }
            }
            return View(accounts);
        }

        // Create account
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(SavedAccount account)
        {
            if (ModelState.IsValid)
            {   
                account.Password = _protector.Protect(account.Password);

                account.CreatedAt = DateTime.Now;
                account.OwnerID = User.Identity?.Name;

                _context.SavedAccounts.Add(account);

                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }

            return View(account);
        }

        // Update account
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, SavedAccount account)
        {
            if (id != account.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    // Tìm tài khoản cũ trong CSDL
                    var existingAccount = await _context.SavedAccounts.FindAsync(id);
                    if (existingAccount == null)
                    {
                        return NotFound();
                    }

                    existingAccount.PlatformGroup = account.PlatformGroup;
                    existingAccount.Username = account.Username;
                    existingAccount.Password = account.Password;
                    existingAccount.FullName = account.FullName;
                    existingAccount.PhoneNumber = account.PhoneNumber;
                    existingAccount.Email = account.Email;

                    _context.Update(existingAccount);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                }
                return RedirectToAction(nameof(Index));
            }
            return RedirectToAction(nameof(Index));
        }


        // Delete account
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var accountToDelete = await _context.SavedAccounts.FindAsync(id);
            if (accountToDelete != null)
            {
                _context.SavedAccounts.Remove(accountToDelete);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
}