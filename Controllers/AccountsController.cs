using Microsoft.AspNetCore.Mvc;

namespace SecureNotesApp.Controllers
{
    public class AccountsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}