using Microsoft.AspNetCore.Mvc;

namespace SecureNotesApp.Controllers
{
    public class TasksController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}