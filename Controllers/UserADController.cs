using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.Services.Admin;

using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Controllers
{
    public class UserADController : Controller
    {
        private readonly IUserADService _userService;

        public UserADController(IUserADService userService)
        {
            _userService = userService;
        }

        // GET: Hiển thị danh sách users
        public async Task<IActionResult> Index()
        {
            var users = await _userService.GetAllUsersAsync();

            var viewModel = new UserManagementViewModel
            {
                Users = users,
                TotalUsers = users.Count(),
                ActiveUsers = users.Count(u => u.IsActive),
                BlockedUsers = users.Count(u => !u.IsActive),
                AdminUsers = users.Count(u => u.Role == "Admin")
            };

            return View(viewModel);
        }

        // POST: Toggle user status (Block/Unblock)
        [HttpPost]
        public async Task<IActionResult> ToggleStatus(string id, [FromBody] ToggleStatusModel model)
        {
            var result = await _userService.ToggleUserStatusAsync(id, model.IsActive);

            if (!result)
                return Json(new { success = false, message = "User not found or update failed" });

            return Json(new { success = true });
        }

        // GET: View user details
        public async Task<IActionResult> Details(string id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();

            return View(user);
        }

        // GET: Edit user
        public async Task<IActionResult> Edit(string id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();

            return View(user);
        }

        // POST: Edit user
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(User user)
        {
            if (!ModelState.IsValid)
                return View(user);

            var result = await _userService.UpdateUserAsync(user);

            if (!result)
            {
                ModelState.AddModelError("", "Failed to update user");
                return View(user);
            }

            return RedirectToAction(nameof(Index));
        }

        // POST: Delete user
        [HttpPost]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _userService.DeleteUserAsync(id);

            if (!result)
                return Json(new { success = false, message = "User not found or delete failed" });

            return Json(new { success = true });
        }
    }

    // Model cho ToggleStatus
    public class ToggleStatusModel
    {
        public bool IsActive { get; set; }
    }
}