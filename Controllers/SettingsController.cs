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
    }
}
