using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SecureNotesApp.Models;
using SecureNotesApp.Helpers; // Import Helper

namespace SecureNotesApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult TestSecurity()
        {
            try 
            {
                string banDau = "MyPassWord123";
                string maHoa = SecurityHelper.Encrypt(banDau);
                string giaiMa = SecurityHelper.Decrypt(maHoa);

                return Json(new { 
                    Original = banDau, 
                    Encrypted = maHoa, 
                    Decrypted = giaiMa 
                });
            }
            catch (Exception ex)
            {
                return Json(new { Status = "Error", Message = ex.Message });
            }
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}