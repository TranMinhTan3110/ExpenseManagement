using System.ComponentModel.DataAnnotations;

namespace QuanLyChiTieu_WebApp.ViewModels
{
    public class DepositGoalViewModel
    {
        [Required(ErrorMessage = "Vui lòng chọn mục tiêu")]
        public int GoalID { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn ví")]
        public int WalletID { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập số tiền")]
        [Range(1, double.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0")]
        public decimal Amount { get; set; }

        [StringLength(500, ErrorMessage = "Ghi chú không được quá 500 ký tự")]
        public string Note { get; set; }
    }
}
