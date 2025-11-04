using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Services;
using QuanLyChiTieu_WebApp.ViewModels;
using System.Security.Claims;

namespace QuanLyChiTieu_WebApp.Controllers
{
    [Authorize]
    public class GoalsController : Controller
    {
        private readonly IGoalService _goalService;
        private readonly ApplicationDbContext _context; // 👈 THÊM DbContext

        public GoalsController(IGoalService goalService, ApplicationDbContext context)
        {
            _goalService = goalService;
            _context = context; // 👈 INJECT
        }

        private string GetCurrentUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        // 🟢 1️⃣ Trang danh sách mục tiêu
        public async Task<IActionResult> Index()
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return RedirectToAction("Index", "Login");

            var viewModel = await _goalService.GetUserGoalsAsync(userId);

            // 👇 LẤY DANH SÁCH VÍ TRỰC TIẾP (KHÔNG CẦN SERVICE)
            var wallets = await _context.Wallets
                .Where(w => w.UserID == userId)
                .OrderBy(w => w.WalletName)
                .ToListAsync();

            ViewBag.Wallets = wallets;

            return View(viewModel);
        }

        // 🟢 2️⃣ Tạo mục tiêu mới
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateGoalViewModel model)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return Json(new { success = false, message = "Phiên đăng nhập hết hạn" });

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .FirstOrDefault();
                return Json(new { success = false, message = errors ?? "Dữ liệu không hợp lệ" });
            }

            var result = await _goalService.CreateGoalAsync(model, userId);
            return Json(result
                ? new { success = true, message = "Tạo mục tiêu thành công!" }
                : new { success = false, message = "Không thể tạo mục tiêu." });
        }

        // 🟢 3️⃣ Nạp tiền vào mục tiêu
        [HttpPost]
        public async Task<IActionResult> Deposit([FromBody] DepositGoalViewModel model)
        {
            var userId = GetCurrentUserId();

            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "Phiên đăng nhập hết hạn" });
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .FirstOrDefault();
                return Json(new { success = false, message = errors ?? "Dữ liệu không hợp lệ" });
            }

            var result = await _goalService.DepositToGoalAsync(
                model.GoalID,
                model.WalletID,
                model.Amount,
                model.Note,
                userId
            );

            if (result)
            {
                return Json(new { success = true, message = "Nạp tiền thành công!" });
            }

            return Json(new { success = false, message = "Không thể nạp tiền. Vui lòng kiểm tra số dư ví!" });
        }

        // 🟢 4️⃣ Xóa mục tiêu
        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return Json(new { success = false, message = "Phiên đăng nhập hết hạn" });

            var result = await _goalService.DeleteGoalAsync(id, userId);
            return Json(result
                ? new { success = true, message = "Xóa mục tiêu thành công!" }
                : new { success = false, message = "Không thể xóa mục tiêu." });
        }

        // 🟢 5️⃣ Xem chi tiết một mục tiêu cụ thể
        [HttpGet]
        public async Task<IActionResult> Details(int id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return RedirectToAction("Index", "Login");

            var goalDetail = await _goalService.GetGoalByIdAsync(id, userId);
            if (goalDetail == null)
                return NotFound();

            return View(goalDetail);
        }
    }
}