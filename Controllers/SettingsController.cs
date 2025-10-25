using Microsoft.AspNetCore.Mvc;
using System.Runtime.CompilerServices;

namespace QuanLyChiTieu_WebApp.Controllers
{
    public class SettingsController : Controller
    {
        public IActionResult Profile()
        {
            return View();
        }

        public IActionResult Category()
        {
            return View();
        }
        public IActionResult Support()
        {
            return View();
        }
        public IActionResult CreateTicket()
        {
            return View();
        }
    }
}
