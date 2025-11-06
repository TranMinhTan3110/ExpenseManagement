using QuanLyChiTieu_WebApp.Models.Entities;
namespace QuanLyChiTieu_WebApp.ViewModels
{
    public class ExpenseAnalyticsViewModel
    {
        public List<ExpenseBreakdownItem> ExpenseBreakdown { get; set; }
        public List<Transaction> TransactionHistory { get; set; }
        public decimal TotalExpense { get; set; }
        public string SelectedMonth { get; set; }
    }

    public class ExpenseBreakdownItem
    {
        public string CategoryName { get; set; }
        public decimal Amount { get; set; }
        public double Percentage { get; set; }
        public string ColorHex { get; set; }
    }
}