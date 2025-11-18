using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.Services;
using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BudgetApiController : ControllerBase
    {
        private readonly BudgetService _budgetService;
        private readonly ApplicationDbContext _context;

        public BudgetApiController(BudgetService budgetService, ApplicationDbContext context)
        {
            _budgetService = budgetService;
            _context = context;
        }

        // GET: api/budgetapi/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetBudgetsByUser(string userId)
        {
            var budgets = await _budgetService.GetBudgetsByUserAsync(userId);
            return Ok(budgets);
        }

        // GET: api/budgetapi/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBudgetById(int id)
        {
            var budget = await _context.Budgets
                .Include(b => b.Category)
                    .ThenInclude(c => c.Icon)
                .Include(b => b.Category)
                    .ThenInclude(c => c.Color) // ✅ Include Color navigation property
                .FirstOrDefaultAsync(b => b.BudgetID == id);

            if (budget == null)
                return NotFound();

            // ✅ Map sang BudgetViewModel
            var viewModel = new BudgetViewModel
            {
                BudgetID = budget.BudgetID,
                CategoryID = budget.CategoryID,
                CategoryName = budget.Category?.CategoryName ?? "N/A",
                CategoryIcon = budget.Category?.Icon?.IconClass ?? "fi fi-rr-wallet",
                CategoryColor = budget.Category?.Color?.HexCode ?? "#6c757d", // ✅ Lấy HexCode từ Color
                BudgetAmount = budget.BudgetAmount,
                SpentAmount = 0, // Tạm thời để 0, có thể tính sau
                RemainingAmount = budget.BudgetAmount,
                Percentage = 0,
                StartDate = budget.StartDate,
                EndDate = budget.EndDate,
                CreatedAt = budget.CreatedAt,
                IsRecurring = budget.IsRecurring // ✅ Field quan trọng!
            };

            return Ok(viewModel);
        }

        // POST: api/budgetapi
        [HttpPost]
        public async Task<IActionResult> CreateBudget([FromBody] Budget model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra hợp lệ
            if (model.StartDate > model.EndDate)
                return BadRequest("StartDate must be earlier than EndDate.");

            model.CreatedAt = DateTime.Now;

            _context.Budgets.Add(model);
            await _context.SaveChangesAsync();

            return Ok(model);
        }


        // PUT: api/budgetapi/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBudget(int id, [FromBody] Budget model)
        {
            if (id != model.BudgetID)
                return BadRequest("ID không khớp");

            var existing = await _context.Budgets.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.CategoryID = model.CategoryID;
            existing.BudgetAmount = model.BudgetAmount;
            existing.StartDate = model.StartDate;
            existing.EndDate = model.EndDate;
            existing.IsRecurring = model.IsRecurring; // ✅ THÊM DÒNG NÀY

            _context.Budgets.Update(existing);
            await _context.SaveChangesAsync();

            return Ok(existing);
        }

        // DELETE: api/budgetapi/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBudget(int id)
        {
            var budget = await _context.Budgets.FindAsync(id);
            if (budget == null)
                return NotFound();

            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Thêm endpoint GET không cần userId trong URL
        [HttpGet]
        public async Task<IActionResult> GetBudgets([FromQuery] string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("UserID is required");

            var budgets = await _budgetService.GetBudgetsByUserAsync(userId);
            return Ok(budgets);
        }

        // Controllers/BudgetApiController.cs
        [HttpGet("transactions/{budgetId}")]
        public async Task<IActionResult> GetBudgetTransactions(int budgetId)
        {
            try
            {
                var budget = await _context.Budgets
                    .Include(b => b.Category)
                    .FirstOrDefaultAsync(b => b.BudgetID == budgetId);

                if (budget == null)
                    return NotFound();

                var transactions = await _context.Transactions
                    .Where(t => t.CategoryID == budget.CategoryID
                             && t.UserID == budget.UserID
                             && t.TransactionDate >= budget.StartDate
                             && t.TransactionDate <= budget.EndDate)
                    .OrderByDescending(t => t.TransactionDate)
                    .Take(10) // Lấy 10 transactions gần nhất
                    .Select(t => new
                    {
                        t.TransactionID,
                        t.Amount,
                        t.TransactionDate,
                        t.Description,
                        t.Type
                    })
                    .ToListAsync();

                return Ok(transactions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // Controllers/BudgetApiController.cs
        [HttpGet("spending-analysis/{budgetId}")]
        public async Task<IActionResult> GetSpendingAnalysis(
            int budgetId,
            [FromQuery] string groupBy = "day", // day, week, month
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                Console.WriteLine($"🔍 Getting spending analysis for BudgetID: {budgetId}");

                var budget = await _context.Budgets
                    .Include(b => b.Category)
                    .FirstOrDefaultAsync(b => b.BudgetID == budgetId);

                if (budget == null)
                {
                    Console.WriteLine($"❌ Budget {budgetId} not found");
                    return NotFound();
                }

                // ✅ QUAN TRỌNG: Chuyển về Date only (không có time) để so sánh chính xác
                var start = (startDate ?? budget.StartDate).Date;
                var end = (endDate ?? budget.EndDate).Date.AddDays(1).AddTicks(-1); // Cuối ngày (23:59:59.999)

                Console.WriteLine($"📅 Date range: {start:yyyy-MM-dd} to {end:yyyy-MM-dd}");
                Console.WriteLine($"📂 CategoryID: {budget.CategoryID}, UserID: {budget.UserID}");

                // ✅ FIX: Thêm điều kiện lọc Type = "Expense"
                var transactions = await _context.Transactions
                    .Where(t => t.CategoryID == budget.CategoryID
                             && t.UserID == budget.UserID
                             && t.TransactionDate >= start
                             && t.TransactionDate <= end
                             && t.Type.ToLower().Contains("expense")) // ✅ CHỈ LẤY EXPENSE
                    .OrderBy(t => t.TransactionDate)
                    .Select(t => new
                    {
                        t.Amount,
                        t.TransactionDate
                    })
                    .ToListAsync();

                Console.WriteLine($"📊 Found {transactions.Count} transactions");

                // Group transactions based on groupBy parameter
                var groupedData = groupBy.ToLower() switch
                {
                    "day" => transactions
                        .GroupBy(t => t.TransactionDate.Date)
                        .Select(g => new
                        {
                            label = g.Key.ToString("dd/MM/yyyy"), // ✅ Format VN
                            date = g.Key,
                            amount = g.Sum(x => x.Amount)
                        })
                        .OrderBy(x => x.date)
                        .ToList(),

                    "week" => transactions
                        .GroupBy(t => GetWeekOfYear(t.TransactionDate))
                        .Select(g => new
                        {
                            label = $"Tuần {g.Key.Week}/{g.Key.Year}",
                            date = g.Min(x => x.TransactionDate),
                            amount = g.Sum(x => x.Amount)
                        })
                        .OrderBy(x => x.date)
                        .ToList(),

                    "month" => transactions
                        .GroupBy(t => new { t.TransactionDate.Year, t.TransactionDate.Month })
                        .Select(g => new
                        {
                            label = $"Tháng {g.Key.Month}/{g.Key.Year}",
                            date = new DateTime(g.Key.Year, g.Key.Month, 1),
                            amount = g.Sum(x => x.Amount)
                        })
                        .OrderBy(x => x.date)
                        .ToList(),

                    _ => transactions
                        .GroupBy(t => t.TransactionDate.Date)
                        .Select(g => new
                        {
                            label = g.Key.ToString("dd/MM/yyyy"),
                            date = g.Key,
                            amount = g.Sum(x => x.Amount)
                        })
                        .OrderBy(x => x.date)
                        .ToList()
                };

                Console.WriteLine($"📈 Grouped into {groupedData.Count} data points");

                return Ok(new
                {
                    groupBy = groupBy,
                    startDate = start,
                    endDate = end,
                    data = groupedData
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // Helper method to get week of year
        private static (int Week, int Year) GetWeekOfYear(DateTime date)
        {
            var culture = System.Globalization.CultureInfo.CurrentCulture;
            var calendar = culture.Calendar;
            var weekRule = culture.DateTimeFormat.CalendarWeekRule;
            var firstDayOfWeek = culture.DateTimeFormat.FirstDayOfWeek;

            var week = calendar.GetWeekOfYear(date, weekRule, firstDayOfWeek);
            var year = date.Year;

            // Handle week 53 wrapping to next year
            if (week == 53 && date.Month == 1)
                year--;

            return (week, year);
        }
        // POST: api/budgetapi/handle-recurring
        [HttpPost("handle-recurring")]
        public async Task<IActionResult> HandleRecurringBudgets([FromQuery] string userId)
        {
            try
            {
                var now = DateTime.Now;

                //  Lấy TẤT CẢ budgets đã hết hạn (cả recurring và non-recurring)
                var expiredBudgets = await _context.Budgets
                    .Where(b => b.UserID == userId && b.EndDate <= now)
                    .ToListAsync();

                Console.WriteLine($"Found {expiredBudgets.Count} expired budgets");

                foreach (var oldBudget in expiredBudgets)
                {
                    if (oldBudget.IsRecurring)
                    {
                        // Tạo budget mới cho recurring
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
                        Console.WriteLine($"Created new recurring budget for category {oldBudget.CategoryID}");
                    }

                    // ✅ Xóa budget cũ (cả recurring và non-recurring)
                    _context.Budgets.Remove(oldBudget);
                    Console.WriteLine($"Removed expired budget ID: {oldBudget.BudgetID}");
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Recurring budgets handled successfully",
                    processedCount = expiredBudgets.Count,
                    deleted = expiredBudgets.Count(b => !b.IsRecurring),
                    recreated = expiredBudgets.Count(b => b.IsRecurring)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }


}
