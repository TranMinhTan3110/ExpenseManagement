// Services/BudgetService.cs
using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Services
{
    public class BudgetService
    {
        private readonly ApplicationDbContext _context;

        public BudgetService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<BudgetViewModel>> GetBudgetsByUserAsync(string userId)
        {
            var budgets = await _context.Budgets
                .Include(b => b.Category)
                    .ThenInclude(c => c.Icon)
                .Include(b => b.Category)
                    .ThenInclude(c => c.Color)
                .Where(b => b.UserID == userId && b.Category.Type == "Expense")
                .Select(b => new BudgetViewModel
                {
                    BudgetID = b.BudgetID,
                    CategoryID = b.CategoryID,
                    CategoryName = b.Category.CategoryName,
                    CategoryIcon = b.Category.Icon.IconClass,
                    CategoryColor = b.Category.Color.HexCode,
                    BudgetAmount = b.BudgetAmount,
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    IsRecurring = b.IsRecurring,
                    // Tính tổng chi tiêu trong khoảng thời gian
                    SpentAmount = _context.Transactions
                        .Where(t => t.CategoryID == b.CategoryID
                                 && t.UserID == userId
                                 && t.TransactionDate >= b.StartDate
                                 && t.TransactionDate <= b.EndDate)
                        .Sum(t => (decimal?)t.Amount) ?? 0,
                    CreatedAt = b.CreatedAt
                })
                .OrderBy(b => b.CategoryName)
                .ToListAsync();

            // Tính phần trăm
            foreach (var budget in budgets)
            {
                budget.Percentage = budget.BudgetAmount > 0
                    ? (int)((budget.SpentAmount / budget.BudgetAmount) * 100)
                    : 0;

                budget.RemainingAmount = budget.BudgetAmount - budget.SpentAmount;
            }

            return budgets;
        }

        // ==============================================================
        //  Xử lý ngân sách lặp lại theo chu kỳ
        // ==============================================================
        private async Task HandleRecurringBudgetsAsync(string userId)
        {
            var now = DateTime.Now;

            var expiredBudgets = await _context.Budgets
                .Where(b => b.UserID == userId && b.IsRecurring && b.EndDate <= now)
                .ToListAsync();

            foreach (var oldBudget in expiredBudgets)
            {
                var duration = oldBudget.EndDate - oldBudget.StartDate;

                var newBudget = new Budget
                {
                    UserID = oldBudget.UserID,
                    CategoryID = oldBudget.CategoryID,
                    BudgetAmount = oldBudget.BudgetAmount,
                    StartDate = oldBudget.EndDate,
                    EndDate = oldBudget.EndDate.Add(duration),
                    IsRecurring = true,
                    CreatedAt = DateTime.Now,


                };

                _context.Budgets.Add(newBudget);
                _context.Budgets.Remove(oldBudget); // ✅ xóa ngân sách cũ sau khi hết hạn
            }

            await _context.SaveChangesAsync();
        }
    }
}