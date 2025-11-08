using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
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
        private readonly IWalletService _walletService;
        private readonly ApplicationDbContext _context; // 👈 THÊM DbContext

        public GoalsController(IGoalService goalService, ApplicationDbContext context, IWalletService walletService)
        {
            _goalService = goalService;
            _context = context;
            _walletService = walletService;
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

            // ✅ Lấy thông tin Goal TRƯỚC KHI nạp tiền
            var goal = await _context.Goals
                .FirstOrDefaultAsync(g => g.GoalID == model.GoalID && g.UserID == userId);

            if (goal == null)
            {
                return Json(new { success = false, message = "Không tìm thấy mục tiêu" });
            }

            // Gọi service để nạp tiền
            var result = await _goalService.DepositToGoalAsync(
                model.GoalID,
                model.WalletID,
                model.Amount,
                model.Note,
                userId
            );

            if (!result)
            {
                return Json(new { success = false, message = "Không thể nạp tiền. Vui lòng kiểm tra số dư ví!" });
            }

            // ✅ Lấy lại thông tin Goal SAU KHI nạp tiền
            await _context.Entry(goal).ReloadAsync();

            // ✅ Kiểm tra xem đã đạt mục tiêu chưa
            bool goalAchieved = goal.CurrentAmount >= goal.TargetAmount;

            // ✅ Tính phần trăm hoàn thành
            decimal progressPercent = goal.TargetAmount > 0
                ? Math.Round((goal.CurrentAmount / goal.TargetAmount) * 100, 2)
                : 0;

            return Json(new
            {
                success = true,
                message = goalAchieved
                    ? $"🎉 Nạp tiền thành công! Bạn đã hoàn thành mục tiêu '{goal.GoalName}'!"
                    : "Nạp tiền thành công!",
                goalAchieved = goalAchieved,
                data = new
                {
                    goalAchieved = goalAchieved,
                    currentAmount = goal.CurrentAmount,
                    targetAmount = goal.TargetAmount,
                    progressPercent = progressPercent,
                    goalName = goal.GoalName
                }
            });
        }

        // 🟥 4️⃣ Xóa mục tiêu (Đã sửa - xử lý lỗi tốt hơn)
        [HttpPost]
        [HttpPost]
        public async Task<IActionResult> Delete([FromBody] DeleteGoalRequest request)
        {
            Console.WriteLine($"========================================");
            Console.WriteLine($"🔍 DELETE REQUEST - GoalID: {request?.Id}");

            if (request == null || request.Id <= 0)
            {
                Console.WriteLine($"❌ Request không hợp lệ");
                return Json(new { success = false, message = "ID không hợp lệ" });
            }

            var userId = GetCurrentUserId();
            Console.WriteLine($"🔍 UserID: {userId}");

            if (string.IsNullOrEmpty(userId))
                return Json(new { success = false, message = "Phiên đăng nhập hết hạn" });

            try
            {
                var result = await _goalService.DeleteGoalAsync(request.Id, userId);

                if (result)
                {
                    Console.WriteLine($"✅✅✅ DELETE THÀNH CÔNG");
                    return Json(new
                    {
                        success = true,
                        message = "Xóa mục tiêu thành công! Tiền đã được hoàn về ví."
                    });
                }
                else
                {
                    Console.WriteLine($"❌ DELETE THẤT BẠI - Không tìm thấy Goal");
                    return Json(new
                    {
                        success = false,
                        message = "Không tìm thấy mục tiêu hoặc bạn không có quyền xóa."
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌❌❌ EXCEPTION: {ex.Message}");
                Console.WriteLine($"❌ InnerException: {ex.InnerException?.Message}");

                return Json(new
                {
                    success = false,
                    message = $"Có lỗi xảy ra: {ex.Message}"
                });
            }
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

        [HttpGet]
        public async Task<IActionResult> GetUserWallets()
        {
            try
            {
                var userId = GetCurrentUserId();

                if (string.IsNullOrEmpty(userId))
                {
                    return Json(new { success = false, message = "Phiên đăng nhập hết hạn" });
                }

                // ✅ Kiểm tra _walletService có null không
                if (_walletService == null)
                {
                    return Json(new { success = false, message = "Wallet service không khả dụng" });
                }

                var wallets = await _walletService.GetWalletsByUserIdAsync(userId);

                // ✅ Kiểm tra wallets có null không
                if (wallets == null || !wallets.Any())
                {
                    return Json(new
                    {
                        success = true,
                        data = new List<object>(),
                        message = "Bạn chưa có ví nào. Vui lòng tạo ví trước."
                    });
                }

                return Json(new
                {
                    success = true,
                    data = wallets.Select(w => new
                    {
                        walletID = w.WalletID,
                        walletName = w.WalletName,
                        balance = w.Balance.ToString("N0")
                    })
                });
            }
            catch (Exception ex)
            {
                // ✅ Log lỗi để debug
                Console.WriteLine($"❌ Lỗi GetUserWallets: {ex.Message}");
                return Json(new
                {
                    success = false,
                    message = $"Lỗi: {ex.Message}"
                });
            }
        }


    }
}