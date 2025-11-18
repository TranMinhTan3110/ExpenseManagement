using System;
using System.Collections.Generic;

namespace QuanLyChiTieu_WebApp.ViewModels
{
    // ViewModel chính trả về cho client
    public class IncomeAnalyticsViewModel
    {
        public List<IncomeBreakdownItem> IncomeBreakdown { get; set; } = new();
        public List<IncomeTransactionDto> TransactionHistory { get; set; } = new();
        public decimal TotalIncome { get; set; }
        public string SelectedMonth { get; set; }
        // ✅ Thêm các property cho phân trang
        public int CurrentPage { get; set; } = 1;
        public int TotalPages { get; set; } = 0;
        public int TotalRecords { get; set; } = 0;
    }

    // Item cho Pie Chart (thu nhập)
    public class IncomeBreakdownItem
    {
        public string CategoryName { get; set; }
        public decimal Amount { get; set; }
        public double Percentage { get; set; }
        public string ColorHex { get; set; }
    }

    // DTO Transaction cho thu nhập
    public class IncomeTransactionDto
    {
        public int TransactionID { get; set; }
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; }

        public CategoryDto Category { get; set; }
    }
}
