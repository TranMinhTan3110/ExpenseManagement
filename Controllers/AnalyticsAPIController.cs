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
        private readonly ILogger<AnalyticsAPIController> _logger;

        public AnalyticsAPIController(
            IAnalyticsService analyticsService,
            ILogger<AnalyticsAPIController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy analytics cho Expense
        /// GET: /api/analytics/expense?walletId=1002&month=2025-11
        /// </summary>
        [HttpGet("expense")]
        public async Task<IActionResult> GetExpenseAnalytics(
            [FromQuery] int? walletId,
            [FromQuery] string? month)
        {
            try
            {
                // Lấy userId từ claims
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("[API] UserId not found in claims");
                    return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
                }

                _logger.LogInformation($"[API] GetExpenseAnalytics - UserId: {userId}, WalletId: {walletId}, Month: {month}");

                // Gọi service
                var result = await _analyticsService.GetExpenseAnalyticsAsync(
                    userId,
                    walletId,
                    month
                );

                _logger.LogInformation($"[API] Success - {result.TransactionHistory.Count} transactions, {result.ExpenseBreakdown.Count} categories");

                // Trả về JSON với property names lowercase
                return Ok(new
                {
                    expenseBreakdown = result.ExpenseBreakdown,
                    transactionHistory = result.TransactionHistory,
                    totalExpense = result.TotalExpense,
                    selectedMonth = result.SelectedMonth
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error in GetExpenseAnalytics");
                
                // Trả về lỗi chi tiết (chỉ trong development)
                return StatusCode(500, new
                {
                    message = "Đã xảy ra lỗi khi xử lý yêu cầu",
                    error = ex.Message,
                    // Chỉ hiển thị trong development
                    #if DEBUG
                    stackTrace = ex.StackTrace,
                    innerException = ex.InnerException?.Message
                    #endif
                });
            }
        }
        [HttpGet("income")]
        public async Task<IActionResult> GetIncomeAnalytics(
    [FromQuery] int? walletId,
    [FromQuery] string? month)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });

                _logger.LogInformation($"[API] GetIncomeAnalytics - UserId: {userId}, WalletId: {walletId}, Month: {month}");

                var result = await _analyticsService.GetIncomeAnalyticsAsync(
                    userId,
                    walletId,
                    month
                );

                return Ok(new
                {
                    incomeBreakdown = result.IncomeBreakdown,
                    transactionHistory = result.TransactionHistory,
                    totalIncome = result.TotalIncome,
                    selectedMonth = result.SelectedMonth
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[API] Error in GetIncomeAnalytics");
                return StatusCode(500, new
                {
                    message = "Đã xảy ra lỗi khi xử lý yêu cầu",
                    error = ex.Message
                });
            }
        }

    }
}