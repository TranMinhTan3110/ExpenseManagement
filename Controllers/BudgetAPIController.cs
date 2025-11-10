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
            var budget = await _context.Budgets.FindAsync(id);
            if (budget == null) return NotFound();

            return Ok(budget);
        }

        // POST: api/budgetapi
        [HttpPost]
        public async Task<IActionResult> CreateBudget([FromBody] Budget model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Budgets.Add(model);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBudgetById), new { id = model.BudgetID }, model);
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
                var budget = await _context.Budgets
                    .Include(b => b.Category)
                    .FirstOrDefaultAsync(b => b.BudgetID == budgetId);

                if (budget == null)
                    return NotFound();

                // Default date range
                var start = startDate ?? budget.StartDate;
                var end = endDate ?? budget.EndDate;

                var transactions = await _context.Transactions
                    .Where(t => t.CategoryID == budget.CategoryID
                             && t.UserID == budget.UserID
                             && t.TransactionDate >= start
                             && t.TransactionDate <= end)
                    .OrderBy(t => t.TransactionDate)
                    .Select(t => new
                    {
                        t.Amount,
                        t.TransactionDate
                    })
                    .ToListAsync();

                // Group transactions based on groupBy parameter
                var groupedData = groupBy.ToLower() switch
                {
                    "day" => transactions
                        .GroupBy(t => t.TransactionDate.Date)
                        .Select(g => new
                        {
                            Label = g.Key.ToString("dd/MM/yyyy"),
                            Date = g.Key,
                            Amount = g.Sum(x => x.Amount)
                        })
                        .OrderBy(x => x.Date)
                        .ToList(),

                    "week" => transactions
                        .GroupBy(t => GetWeekOfYear(t.TransactionDate))
                        .Select(g => new
                        {
                            Label = $"Tuần {g.Key.Week}/{g.Key.Year}",
                            Date = g.Min(x => x.TransactionDate),
                            Amount = g.Sum(x => x.Amount)
                        })
                        .OrderBy(x => x.Date)
                        .ToList(),

                    "month" => transactions
                        .GroupBy(t => new { t.TransactionDate.Year, t.TransactionDate.Month })
                        .Select(g => new
                        {
                            Label = $"Tháng {g.Key.Month}/{g.Key.Year}",
                            Date = new DateTime(g.Key.Year, g.Key.Month, 1),
                            Amount = g.Sum(x => x.Amount)
                        })
                        .OrderBy(x => x.Date)
                        .ToList(),

                    _ => transactions
                        .GroupBy(t => t.TransactionDate.Date)
                        .Select(g => new
                        {
                            Label = g.Key.ToString("dd/MM/yyyy"),
                            Date = g.Key,
                            Amount = g.Sum(x => x.Amount)
                        })
                        .OrderBy(x => x.Date)
                        .ToList()
                };

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
    }


}
