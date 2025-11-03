using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu_WebApp.Services; 
using QuanLyChiTieu_WebApp.ViewModels;
using System.Threading.Tasks; 

namespace QuanLyChiTieu_WebApp.Controllers
{
    [Authorize]
    public class SettingsController : Controller
    {
        private readonly ISettingsService _settingsService;

        public SettingsController(ISettingsService settingsService)
        {
            _settingsService = settingsService;
        }
        [HttpGet]
        public async Task<IActionResult> Profile()
        {
            // Gửi ViewModel "cha" ra View
            var viewModel = await _settingsService.GetSettingsAsync(User);
            if (viewModel == null) return NotFound();
            return View(viewModel);
        }

        // [POST] CHO FORM 1
        [HttpPost]
        public async Task<IActionResult> UpdateAvatar(SettingsViewModel model)
        {
            var result = await _settingsService.UpdateAvatarAsync(User, model.AvatarForm);
            if (!result.Success)
            {
                ViewBag.AvatarErrorMessage = result.ErrorMessage;
            }
            else
            {
                ViewBag.AvatarSuccessMessage = "Cập nhật thành công!";
            }

            // Lấy lại toàn bộ dữ liệu (đã cập nhật) và trả về
            var fullModel = await _settingsService.GetSettingsAsync(User);
            return View("Profile", fullModel);
        }

        // [POST] CHO FORM 2 (AJAX)
        [HttpPost]
        public async Task<IActionResult> UpdateSecurity(SettingsViewModel model)
        {
            var result = await _settingsService.UpdateSecurityAsync(User, model.SecurityForm);
            if (!result.Success)
            {
                return Json(new { success = false, message = result.ErrorMessage });
            }
            return Json(new { success = true, message = "Cập nhật bảo mật thành công!" });
        }

        // [POST] CHO FORM 3
        [HttpPost]
        public async Task<IActionResult> UpdatePersonalInfo(SettingsViewModel model)
        {
            var result = await _settingsService.UpdatePersonalInfoAsync(User, model.PersonalInfoForm);
            if (!result.Success)
            {
                ViewBag.PersonalInfoErrorMessage = result.ErrorMessage;
            }
            else
            {
                ViewBag.PersonalInfoSuccessMessage = "Cập nhật thông tin cá nhân thành công!";
            }

            // Lấy lại toàn bộ dữ liệu (đã cập nhật) và trả về
            var fullModel = await _settingsService.GetSettingsAsync(User);
            return View("Profile", fullModel);
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