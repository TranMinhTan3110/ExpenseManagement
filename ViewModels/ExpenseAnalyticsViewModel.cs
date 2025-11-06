namespace QuanLyChiTieu_WebApp.ViewModels
{
    // ViewModel chính trả về cho client
    public class ExpenseAnalyticsViewModel
    {
        public List<ExpenseBreakdownItem> ExpenseBreakdown { get; set; } = new();
        public List<TransactionDto> TransactionHistory { get; set; } = new();
        public decimal TotalExpense { get; set; }
        public string SelectedMonth { get; set; }
    }

    // Item cho biểu đồ Pie Chart
    public class ExpenseBreakdownItem
    {
        public string CategoryName { get; set; }
        public decimal Amount { get; set; }
        public double Percentage { get; set; }
        public string ColorHex { get; set; }
    }

    // DTO cho Transaction (tránh circular reference)
    public class TransactionDto
    {
        public int TransactionID { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; }
        public CategoryDto Category { get; set; }
    }

    // DTO cho Category
    public class CategoryDto
    {
        public int CategoryID { get; set; }
        public string CategoryName { get; set; }
        public IconDto Icon { get; set; }
        public ColorDto Color { get; set; }
    }

    // DTO cho Icon
    public class IconDto
    {
        public int IconID { get; set; }
        public string IconClass { get; set; }
    }

    // DTO cho Color
    public class ColorDto
    {
        public int ColorID { get; set; }
        public string HexCode { get; set; }
    }
}