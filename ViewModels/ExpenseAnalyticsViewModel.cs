namespace QuanLyChiTieu_WebApp.ViewModels
{
    public class ExpenseAnalyticsViewModel
    {
        public List<ExpenseBreakdownItem> ExpenseBreakdown { get; set; } = new();
        public List<TransactionDto> TransactionHistory { get; set; } = new();
        public decimal TotalExpense { get; set; }
        public string SelectedMonth { get; set; } = string.Empty;

        // ✅ Thêm các property cho phân trang
        public int CurrentPage { get; set; } = 1;
        public int TotalPages { get; set; } = 0;
        public int TotalRecords { get; set; } = 0;
    }

    public class ExpenseBreakdownItem1
    {
        public string CategoryName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public double Percentage { get; set; }
        public string ColorHex { get; set; } = "#808080";
    }

    public class TransactionDto
    {
        public int TransactionID { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public CategoryDto? Category { get; set; }
    }

    public class CategoryDto
    {
        public int CategoryID { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public IconDto? Icon { get; set; }
        public ColorDto? Color { get; set; }
    }

    public class IconDto
    {
        public int IconID { get; set; }
        public string IconClass { get; set; } = string.Empty;
    }

    public class ColorDto
    {
        public int ColorID { get; set; }
        public string HexCode { get; set; } = string.Empty;
    }

    // ============= INCOME =============
    //public class IncomeAnalyticsViewModel
    //{
    //    public List<IncomeBreakdownItem> IncomeBreakdown { get; set; } = new();
    //    public List<IncomeTransactionDto> TransactionHistory { get; set; } = new();
    //    public decimal TotalIncome { get; set; }
    //    public string SelectedMonth { get; set; } = string.Empty;

    //    // ✅ Thêm các property cho phân trang
    //    public int CurrentPage { get; set; } = 1;
    //    public int TotalPages { get; set; } = 0;
    //    public int TotalRecords { get; set; } = 0;
    //}

    //public class IncomeBreakdownItem
    //{
    //    public string CategoryName { get; set; } = string.Empty;
    //    public decimal Amount { get; set; }
    //    public double Percentage { get; set; }
    //    public string ColorHex { get; set; } = "#4caf50";
    //}

    //public class IncomeTransactionDto
    //{
    //    public int TransactionID { get; set; }
    //    public decimal Amount { get; set; }
    //    public DateTime TransactionDate { get; set; }
    //    public string Description { get; set; } = string.Empty;
    //    public CategoryDto? Category { get; set; }
    //}
}