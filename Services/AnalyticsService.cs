using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ExpenseAnalyticsViewModel> GetExpenseAnalyticsAsync(
            string userId,
            int? walletId,
            string? month)
        {
            try
            {
                // Parse tháng (VD: "2025-11")
                DateTime startDate, endDate;
                if (!string.IsNullOrEmpty(month))
                {
                    var parts = month.Split('-');

                    if (parts.Length != 2 ||
                        !int.TryParse(parts[0], out int year) ||
                        !int.TryParse(parts[1], out int monthNum))
                    {
                        throw new ArgumentException("Invalid month format. Expected yyyy-MM.", nameof(month));
                    }

                    startDate = new DateTime(year, monthNum, 1);
                    endDate = startDate.AddMonths(1);
                }
                else
                {
                    // Mặc định: tháng hiện tại
                    startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                    endDate = startDate.AddMonths(1);
                }

                // Query base
                var query = _context.Transactions
                    .AsNoTracking()
                    .Where(t => t.Type == "Expense" &&
                                t.TransactionDate >= startDate &&
                                t.TransactionDate < endDate);

                // Lọc theo ví (nếu có)
                if (walletId.HasValue)
                {
                    query = query.Where(t => t.WalletID == walletId.Value);
                }
                else
                {
                    // Nếu không chọn ví → Lấy tất cả ví của user
                    var userWalletIds = await _context.Wallets
                        .Where(w => w.UserID == userId)
                        .Select(w => w.WalletID)
                        .ToListAsync();

                    query = query.Where(t => userWalletIds.Contains(t.WalletID));
                }

                // ✅ FIX QUAN TRỌNG: Include đúng cách!
                var transactions = await query
                    .Include(t => t.Category)
                        .ThenInclude(c => c.Icon)      // Include Icon của Category
                    .Include(t => t.Category)
                        .ThenInclude(c => c.Color)     // Include Color của Category
                    .OrderByDescending(t => t.TransactionDate)
                    .ToListAsync();

                // Tính Expense Breakdown (Pie Chart)
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
                        Percentage = 0, // Tính sau
                        ColorHex = g.Key.ColorHex
                    })
                    .OrderByDescending(x => x.Amount)
                    .ToList();

                // Tính % cho từng category
                var totalExpense = breakdown.Sum(x => x.Amount);
                if (totalExpense > 0)
                {
                    foreach (var item in breakdown)
                    {
                        item.Percentage = (double)Math.Round((item.Amount / totalExpense) * 100, 1);
                    }
                }

                Console.WriteLine($"[SERVICE] Tìm thấy {transactions.Count} giao dịch");
                Console.WriteLine($"[SERVICE] Breakdown có {breakdown.Count} categories");

                return new ExpenseAnalyticsViewModel
                {
                    ExpenseBreakdown = breakdown,
                    TransactionHistory = transactions.Take(50).ToList(),
                    TotalExpense = totalExpense,
                    SelectedMonth = startDate.ToString("yyyy-MM")
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LỖI ANALYTICS SERVICE]: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                throw;
            }
        }
    }
}