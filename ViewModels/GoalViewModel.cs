using QuanLyChiTieu_WebApp.Models.ViewModels;
using System.ComponentModel.DataAnnotations;

namespace QuanLyChiTieu_WebApp.ViewModels
{
    public class GoalViewModel
    {
        public int GoalID { get; set; }
        public string GoalName { get; set; }
        public decimal TargetAmount { get; set; }
        public decimal CurrentAmount { get; set; }
        public string Status { get; set; }
        public DateTime? TargetDate { get; set; }
        public int ProgressPercentage { get; set; }
        public decimal RemainingAmount { get; set; }

        // Thống kê cho từng goal
        public decimal LastMonthSavings { get; set; }


        // Danh sách ví
        public List<WalletContributionViewModel> WalletContributions { get; set; }

        // Lịch sử gửi tiền
        public List<GoalDepositHistoryViewModel> DepositHistory { get; set; }
    }

    public class WalletContributionViewModel
    {
        public string WalletName { get; set; }
        public string WalletType { get; set; }
        public decimal Amount { get; set; }
        public decimal TargetAmount { get; set; }
        public decimal CurrentAmount { get; set; }
        public int ProgressPercentage => TargetAmount > 0
     ? (int)Math.Round((CurrentAmount / TargetAmount) * 100)
     : 0;

        public string IconClass { get; set; }
        public string ColorClass { get; set; }
    }

    public class GoalDepositHistoryViewModel
    {
        public DateTime Date { get; set; }
        public string WalletName { get; set; }
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public decimal Balance { get; set; }
    }

    public class GoalsIndexViewModel
    {
        public List<GoalViewModel> Goals { get; set; }
        public int ActiveGoalId { get; set; }
        public List<WalletDetailsViewModel> Wallets { get; set; }

    }

    public class CreateGoalViewModel
    {
        [Required(ErrorMessage = "Vui lòng nhập tên mục tiêu")]
        [StringLength(100, ErrorMessage = "Tên mục tiêu không được quá 100 ký tự")]
        public string GoalName { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập số tiền mục tiêu")]
        [Range(1, double.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0")]
        public decimal TargetAmount { get; set; }

        public DateTime? TargetDate { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Số tiền ban đầu không được âm")]
        public decimal InitialAmount { get; set; } = 0;
    }
    public class DeleteGoalRequest
    {
        public int Id { get; set; }
    }
}
