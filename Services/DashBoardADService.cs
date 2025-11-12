using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuanLyChiTieu_WebApp.Services
{
    public class DashBoardADService : IDashBoardADService
    {
        ApplicationDbContext _context;
        public DashBoardADService(ApplicationDbContext context)
        {
            _context = context;
        }

        public Task<int> GetAmountTransactions()
        {
            return _context.Transactions.CountAsync();
        }

        public Task<int> GetAmountUsers()
        {
            return _context.Users.Where(t => t.Role == "User").CountAsync();
        }

        public Task<int> GetPendingTickets()
        {
            return _context.Tickets.Where(t => t.Status == "Pending").CountAsync();
        }

        public Task<int> GetTotalTickets()
        {
            return _context.Tickets.CountAsync();
        }

        public async Task<double> GetUserGrowthPercentage()
        {
            var now = DateTime.Now;
            var startOfThisMonth = new DateTime(now.Year, now.Month, 1);
            var startOfLastMonth = startOfThisMonth.AddMonths(-1);

            var thisMonthCount = await _context.Users
                .Where(u => u.Role == "User" &&
                           u.CreatedAt >= startOfThisMonth &&
                           u.CreatedAt < startOfThisMonth.AddMonths(1))
                .CountAsync();

            var lastMonthCount = await _context.Users
                .Where(u => u.Role == "User" &&
                           u.CreatedAt >= startOfLastMonth &&
                           u.CreatedAt < startOfThisMonth)
                .CountAsync();

            if (lastMonthCount == 0)
            {
                return thisMonthCount;
            }

            return Math.Round(((double)(thisMonthCount - lastMonthCount) / lastMonthCount) * 100, 1);
        }

        public async Task<double> GetTransactionGrowthPercentage()
        {
            var now = DateTime.Now;
            var startOfThisMonth = new DateTime(now.Year, now.Month, 1);
            var startOfLastMonth = startOfThisMonth.AddMonths(-1);

            var thisMonthCount = await _context.Transactions
                .Where(t => t.CreatedAt >= startOfThisMonth && t.CreatedAt < startOfThisMonth.AddMonths(1))
                .CountAsync();

            var lastMonthCount = await _context.Transactions
                .Where(t => t.CreatedAt >= startOfLastMonth && t.CreatedAt < startOfThisMonth)
                .CountAsync();

            if (lastMonthCount == 0)
            {
                if (thisMonthCount == 0) return 0;
                return thisMonthCount;
            }

            return Math.Round(((double)(thisMonthCount - lastMonthCount) / lastMonthCount) * 100, 1);
        }

        // Lấy dữ liệu Users theo 7 ngày gần nhất
        public async Task<Dictionary<string, int>> GetUserChartData()
        {
            var result = new Dictionary<string, int>();
            var today = DateTime.Now.Date;

            for (int i = 6; i >= 0; i--)
            {
                var date = today.AddDays(-i);
                var count = await _context.Users
                    .Where(u => u.Role == "User" && u.CreatedAt.Date <= date)
                    .CountAsync();

                result.Add(date.ToString("dd/MM"), count);
            }

            return result;
        }

        public async Task<int> GetUserCountInMonth(DateTime month)
        {
            var start = new DateTime(month.Year, month.Month, 1);
            var end = start.AddMonths(1);

            return await _context.Users
                .Where(u => u.Role == "User" && u.CreatedAt >= start && u.CreatedAt < end)
                .CountAsync();
        }

        public async Task<int> GetTransactionCountInMonth(DateTime month)
        {
            var start = new DateTime(month.Year, month.Month, 1);
            var end = start.AddMonths(1);

            return await _context.Transactions
                .Where(t => t.CreatedAt >= start && t.CreatedAt < end)
                .CountAsync();
        }

        // Lấy dữ liệu Users theo tháng trong 1 năm
        public async Task<Dictionary<string, int>> GetUserChartDataByMonth(int year)
        {
            var result = new Dictionary<string, int>();

            for (int month = 1; month <= 12; month++)
            {
                var startOfMonth = new DateTime(year, month, 1);
                var endOfMonth = startOfMonth.AddMonths(1);

                var count = await _context.Users
                    .Where(u => u.Role == "User" &&
                               u.CreatedAt >= startOfMonth &&
                               u.CreatedAt < endOfMonth)
                    .CountAsync();

                result.Add($"T{month}", count);
            }

            return result;
        }

        // Lấy dữ liệu Users theo năm
        public async Task<Dictionary<string, int>> GetUserChartDataByYear(int startYear, int numberOfYears)
        {
            var result = new Dictionary<string, int>();

            for (int i = 0; i < numberOfYears; i++)
            {
                int year = startYear + i;
                var startOfYear = new DateTime(year, 1, 1);
                var endOfYear = new DateTime(year + 1, 1, 1);

                var count = await _context.Users
                    .Where(u => u.Role == "User" &&
                               u.CreatedAt >= startOfYear &&
                               u.CreatedAt < endOfYear)
                    .CountAsync();

                result.Add(year.ToString(), count);
            }

            return result;
        }
    }
}