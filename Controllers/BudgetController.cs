using Microsoft.AspNetCore.Mvc;

namespace QuanLyChiTieu_WebApp.Controllers
{
    public class BudgetController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
