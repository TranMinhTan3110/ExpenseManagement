using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu_WebApp.Services;
using System.Security.Claims;

namespace QuanLyChiTieu_WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/analytics")]
    public class AnalyticsAPIController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsAPIController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        // GET: /api/analytics/expense?walletId=2002&month=2025-11
        [HttpGet("expense")]
        public async Task<IActionResult> GetExpenseAnalytics(
            [FromQuery] int? walletId,
            [FromQuery] string? month)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Không tìm thấy userId" });
                }

                // ✅ Log để debug
                Console.WriteLine($"[API] GetExpenseAnalytics called:");
                Console.WriteLine($"  - userId: {userId}");
                Console.WriteLine($"  - walletId: {walletId}");
                Console.WriteLine($"  - month: {month}");

                var analytics = await _analyticsService.GetExpenseAnalyticsAsync(
                    userId,
                    walletId,
                    month
                );

                Console.WriteLine($"[API] Trả về: {analytics.TransactionHistory.Count} giao dịch");

                return Ok(analytics);
            }
            catch (Exception ex)
            {
                // ✅ Log lỗi chi tiết
                Console.WriteLine($"[API ERROR] {ex.Message}");
                Console.WriteLine($"[API ERROR] Stack Trace: {ex.StackTrace}");

                // Trả về thông tin lỗi chi tiết (chỉ dùng trong development)
                return StatusCode(500, new
                {
                    message = "Lỗi server khi xử lý analytics",
                    error = ex.Message,
                    stackTrace = ex.StackTrace // ⚠️ Xóa dòng này khi deploy production
                });
            }
        }
    }
}