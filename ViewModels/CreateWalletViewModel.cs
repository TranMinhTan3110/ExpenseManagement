using System.ComponentModel.DataAnnotations;

namespace QuanLyChiTieu_WebApp.ViewModels
{
    public class CreateWalletViewModel
    {
        [Required(ErrorMessage = "Tên ví là bắt buộc")]
        public string WalletName { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập số dư")]
        [Range(0, double.MaxValue, ErrorMessage = "Số dư không thể âm")]
        public decimal InitialBalance { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn loại ví")]
        public string WalletType { get; set; }
    }
}
