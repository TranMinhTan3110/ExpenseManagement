using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu_WebApp.Services;
using System;
using System.Threading.Tasks;
using System.Text.Json;

namespace QuanLyChiTieu_WebApp.Controllers
{
    [Authorize(Roles = "Admin")]
    public class DashBoardADController : Controller
    {
        private readonly IDashBoardADService _dashBoardADService;

        public DashBoardADController(IDashBoardADService dashBoardADService1)
        {
            _dashBoardADService = dashBoardADService1;
        }

        public async Task<IActionResult> Index(string viewType = "day", int? year = null)
        {
            // Lấy số liệu
            var userCount = await _dashBoardADService.GetAmountUsers();
            var transactionCount = await _dashBoardADService.GetAmountTransactions();
            var pendingTicketCount = await _dashBoardADService.GetPendingTickets();
            var totalTicketCount = await _dashBoardADService.GetTotalTickets();

            // Lấy % tăng trưởng
            var userGrowth = await _dashBoardADService.GetUserGrowthPercentage();
            var transGrowth = await _dashBoardADService.GetTransactionGrowthPercentage();

            // Lấy dữ liệu biểu đồ theo loại hiển thị
            System.Collections.Generic.Dictionary<string, int> chartData;
            string chartTitle;

            int selectedYear = year ?? DateTime.Now.Year;

            switch (viewType.ToLower())
            {
                case "month":
                    chartData = await _dashBoardADService.GetUserChartDataByMonth(selectedYear);
                    chartTitle = $"Biểu đồ tăng trưởng user theo tháng năm {selectedYear}";
                    ViewBag.ChartSubtitle = $"Thống kê số lượng người dùng 12 tháng năm {selectedYear}";
                    break;

                case "year":
                    int startYear = selectedYear - 4; // Hiển thị 5 năm
                    chartData = await _dashBoardADService.GetUserChartDataByYear(startYear, 5);
                    chartTitle = "Biểu đồ tăng trưởng user theo năm";
                    ViewBag.ChartSubtitle = $"Thống kê số lượng người dùng từ {startYear} đến {selectedYear}";
                    break;

                default: // day
                    chartData = await _dashBoardADService.GetUserChartData();
                    chartTitle = "Biểu đồ tăng trưởng user theo ngày";
                    ViewBag.ChartSubtitle = "Thống kê số lượng người dùng 7 ngày gần nhất";
                    break;
            }

            ViewBag.UserCount = userCount;
            ViewBag.TransactionCount = transactionCount;
            ViewBag.PendingTicketCount = pendingTicketCount;
            ViewBag.TotalTicketCount = totalTicketCount;
            ViewBag.UserGrowth = userGrowth;
            ViewBag.TransGrowth = transGrowth;
            ViewBag.ChartLabels = JsonSerializer.Serialize(chartData.Keys);
            ViewBag.ChartData = JsonSerializer.Serialize(chartData.Values);
            ViewBag.ChartTitle = chartTitle;
            ViewBag.ViewType = viewType;
            ViewBag.SelectedYear = selectedYear;
            ViewBag.LastMonthUserCount = await _dashBoardADService.GetUserCountInMonth(DateTime.Now.AddMonths(-1));
            ViewBag.LastMonthTransactionCount = await _dashBoardADService.GetTransactionCountInMonth(DateTime.Now.AddMonths(-1));

            return View();
        }
    }
}