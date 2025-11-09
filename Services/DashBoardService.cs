using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Services
{
    public class DashBoardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashBoardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardViewModel> GetDashboardDataAsync(string userId, int days = 7)
        {
            var userWallets = await _context.Wallets
                .AsNoTracking()
                .Where(w => w.UserID == userId)
                .ToListAsync();

            var walletIds = userWallets.Select(w => w.WalletID).ToList();
            var now = DateTime.Now;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1);
            var startOfLastMonth = startOfMonth.AddMonths(-1);
            var endOfLastMonth = startOfMonth;

            // --- 1. TỔNG SỐ DƯ ---
            var totalBalance = userWallets.Sum(w => w.Balance);

            // --- 2. THU NHẬP THÁNG NÀY ---
            var monthlyIncome = await _context.Transactions
                .AsNoTracking()
                .Where(t => walletIds.Contains(t.WalletID) &&
                            t.Type == "Income" &&
                            t.TransactionDate >= startOfMonth &&
                            t.TransactionDate < endOfMonth)
                .SumAsync(t => (decimal?)t.Amount) ?? 0;

            // --- 3. CHI TIÊU THÁNG NÀY ---
            var monthlyExpenses = await _context.Transactions
                .AsNoTracking()
                .Where(t => walletIds.Contains(t.WalletID) &&
                            t.Type == "Expense" &&
                            t.TransactionDate >= startOfMonth &&
                            t.TransactionDate < endOfMonth)
                .SumAsync(t => (decimal?)t.Amount) ?? 0;

            // --- 4. THÁNG TRƯỚC ---
            var lastMonthIncome = await _context.Transactions
                .AsNoTracking()
                .Where(t => walletIds.Contains(t.WalletID) &&
                            t.Type == "Income" &&
                            t.TransactionDate >= startOfLastMonth &&
                            t.TransactionDate < endOfLastMonth)
                .SumAsync(t => (decimal?)t.Amount) ?? 0;

            var lastMonthExpenses = await _context.Transactions
                .AsNoTracking()
                .Where(t => walletIds.Contains(t.WalletID) &&
                            t.Type == "Expense" &&
                            t.TransactionDate >= startOfLastMonth &&
                            t.TransactionDate < endOfLastMonth)
                .SumAsync(t => (decimal?)t.Amount) ?? 0;

            var lastMonthBalance = totalBalance - monthlyIncome + monthlyExpenses + lastMonthIncome - lastMonthExpenses;
            var hasLastMonthData = await _context.Transactions
                .AsNoTracking()
                .AnyAsync(t => walletIds.Contains(t.WalletID) &&
                               t.TransactionDate >= startOfLastMonth &&
                               t.TransactionDate < endOfLastMonth);

            var isNewUser = !hasLastMonthData;

            // --- 5. EXPENSE BREAKDOWN ---
            var expenseBreakdown = await _context.Transactions
                .AsNoTracking()
                .Where(t => walletIds.Contains(t.WalletID) &&
                            t.Type == "Expense" &&
                            t.TransactionDate >= startOfMonth &&
                            t.TransactionDate < endOfMonth)
                .Include(t => t.Category)
                    .ThenInclude(c => c.Color)
                .GroupBy(t => new
                {
                    t.Category.CategoryName,
                    t.Category.Color.HexCode
                })
                .Select(g => new ExpenseBreakdownItem
                {
                    CategoryName = g.Key.CategoryName ?? "Khác",
                    Amount = g.Sum(t => t.Amount),
                    ColorHex = g.Key.HexCode ?? "#808080",
                    Percentage = 0
                })
                .ToListAsync();

            var totalExp = expenseBreakdown.Sum(x => x.Amount);
            if (totalExp > 0)
            {
                foreach (var item in expenseBreakdown)
                {
                    item.Percentage = (double)Math.Round((item.Amount / totalExp) * 100, 1);
                }
            }

            // --- 6. RECENT TRANSACTIONS ---
            var recentTransactions = await _context.Transactions
                .AsNoTracking()
                .Where(t => walletIds.Contains(t.WalletID))
                .Include(t => t.Category)
                    .ThenInclude(c => c.Icon)
                .Include(t => t.Category.Color)
                .OrderByDescending(t => t.TransactionDate)
                .Take(5)
                .Select(t => new RecentTransactionItem
                {
                    TransactionID = t.TransactionID,
                    CategoryName = t.Category != null ? t.Category.CategoryName : "Khác",
                    IconClass = t.Category != null && t.Category.Icon != null
                        ? t.Category.Icon.IconClass
                        : "fa-solid fa-circle-question",
                    ColorHex = t.Category != null && t.Category.Color != null
                        ? t.Category.Color.HexCode
                        : "#999",
                    TransactionDate = t.TransactionDate,
                    Description = t.Description,
                    Amount = t.Amount,
                    Type = t.Type
                })
                .ToListAsync();

            // --- 7. BALANCE TRENDS ---
            var balanceTrends = new List<BalanceTrendItem>();
            var startDay = now.AddDays(-(days - 1)).Date;

            var allTransactionsBeforeNow = await _context.Transactions
                .AsNoTracking()
                .Where(t => walletIds.Contains(t.WalletID))
                .OrderBy(t => t.TransactionDate)
                .ToListAsync();

            string dateFormat = days <= 30 ? "d MMM" : "MMM yyyy";
            int step = days <= 30 ? 1 : Math.Max(1, days / 12);

            for (int i = 0; i < days; i += step)
            {
                var targetDate = startDay.AddDays(i);

                var balanceAtDate = allTransactionsBeforeNow
                    .Where(t => t.TransactionDate.Date <= targetDate)
                    .Sum(t => t.Type == "Income" ? t.Amount : -t.Amount);

                balanceTrends.Add(new BalanceTrendItem
                {
                    Date = targetDate.ToString(dateFormat, new System.Globalization.CultureInfo("vi-VN")),
                    Balance = balanceAtDate
                });
            }

            if (balanceTrends.Count == 0 || balanceTrends.Last().Date != now.ToString(dateFormat, new System.Globalization.CultureInfo("vi-VN")))
            {
                balanceTrends.Add(new BalanceTrendItem
                {
                    Date = now.ToString(dateFormat, new System.Globalization.CultureInfo("vi-VN")),
                    Balance = totalBalance
                });
            }

            // --- 8. INCOME VS EXPENSES ---
            var incomeVsExpenses = new List<IncomeVsExpenseItem>();
            var startDate = now.AddDays(-(days - 1)).Date;

            string labelFormat;
            int groupStep;

            if (days <= 7)
            {
                labelFormat = "dd/MM";
                groupStep = 1;
            }
            else if (days <= 30)
            {
                labelFormat = "dd/MM";
                groupStep = 3;
            }
            else if (days <= 90)
            {
                labelFormat = "dd/MM";
                groupStep = 7;
            }
            else
            {
                labelFormat = "MM/yyyy";
                groupStep = 30;
            }

            for (int i = 0; i < days; i += groupStep)
            {
                var periodStart = startDate.AddDays(i);
                var periodEnd = startDate.AddDays(Math.Min(i + groupStep, days));

                var income = await _context.Transactions
                    .AsNoTracking()
                    .Where(t => walletIds.Contains(t.WalletID) &&
                                t.Type == "Income" &&
                                t.TransactionDate >= periodStart &&
                                t.TransactionDate < periodEnd)
                    .SumAsync(t => (decimal?)t.Amount) ?? 0;

                var expense = await _context.Transactions
                    .AsNoTracking()
                    .Where(t => walletIds.Contains(t.WalletID) &&
                                t.Type == "Expense" &&
                                t.TransactionDate >= periodStart &&
                                t.TransactionDate < periodEnd)
                    .SumAsync(t => (decimal?)t.Amount) ?? 0;

                incomeVsExpenses.Add(new IncomeVsExpenseItem
                {
                    Label = periodStart.ToString(labelFormat),
                    Income = income,
                    Expense = expense
                });
            }

            // ✅ 9. SAVING GOALS (Lấy 4 Goals gần nhất)
            var savingGoals = await _context.Goals
                .AsNoTracking()
                .Where(g => g.UserID == userId)
                .OrderByDescending(g => g.CreatedAt)
                .Take(4)
                .Select(g => new SavingGoalItem
                {
                    GoalID = g.GoalID,
                    GoalName = g.GoalName,
                    TargetAmount = g.TargetAmount,
                    CurrentAmount = g.CurrentAmount,
                    ProgressPercentage = g.TargetAmount > 0
                        ? (int)Math.Round((g.CurrentAmount / g.TargetAmount) * 100)
                        : 0
                })
                .ToListAsync();

            return new DashboardViewModel
            {
                TotalBalance = totalBalance,
                MonthlyIncome = monthlyIncome,
                MonthlyExpenses = monthlyExpenses,
                LastMonthBalance = lastMonthBalance,
                LastMonthIncome = lastMonthIncome,
                LastMonthExpenses = lastMonthExpenses,
                IsNewUser = isNewUser,
                ExpenseBreakdown = expenseBreakdown,
                RecentTransactions = recentTransactions,
                BalanceTrends = balanceTrends,
                IncomeVsExpenses = incomeVsExpenses,
                SavingGoals = savingGoals  // ✅ THÊM MỚI
            };
        }
    }
}