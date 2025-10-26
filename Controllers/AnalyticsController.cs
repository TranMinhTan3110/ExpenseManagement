using Microsoft.AspNetCore.Mvc;

namespace QuanLyChiTieu_WebApp.Controllers
{
    public class AnalyticsController : Controller
    {
        public IActionResult Income()
        {
            return View();
        }
        public IActionResult Expense()
        {
            return View();
        }
    }
}
