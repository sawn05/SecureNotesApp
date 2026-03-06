using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace SecureNotesApp.Controllers
{
    public class AuthController : Controller
    {
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;

        public AuthController(SignInManager<IdentityUser> signInManager, UserManager<IdentityUser> userManager)
        {
            _signInManager = signInManager;
            _userManager = userManager;
        }

        [HttpGet]
        public IActionResult Login() => View();

        [HttpPost]
        public async Task<IActionResult> Login(string Username, string Password, bool RememberMe)
        {
            var result = await _signInManager.PasswordSignInAsync(Username, Password, RememberMe, false);

            if (result.Succeeded)
            {
                return RedirectToAction("Index", "Tasks");
            }

            ModelState.AddModelError("", "Tài khoản hoặc mật khẩu không chính xác.");
            return View();
        }

        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return RedirectToAction("Login");
        }



        [HttpGet]
        public IActionResult Register() => View();

        [HttpPost]
        public async Task<IActionResult> Register(string Username, string Email, string Password, string ConfirmPassword)
        {
            if (Password != ConfirmPassword)
            {
                ModelState.AddModelError("", "Mật khẩu xác nhận không khớp.");
                return View();
            }

            var user = new IdentityUser { UserName = Username, Email = Email };
            var result = await _userManager.CreateAsync(user, Password);

            if (result.Succeeded)
            {
                // Đăng ký xong tự động cho đăng nhập luôn
                await _signInManager.SignInAsync(user, isPersistent: false);
                return RedirectToAction("Index", "Tasks");
            }

            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error.Description);
            }
            return View();
        }


        
    }
}