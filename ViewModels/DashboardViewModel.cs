namespace QuanLyChiTieu_WebApp.ViewModels
{
    public class DashboardViewModel
    {
        // --- 3 Ô Trên Cùng ---
        public decimal TotalBalance { get; set; }
        public decimal MonthlyIncome { get; set; }
        public decimal MonthlyExpenses { get; set; }

        // So sánh tháng trước
        public decimal LastMonthBalance { get; set; }
        public decimal LastMonthIncome { get; set; }
        public decimal LastMonthExpenses { get; set; }
        public bool IsNewUser { get; set; }

       
        public List<IncomeVsExpenseItem> IncomeVsExpenses { get; set; } = new();
        public List<SavingGoalItem> SavingGoals { get; set; } = new ();


        // ✅ Tính % thay đổi (CHỈ NẾU KHÔNG PHẢI USER MỚI)
        public double BalanceChangePercent => IsNewUser ? 0 : CalculateChangePercent(TotalBalance, LastMonthBalance);
        public double IncomeChangePercent => IsNewUser ? 0 : CalculateChangePercent(MonthlyIncome, LastMonthIncome);
        public double ExpenseChangePercent => IsNewUser ? 0 : CalculateChangePercent(MonthlyExpenses, LastMonthExpenses);

        // --- Biểu Đồ Balance Trends ---
        public List<BalanceTrendItem> BalanceTrends { get; set; } = new();

        // --- Biểu Đồ Expense Breakdown ---
        public List<ExpenseBreakdownItem> ExpenseBreakdown { get; set; } = new();

        // --- Giao Dịch Gần Đây ---
        public List<RecentTransactionItem> RecentTransactions { get; set; } = new();

        // Hàm tính % thay đổi
        private double CalculateChangePercent(decimal current, decimal previous)
        {
            if (previous == 0) return 0;
            return Math.Round(((double)(current - previous) / (double)previous) * 100, 2);
        }
    }

    // --- Sub-classes ---
    public class BalanceTrendItem
    {
        public string Date { get; set; }
        public decimal Balance { get; set; }
    }

    public class ExpenseBreakdownItem
    {
        public string CategoryName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string ColorHex { get; set; } = string.Empty;
        public double Percentage { get; set; }
    }

    public class RecentTransactionItem
    {
        public int TransactionID { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string IconClass { get; set; } = string.Empty;
        public string ColorHex { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty;
    }

    public class IncomeVsExpenseItem
    {
        public string Label { get; set; } = string.Empty;
        public decimal Income { get; set; }
        public decimal Expense { get; set; }
    }
    public class SavingGoalItem
    {
        public int GoalID { get; set; }
        public string GoalName { get; set; } = string.Empty;
        public decimal TargetAmount { get; set; }
        public decimal CurrentAmount { get; set; }
        public int ProgressPercentage { get; set; }
    }
}