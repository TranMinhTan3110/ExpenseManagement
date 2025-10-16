using Microsoft.AspNetCore.Mvc;

namespace QuanLyChiTieu_WebApp.Controllers
{
    public class LoginController : Controller
    {
        public IActionResult SignIn()
        {
            return View();
        }

        public IActionResult SignUp()
        {
            return View();
        }

        public IActionResult Reset()
        {
            return View();
        }
    }
}
