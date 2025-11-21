using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.ViewModels;
using System.Security.Claims;

namespace QuanLyChiTieu_WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/search")]
    public class SearchAPIController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SearchAPIController> _logger;

        public SearchAPIController(ApplicationDbContext context, ILogger<SearchAPIController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Tìm kiếm transactions với phân trang
        /// GET: /api/search/transactions?q=cafe&type=&categoryId=&walletId=&fromDate=&toDate=&page=1&pageSize=10
        /// </summary>
        [HttpGet("transactions")]
        public async Task<IActionResult> SearchTransactions(
            [FromQuery] string? q,
            [FromQuery] string? type,
            [FromQuery] int? categoryId,
            [FromQuery] int? walletId,
            [FromQuery] string? fromDate,
            [FromQuery] string? toDate,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
                }

                // Validate pagination
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;
                if (pageSize > 100) pageSize = 100; // Giới hạn tối đa 100 items/page

                _logger.LogInformation($"[SEARCH] UserId: {userId}, Query: {q}, Page: {page}, PageSize: {pageSize}");

                // Lấy danh sách WalletID của user
                var userWalletIds = await _context.Wallets
                    .Where(w => w.UserID == userId)
                    .Select(w => w.WalletID)
                    .ToListAsync();

                if (userWalletIds.Count == 0)
                {
                    return Ok(new
                    {
                        transactions = new List<TransactionDto>(),
                        totalCount = 0,
                        page = page,
                        pageSize = pageSize,
                        totalPages = 0,
                        message = "User không có ví nào"
                    });
                }

                // Build query
                var query = _context.Transactions
                    .AsNoTracking()
                    .Where(t => userWalletIds.Contains(t.WalletID));

                // Lọc theo từ khóa (tìm trong Description)
                if (!string.IsNullOrWhiteSpace(q))
                {
                    query = query.Where(t => t.Description.Contains(q));
                }

                // Lọc theo Type (Expense/Income)
                if (!string.IsNullOrWhiteSpace(type))
                {
                    query = query.Where(t => t.Type == type);
                }

                // Lọc theo Category
                if (categoryId.HasValue && categoryId.Value > 0)
                {
                    query = query.Where(t => t.CategoryID == categoryId.Value);
                }

                // Lọc theo Wallet
                if (walletId.HasValue && walletId.Value > 0)
                {
                    query = query.Where(t => t.WalletID == walletId.Value);
                }

                // Lọc theo khoảng thời gian
                if (!string.IsNullOrEmpty(fromDate) && DateTime.TryParse(fromDate, out DateTime from))
                {
                    query = query.Where(t => t.TransactionDate >= from);
                }

                if (!string.IsNullOrEmpty(toDate) && DateTime.TryParse(toDate, out DateTime to))
                {
                    query = query.Where(t => t.TransactionDate <= to.AddDays(1).AddSeconds(-1));
                }

                // Đếm tổng số kết quả
                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

                // Include navigation properties và áp dụng phân trang
                var transactions = await query
                    .Include(t => t.Category)
                        .ThenInclude(c => c.Icon)
                    .Include(t => t.Category)
                        .ThenInclude(c => c.Color)
                    .Include(t => t.Wallet)
                    .OrderByDescending(t => t.TransactionDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                _logger.LogInformation($"[SEARCH] Found {totalCount} total, showing page {page}/{totalPages}");

                // Convert sang DTO
                var transactionDtos = transactions.Select(t => new TransactionDto
                {
                    TransactionID = t.TransactionID,
                    Amount = t.Amount,
                    Type = t.Type,
                    TransactionDate = t.TransactionDate,
                    Description = t.Description ?? string.Empty,
                    Category = t.Category != null ? new CategoryDto
                    {
                        CategoryID = t.Category.CategoryID,
                        CategoryName = t.Category.CategoryName,
                        Icon = t.Category.Icon != null ? new IconDto
                        {
                            IconID = t.Category.Icon.IconID,
                            IconClass = t.Category.Icon.IconClass
                        } : new IconDto { IconID = 0, IconClass = "fi fi-rr-circle-question" },
                        Color = t.Category.Color != null ? new ColorDto
                        {
                            ColorID = t.Category.Color.ColorID,
                            HexCode = t.Category.Color.HexCode
                        } : new ColorDto { ColorID = 0, HexCode = "#808080" }
                    } : new CategoryDto
                    {
                        CategoryID = 0,
                        CategoryName = "Khác",
                        Icon = new IconDto { IconID = 0, IconClass = "fi fi-rr-circle-question" },
                        Color = new ColorDto { ColorID = 0, HexCode = "#808080" }
                    }
                }).ToList();

                return Ok(new
                {
                    transactions = transactionDtos,
                    totalCount = totalCount,
                    page = page,
                    pageSize = pageSize,
                    totalPages = totalPages,
                    hasNextPage = page < totalPages,
                    hasPreviousPage = page > 1
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SEARCH] Error occurred");

                return StatusCode(500, new
                {
                    message = "Đã xảy ra lỗi khi tìm kiếm",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy danh sách categories để filter
        /// GET: /api/search/categories
        /// </summary>
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                var categories = await _context.Categories
                    .AsNoTracking()
                    .Where(c => c.UserID == userId)
                    .Include(c => c.Icon)
                    .Include(c => c.Color)
                    .OrderBy(c => c.CategoryName)
                    .Select(c => new
                    {
                        categoryID = c.CategoryID,
                        categoryName = c.CategoryName,
                        type = c.Type,
                        iconClass = c.Icon.IconClass,
                        colorHex = c.Color.HexCode
                    })
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SEARCH] Error getting categories");
                return StatusCode(500, new { message = "Lỗi lấy danh sách categories" });
            }
        }
    }
}