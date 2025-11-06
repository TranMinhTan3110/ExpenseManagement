using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AnalyticsService> _logger;

        public AnalyticsService(ApplicationDbContext context, ILogger<AnalyticsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ExpenseAnalyticsViewModel> GetExpenseAnalyticsAsync(
            string userId,
            int? walletId,
            string? month)
        {
            try
            {
                _logger.LogInformation($"[ANALYTICS] Start - UserId: {userId}, WalletId: {walletId}, Month: {month}");

                // Parse tháng (format: "2025-11")
                DateTime startDate, endDate;
                if (!string.IsNullOrEmpty(month))
                {
                    var parts = month.Split('-');
                    if (parts.Length == 2 &&
                        int.TryParse(parts[0], out int year) &&
                        int.TryParse(parts[1], out int monthNum) &&
                        year >= 2000 && year <= 2100 &&
                        monthNum >= 1 && monthNum <= 12)
                    {
                        startDate = new DateTime(year, monthNum, 1);
                        endDate = startDate.AddMonths(1);
                    }
                    else
                    {
                        _logger.LogWarning($"Invalid month format: {month}, using current month");
                        startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                        endDate = startDate.AddMonths(1);
                    }
                }
                else
                {
                    startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                    endDate = startDate.AddMonths(1);
                }

                _logger.LogInformation($"[ANALYTICS] Date range: {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}");

                // Lấy danh sách WalletID của user
                var userWalletIds = await _context.Wallets
                    .Where(w => w.UserID == userId)
                    .Select(w => w.WalletID)
                    .ToListAsync();

                _logger.LogInformation($"[ANALYTICS] User has {userWalletIds.Count} wallets");

                if (userWalletIds.Count == 0)
                {
                    _logger.LogWarning("[ANALYTICS] User has no wallets");
                    return new ExpenseAnalyticsViewModel
                    {
                        ExpenseBreakdown = new List<ExpenseBreakdownItem>(),
                        TransactionHistory = new List<TransactionDto>(),
                        TotalExpense = 0,
                        SelectedMonth = startDate.ToString("yyyy-MM")
                    };
                }

                // Build query
                var query = _context.Transactions
                    .AsNoTracking()
                    .Where(t => t.Type == "Expense" &&
                                t.TransactionDate >= startDate &&
                                t.TransactionDate < endDate &&
                                userWalletIds.Contains(t.WalletID));

                // Lọc theo ví cụ thể (nếu có)
                if (walletId.HasValue && walletId.Value > 0)
                {
                    query = query.Where(t => t.WalletID == walletId.Value);
                    _logger.LogInformation($"[ANALYTICS] Filtering by WalletId: {walletId.Value}");
                }

                // ✅ QUAN TRỌNG: Include navigation properties
                var transactions = await query
                    .Include(t => t.Category)
                        .ThenInclude(c => c.Icon)
                    .Include(t => t.Category)
                        .ThenInclude(c => c.Color)
                    .OrderByDescending(t => t.TransactionDate)
                    .ToListAsync();

                _logger.LogInformation($"[ANALYTICS] Found {transactions.Count} transactions");

                // Tính Expense Breakdown cho Pie Chart
                var breakdown = transactions
                    .GroupBy(t => new
                    {
                        CategoryId = t.CategoryID,
                        CategoryName = t.Category?.CategoryName ?? "Khác",
                        ColorHex = t.Category?.Color?.HexCode ?? "#808080"
                    })
                    .Select(g => new ExpenseBreakdownItem
                    {
                        CategoryName = g.Key.CategoryName,
                        Amount = g.Sum(t => t.Amount),
                        Percentage = 0, // Sẽ tính sau
                        ColorHex = g.Key.ColorHex
                    })
                    .OrderByDescending(x => x.Amount)
                    .ToList();

                // Tính % cho mỗi category
                var totalExpense = breakdown.Sum(x => x.Amount);
                if (totalExpense > 0)
                {
                    foreach (var item in breakdown)
                    {
                        item.Percentage = Math.Round((double)(item.Amount / totalExpense * 100), 1);
                    }
                }

                _logger.LogInformation($"[ANALYTICS] Breakdown: {breakdown.Count} categories, Total: {totalExpense}");

                // ✅ Chuyển sang DTO để tránh circular reference
                var transactionDtos = transactions.Take(50).Select(t => new TransactionDto
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

                _logger.LogInformation("[ANALYTICS] Successfully created DTOs");

                return new ExpenseAnalyticsViewModel
                {
                    ExpenseBreakdown = breakdown,
                    TransactionHistory = transactionDtos,
                    TotalExpense = totalExpense,
                    SelectedMonth = startDate.ToString("yyyy-MM")
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ANALYTICS] Error occurred");
                _logger.LogError($"Message: {ex.Message}");
                _logger.LogError($"StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    _logger.LogError($"InnerException: {ex.InnerException.Message}");
                }
                throw;
            }
        }
        public async Task<IncomeAnalyticsViewModel> GetIncomeAnalyticsAsync(
    string userId,
    int? walletId,
    string? month)
        {
            try
            {
                _logger.LogInformation($"[INCOME] Start - UserId: {userId}, WalletId: {walletId}, Month: {month}");

                // --- Parse tháng yyyy-MM ---
                DateTime startDate, endDate;
                if (!string.IsNullOrEmpty(month))
                {
                    var parts = month.Split('-');
                    int year = int.Parse(parts[0]);
                    int monthNum = int.Parse(parts[1]);

                    startDate = new DateTime(year, monthNum, 1);
                    endDate = startDate.AddMonths(1);
                }
                else
                {
                    startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                    endDate = startDate.AddMonths(1);
                }

                // --- Lấy danh sách ví của user ---
                var userWalletIds = await _context.Wallets
                    .Where(w => w.UserID == userId)
                    .Select(w => w.WalletID)
                    .ToListAsync();

                if (userWalletIds.Count == 0)
                {
                    return new IncomeAnalyticsViewModel
                    {
                        IncomeBreakdown = new(),
                        TransactionHistory = new(),
                        TotalIncome = 0,
                        SelectedMonth = startDate.ToString("yyyy-MM")
                    };
                }

                // --- Build query INCOME ---
                var query = _context.Transactions
                    .AsNoTracking()
                    .Where(t => t.Type == "Income" &&
                                t.TransactionDate >= startDate &&
                                t.TransactionDate < endDate &&
                                userWalletIds.Contains(t.WalletID));

                if (walletId.HasValue && walletId.Value > 0)
                {
                    query = query.Where(t => t.WalletID == walletId.Value);
                }

                // Include navigation
                var transactions = await query
                    .Include(t => t.Category)
                        .ThenInclude(c => c.Icon)
                    .Include(t => t.Category)
                        .ThenInclude(c => c.Color)
                    .OrderByDescending(t => t.TransactionDate)
                    .ToListAsync();

                // --- BREAKDOWN ---
                var breakdown = transactions
                    .GroupBy(t => new
                    {
                        CategoryId = t.CategoryID,
                        CategoryName = t.Category?.CategoryName ?? "Khác",
                        ColorHex = t.Category?.Color?.HexCode ?? "#4caf50"
                    })
                    .Select(g => new IncomeBreakdownItem
                    {
                        CategoryName = g.Key.CategoryName,
                        Amount = g.Sum(t => t.Amount),
                        Percentage = 0,
                        ColorHex = g.Key.ColorHex
                    })
                    .OrderByDescending(x => x.Amount)
                    .ToList();

                decimal totalIncome = breakdown.Sum(x => x.Amount);

                if (totalIncome > 0)
                {
                    foreach (var item in breakdown)
                    {
                        item.Percentage = Math.Round((double)(item.Amount / totalIncome * 100), 1);
                    }
                }

                // --- CONVERT TRANSACTION TO DTO ---
                var transactionDtos = transactions.Select(t => new IncomeTransactionDto
                {
                    TransactionID = t.TransactionID,
                    Amount = t.Amount,
                    TransactionDate = t.TransactionDate,
                    Description = t.Description ?? "",
                    Category = t.Category != null ? new CategoryDto
                    {
                        CategoryID = t.Category.CategoryID,
                        CategoryName = t.Category.CategoryName,
                        Icon = t.Category.Icon != null ? new IconDto
                        {
                            IconID = t.Category.Icon.IconID,
                            IconClass = t.Category.Icon.IconClass
                        } : new IconDto { IconID = 0, IconClass = "fi fi-rr-circle" },
                        Color = t.Category.Color != null ? new ColorDto
                        {
                            ColorID = t.Category.Color.ColorID,
                            HexCode = t.Category.Color.HexCode
                        } : new ColorDto { ColorID = 0, HexCode = "#4caf50" }
                    } : null
                }).ToList();

                return new IncomeAnalyticsViewModel
                {
                    IncomeBreakdown = breakdown,
                    TransactionHistory = transactionDtos,
                    TotalIncome = totalIncome,
                    SelectedMonth = startDate.ToString("yyyy-MM")
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[INCOME] Error");
                throw;
            }
        }
    }
}