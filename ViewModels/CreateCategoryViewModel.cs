using System.ComponentModel.DataAnnotations;

namespace QuanLyChiTieu_WebApp.Models.ViewModels
{
    public class CreateCategoryViewModel
    {
        [Required(ErrorMessage = "Vui lòng nhập tên")]
        public string CategoryName { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn loại")]
        public string Type { get; set; } // "Income" hoặc "Expense"

        [Required(ErrorMessage = "Vui lòng chọn Icon")]
        public int IconID { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn Màu")]
        public int ColorID { get; set; }
    }
}