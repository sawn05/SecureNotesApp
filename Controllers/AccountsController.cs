using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureNotesApp.Data;
using SecureNotesApp.Models;
using Microsoft.AspNetCore.Authorization;

namespace SecureNotesApp.Controllers
{
    [Authorize]
    public class AccountsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AccountsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize]
        public async Task<IActionResult> Index()
        {
            var currentUser = User.Identity?.Name;
            
            var myAccounts = await _context.SavedAccounts
                .Where(a => a.OwnerID == currentUser)
                .ToListAsync();

            return View(myAccounts);
        }

        // Create account
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(SavedAccount account)
        {
            if (ModelState.IsValid)
            {
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