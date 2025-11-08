using System;
using System.ComponentModel.DataAnnotations;

namespace QuanLyChiTieu_WebApp.ViewModels
{
    public class CreateTransactionViewModel
    {
        // 1. Dùng cho ô "Số tiền" (name="Amount")
        [Required(ErrorMessage = "Vui lòng nhập số tiền")]
        [Range(1, double.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0")]
        public decimal Amount { get; set; }

        // 2. Dùng cho 2 nút "Chi tiêu" / "Thu nhập" (name="Type")
        [Required(ErrorMessage = "Vui lòng chọn loại giao dịch")]
        public string Type { get; set; } // Sẽ nhận "Income" hoặc "Expense"

        // 3. Dùng cho ô "Danh mục" (name="CategoryID")
        [Required(ErrorMessage = "Vui lòng chọn danh mục")]
        public int CategoryID { get; set; }

        // 4. Dùng cho ô "Từ ví" (name="WalletID")
        [Required(ErrorMessage = "Vui lòng chọn ví")]
        public int WalletID { get; set; }

        // 5. Dùng cho ô "Ngày giao dịch" (name="TransactionDate")
        [Required(ErrorMessage = "Vui lòng chọn ngày")]
        public DateTime TransactionDate { get; set; }

        // 6. Dùng cho ô "Ghi chú" (name="Description") - (Tùy chọn)
        [StringLength(255, ErrorMessage = "Ghi chú không được quá 255 ký tự")]
        public string Description { get; set; }
    }
}