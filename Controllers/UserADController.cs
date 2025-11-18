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

        // GET: Hiển thị danh sách users với phân trang
        public async Task<IActionResult> Index(
            int pageIndex = 1,
            string searchTerm = null,
            string roleFilter = null,
            string statusFilter = null)
        {
            const int pageSize = 10; // Số user trên mỗi trang

            var paginatedUsers = await _userService.GetUsersAsync(
                pageIndex,
                pageSize,
                searchTerm,
                roleFilter,
                statusFilter
            );

            var viewModel = new UserManagementViewModel
            {
                Users = paginatedUsers,
                TotalUsers = await _userService.GetTotalUsersCountAsync(),
                ActiveUsers = await _userService.GetActiveUsersCountAsync(),
                BlockedUsers = await _userService.GetBlockedUsersCountAsync(),
                AdminUsers = await _userService.GetAdminUsersCountAsync(),
                SearchTerm = searchTerm,
                RoleFilter = roleFilter,
                StatusFilter = statusFilter
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