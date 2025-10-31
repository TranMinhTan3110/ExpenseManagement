using Microsoft.AspNetCore.Mvc;

namespace QuanLyChiTieu_WebApp.Controllers
{
    public class DashBoardController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
