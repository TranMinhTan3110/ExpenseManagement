using Microsoft.AspNetCore.Mvc;

namespace QuanLyChiTieu_WebApp.Controllers
{
    public class GoalsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
