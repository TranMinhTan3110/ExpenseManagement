using QuanLyChiTieu_WebApp.Models.Entities;
using System.Collections.Generic;

namespace QuanLyChiTieu_WebApp.Models.ViewModels
{
   
    public class WalletDetailsViewModel
    {
        public int WalletId { get; set; }
        public string WalletName { get; set; } // Ví dụ: "City Bank"
        public decimal TotalBalance { get; set; } // Ví dụ: 432,568
        public decimal MonthlyExpenses { get; set; } // Ví dụ: 850.50

        // Dữ liệu cho biểu đồ tròn
        public List<PieChartSliceViewModel> ExpenseBreakdown { get; set; }

        // Dữ liệu cho bảng lịch sử
        public List<Transaction> TransactionHistory { get; set; }
    }

    // Bạn cũng cần class này cho biểu đồ tròn
    // (Bạn có thể đặt nó trong cùng file hoặc file riêng)
    public class PieChartSliceViewModel
    {
        public string CategoryName { get; set; }
        public decimal Amount { get; set; }
        public string ColorHex { get; set; } // Mã màu của category
    }
}