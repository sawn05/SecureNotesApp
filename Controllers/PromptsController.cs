using Microsoft.AspNetCore.Mvc;

namespace SecureNotesApp.Controllers
{
    public class PromptsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}